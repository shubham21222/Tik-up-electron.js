import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface StreamTimerPreviewProps {
  settings: Record<string, any>;
}

const StreamTimerPreview = ({ settings }: StreamTimerPreviewProps) => {
  const [seconds, setSeconds] = useState(3723); // 1h 2m 3s
  const mode = settings.display_mode || "digital";
  const accent = settings.accent_color || "0 100% 60%";
  const glow = (settings.glow_intensity || 50) / 100;
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const fontSize = settings.font_size || 42;
  const showLabel = settings.show_label ?? true;

  useEffect(() => {
    const t = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timeStr = settings.show_hours !== false
    ? `${pad(hrs)}:${pad(mins)}${settings.show_seconds !== false ? `:${pad(secs)}` : ""}`
    : `${pad(mins)}${settings.show_seconds !== false ? `:${pad(secs)}` : ""}`;

  if (mode === "neon_segmented") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {showLabel && (
          <motion.div className="flex items-center gap-1.5 mb-3"
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${accent})`, boxShadow: `0 0 8px hsl(${accent} / 0.6)` }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: `hsl(${accent})` }}>{settings.label_text || "LIVE"}</span>
          </motion.div>
        )}
        <div className="flex items-center gap-1">
          {timeStr.split("").map((char, i) => (
            <motion.div key={i} className={`${char === ":" ? "w-4" : "w-8"} h-12 rounded-lg flex items-center justify-center`}
              style={char !== ":" ? {
                background: `hsl(${accent} / 0.06)`, border: `1px solid hsl(${accent} / 0.15)`,
                boxShadow: `0 0 ${8 * glow}px hsl(${accent} / 0.1)`,
              } : {}}>
              <motion.span className={`text-xl font-black ${fontClass}`} style={{ color: `hsl(${accent})`, textShadow: `0 0 ${10 * glow}px hsl(${accent} / 0.5)` }}
                key={`${char}-${i}-${seconds}`} initial={char !== ":" ? { y: -8, opacity: 0 } : {}} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {char}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "minimal_dot") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(${accent})` }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className={`text-lg font-bold text-white ${fontClass}`}>{timeStr}</span>
        </div>
      </div>
    );
  }

  // digital default
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <motion.div className="absolute rounded-full blur-3xl" style={{ width: 150, height: 150, background: `hsl(${accent} / ${0.04 * glow})` }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
      {showLabel && (
        <motion.div className="flex items-center gap-1.5 mb-2"
          animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${accent})`, boxShadow: `0 0 6px hsl(${accent} / 0.5)` }} />
          <span className="text-[10px] font-bold tracking-widest text-white/50">{settings.label_text || "LIVE"}</span>
        </motion.div>
      )}
      <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize, textShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.3)` }}>
        {timeStr}
      </motion.span>
      {settings.milestone_notifications && hrs > 0 && secs === 0 && mins === 0 && (
        <motion.p className="text-xs font-bold mt-2" style={{ color: `hsl(${accent})` }}
          initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}>🎉 {hrs}h milestone!</motion.p>
      )}
    </div>
  );
};

export default StreamTimerPreview;
