import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface TTSMessage {
  id: string;
  username: string;
  text: string;
  audioBase64: string;
  volume: number;
  interrupt: boolean;
}

const TTSRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [connected, setConnected] = useState(false);
  const [queue, setQueue] = useState<TTSMessage[]>([]);
  const [current, setCurrent] = useState<TTSMessage | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          audioBase64: payload.payload.audioBase64,
          volume: payload.payload.volume || 80,
          interrupt: payload.payload.interrupt || false,
        };

        if (msg.interrupt && audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          setCurrent(null);
          setSpeaking(false);
        }

        setQueue((prev) => [...prev, msg]);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [publicToken]);

  // Process queue
  useEffect(() => {
    if (current || queue.length === 0) return;

    const next = queue[0];
    setCurrent(next);
    setQueue((prev) => prev.slice(1));
    setSpeaking(true);

    const audioUrl = `data:audio/mpeg;base64,${next.audioBase64}`;
    const audio = new Audio(audioUrl);
    audio.volume = next.volume / 100;
    audioRef.current = audio;

    audio.onended = () => {
      setSpeaking(false);
      setTimeout(() => {
        setCurrent(null);
        audioRef.current = null;
      }, 500);
    };

    audio.onerror = () => {
      setSpeaking(false);
      setCurrent(null);
      audioRef.current = null;
    };

    audio.play().catch(() => {
      setSpeaking(false);
      setCurrent(null);
      audioRef.current = null;
    });
  }, [queue, current]);

  return (
    <div className="w-screen h-screen bg-transparent relative overflow-hidden flex items-end justify-center pb-8">
      {/* Connection indicator */}
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
            <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-[hsl(160,100%,45%/0.3)] to-[hsl(160,100%,45%/0.05)] blur-[1px]" />

            <div className="relative flex items-start gap-3.5 px-5 py-4 rounded-[20px] bg-[rgba(0,0,0,0.7)] backdrop-blur-xl border border-[hsl(160,100%,45%/0.15)] min-w-[320px] max-w-[420px]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(160,100%,45%)] to-[hsl(180,100%,38%)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-black">
                {current.username[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white tracking-wide">{current.username}</p>
                <p className="text-[12px] text-white/70 mt-0.5 leading-relaxed">{current.text}</p>

                <div className="flex items-end gap-[3px] mt-2.5 h-3">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-[2.5px] rounded-full bg-[hsl(160,100%,45%)]"
                      animate={speaking ? {
                        height: [3, 8 + Math.random() * 6, 3, 10 + Math.random() * 4, 3],
                      } : { height: 3 }}
                      transition={speaking ? {
                        duration: 0.4 + Math.random() * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.04,
                      } : { duration: 0.3 }}
                    />
                  ))}
                </div>
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
