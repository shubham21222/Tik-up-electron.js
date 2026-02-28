import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { defaultSoundReactiveSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";
import { devLog } from "@/lib/dev-log";

const SoundReactiveRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultSoundReactiveSettings);
  const [connected, setConnected] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultSoundReactiveSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`sound_reactive-${publicToken}`)
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`sr-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultSoundReactiveSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  // Init audio capture
  const startAudio = useCallback(async () => {
    try {
      // Try desktop audio capture (screen share audio), fallback to mic
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        // Stop the video track since we only need audio
        stream.getVideoTracks().forEach(t => t.stop());
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = settings.smoothing || 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      setAudioActive(true);
    } catch {
      devLog("Audio capture not available, using simulated data");
      setAudioActive(true); // Use simulated mode
    }
  }, [settings.smoothing]);

  useEffect(() => { startAudio(); }, [startAudio]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.02;

      const barCount = settings.bar_count || 32;
      const sensitivity = (settings.sensitivity || 70) / 100;
      const glow = (settings.glow_intensity || 50) / 100;
      const heightPct = (settings.height_percent || 30) / 100;
      const maxBarH = canvas.height * heightPct;
      const accent = settings.accent_color || "200 100% 55%";

      // Get audio data or simulate
      const values: number[] = [];
      if (analyserRef.current && dataArrayRef.current) {
        const tempArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(tempArray);
        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor((i / barCount) * tempArray.length);
          values.push((tempArray[idx] / 255) * sensitivity);
          values.push((dataArrayRef.current[idx] / 255) * sensitivity);
        }
      } else {
        // Simulated audio
        for (let i = 0; i < barCount; i++) {
          values.push(
            (Math.sin(t * 3 + i * 0.3) * 0.3 + 0.4 + Math.sin(t * 7 + i * 0.7) * 0.15 + Math.random() * 0.1) * sensitivity
          );
        }
      }

      const totalWidth = canvas.width * 0.8;
      const barW = settings.bar_width || 4;
      const _gap = settings.bar_gap || 2;
      const startX = (canvas.width - totalWidth) / 2;
      const barSpacing = totalWidth / barCount;

      const isBottom = settings.position === "bottom" || settings.position === "full";
      const baseY = settings.position === "top" ? 0 : settings.position === "center" ? canvas.height / 2 : canvas.height;

      for (let i = 0; i < barCount; i++) {
        let v = values[i];
        if (settings.mirror && i >= barCount / 2) v = values[barCount - 1 - i];
        const h = v * maxBarH;
        const x = startX + i * barSpacing;

        // Color
        let color: string;
        if (settings.color_mode === "rainbow") {
          const hue = (i / barCount) * 360;
          color = `hsl(${hue}, 100%, 60%)`;
        } else if (settings.color_mode === "reactive") {
          const hue = 200 - v * 150;
          color = `hsl(${hue}, 100%, ${50 + v * 20}%)`;
        } else if (settings.color_mode === "gradient") {
          const ratio = i / barCount;
          color = ratio < 0.5 ? `hsl(${accent})` : `hsl(280 100% 65%)`;
        } else {
          color = `hsl(${accent})`;
        }

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * glow * v;

        const radius = settings.bar_radius || 2;
        const drawY = settings.position === "center" ? baseY - h / 2 : isBottom ? baseY - h : baseY;

        // Rounded rect
        ctx.beginPath();
        ctx.roundRect(x, drawY, barW, h, radius);
        ctx.fill();

        // Mirror for center mode
        if (settings.position === "center") {
          ctx.beginPath();
          ctx.roundRect(x, baseY, barW, h / 2, radius);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [settings, audioActive]);

  return (
    <div className={`w-screen h-screen overflow-hidden ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20 z-10">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        {audioActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Audio active" />}
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
    </div>
  );
};

export default SoundReactiveRenderer;
