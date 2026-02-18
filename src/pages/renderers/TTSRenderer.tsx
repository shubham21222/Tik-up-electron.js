import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

/**
 * TTSRenderer — Browser source overlay for OBS / TikTok Live Studio
 * ──────────────────────────────────────────────────────────────────
 * Connects to the Supabase Realtime channel `tts-{publicToken}` and
 * converts incoming messages to speech using either:
 *   1. ElevenLabs (via edge function) — when voice_provider === "elevenlabs"
 *   2. Browser Web SpeechSynthesis API — fallback / default
 *
 * Message payload format received from the webhook:
 * {
 *   "username": "@viewer_name",
 *   "text": "the chat message to read",
 *   "voice_id": "JBFqnCBsd6RMkjVDRZzb",
 *   "volume": 80,
 *   "speed": 50,
 *   "pitch": 50,
 *   "interrupt": false,
 *   "voice_provider": "elevenlabs" | "browser"
 * }
 */

interface TTSMessage {
  id: string;
  username: string;
  text: string;
  volume: number;
  speed: number;
  pitch: number;
  interrupt: boolean;
  voiceId?: string;
  voiceProvider?: string;
  avatarUrl?: string;
}

const TTSRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [connected, setConnected] = useState(false);
  const [queue, setQueue] = useState<TTSMessage[]>([]);
  const [current, setCurrent] = useState<TTSMessage | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processingRef = useRef(false);
  const recentMsgHashes = useRef<Set<string>>(new Set());

  // Subscribe to TTS broadcast channel
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`tts-${publicToken}`)
      .on("broadcast", { event: "play_tts" }, (payload) => {
        const msg: TTSMessage = {
          id: crypto.randomUUID(),
          username: payload.payload.username || "Viewer",
          text: payload.payload.text || "",
          volume: payload.payload.volume || 80,
          speed: payload.payload.speed || 50,
          pitch: payload.payload.pitch || 50,
          interrupt: payload.payload.interrupt || false,
          voiceId: payload.payload.voice_id,
          voiceProvider: payload.payload.voice_provider || "browser",
          avatarUrl: payload.payload.avatar || payload.payload.avatar_url || payload.payload.profilePictureUrl || "",
        };

        // Deduplicate: skip if we've seen this exact message recently
        const hash = `${msg.username}:${msg.text}`;
        if (recentMsgHashes.current.has(hash)) return;
        recentMsgHashes.current.add(hash);
        setTimeout(() => recentMsgHashes.current.delete(hash), 15000);

        if (msg.interrupt) {
          // Cancel any current playback
          window.speechSynthesis.cancel();
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          setCurrent(null);
          setSpeaking(false);
          processingRef.current = false;
        }

        setQueue((prev) => [...prev, msg]);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [publicToken]);

  /** Play audio via ElevenLabs edge function */
  const playElevenLabs = useCallback(async (msg: TTSMessage): Promise<void> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: msg.text,
            voice_id: msg.voiceId,
            overlay_token: publicToken,
            username: msg.username,
          }),
        }
      );

      if (!response.ok) {
        console.warn("ElevenLabs TTS failed, falling back to browser speech");
        playBrowserSpeech(msg);
        return;
      }

      const data = await response.json();
      if (!data.audioContent) {
        playBrowserSpeech(msg);
        return;
      }

      // Play base64 audio via data URI (avoids atob corruption)
      return new Promise<void>((resolve) => {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audio.volume = msg.volume / 100;
        audioRef.current = audio;

        audio.onended = () => {
          audioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          audioRef.current = null;
          console.warn("Audio playback error, falling back to browser speech");
          playBrowserSpeech(msg);
          resolve();
        };

        audio.play().catch(() => {
          // Autoplay blocked — fall back to browser speech
          playBrowserSpeech(msg);
          resolve();
        });
      });
    } catch (err) {
      console.error("ElevenLabs fetch error:", err);
      playBrowserSpeech(msg);
    }
  }, [publicToken]);

  /** Play via browser Web SpeechSynthesis API (fallback) */
  const playBrowserSpeech = useCallback((msg: TTSMessage): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg.text);
      utterance.volume = msg.volume / 100;
      utterance.rate = msg.speed / 50;   // map 1-100 → 0.02-2.0
      utterance.pitch = msg.pitch / 50;  // map 1-100 → 0.02-2.0

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      speechSynthesis.speak(utterance);
    });
  }, []);

  // Process queue — one message at a time
  useEffect(() => {
    if (processingRef.current || queue.length === 0) return;

    const processNext = async () => {
      processingRef.current = true;
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrent(next);
      setSpeaking(true);

      // Choose playback method based on voice_provider
      if (next.voiceProvider === "elevenlabs") {
        await playElevenLabs(next);
      } else {
        await playBrowserSpeech(next);
      }

      setSpeaking(false);
      // Brief pause between messages
      await new Promise((r) => setTimeout(r, 500));
      setCurrent(null);
      processingRef.current = false;
    };

    processNext();
  }, [queue, playElevenLabs, playBrowserSpeech]);

  return (
    <div className="w-screen h-screen bg-transparent relative overflow-hidden flex items-end justify-center pb-8">
      {/* Connection indicator (faint, for debugging in OBS) */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-30">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[10px] text-white/50 font-mono">
          {connected ? "TTS Ready" : "Connecting..."}
        </span>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.03] blur-[1px]" />

            <div className="relative flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] min-w-[300px] max-w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(160,100%,45%)] to-[hsl(180,100%,38%)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-black shadow-[0_0_12px_rgba(37,244,238,0.25)] overflow-hidden">
                {current.avatarUrl ? (
                  <img src={current.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  current.username[0]
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/90 tracking-wide">{current.username}</p>
                <p className="text-[12px] text-white/50 mt-0.5 leading-relaxed truncate">{current.text}</p>
              </div>

              {/* Animated volume icon — arcs pulse when speaking */}
              <div className="flex-shrink-0 w-5 h-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="rgba(255,255,255,0.5)" />
                  <motion.path
                    d="M15.54 8.46a5 5 0 0 1 0 7.07"
                    stroke="rgba(255,255,255,0.4)"
                    animate={speaking ? { opacity: [0.2, 0.8, 0.2], pathLength: [0.3, 1, 0.3] } : { opacity: 0.15, pathLength: 0.3 }}
                    transition={speaking ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
                  />
                  <motion.path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14"
                    stroke="rgba(255,255,255,0.3)"
                    animate={speaking ? { opacity: [0.1, 0.6, 0.1], pathLength: [0.2, 1, 0.2] } : { opacity: 0.1, pathLength: 0.2 }}
                    transition={speaking ? { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.15 } : { duration: 0.4 }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!current && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/10 text-xs font-mono">TTS Overlay Ready</p>
        </div>
      )}
    </div>
  );
};

export default TTSRenderer;
