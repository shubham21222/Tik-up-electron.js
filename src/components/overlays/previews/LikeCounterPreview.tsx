import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LikeCounterPreviewProps {
  settings?: Record<string, any>;
}

const LikeCounterPreview = ({ settings = {} }: LikeCounterPreviewProps) => {
  const [count, setCount] = useState(4821);
  const mode = settings.display_mode || "numeric";
  const fontSize = settings.font_size || 48;
  const glow = (settings.glow_strength || 60) / 100;
  const accent = settings.accent_color || "280 100% 65%";
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";

  useEffect(() => {
    const t = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 15) + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const progress = (count % 1000) / 1000;

  if (mode === "progress_ring") {
    const r = 50, c = 2 * Math.PI * r;
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke={`hsl(${accent} / 0.1)`} strokeWidth="8" />
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke={`hsl(${accent})`} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
            style={{ filter: `drop-shadow(0 0 ${8 * glow}px hsl(${accent} / 0.4))` }}
            transform="rotate(-90 60 60)" />
        </svg>
        <motion.span className={`absolute text-2xl font-bold text-white ${fontClass}`}
          key={count} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {count.toLocaleString()}
        </motion.span>
      </div>
    );
  }

  if (mode === "horizontal_bar") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center px-8">
        <motion.span className={`text-xl font-bold text-white mb-3 ${fontClass}`}
          key={count} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
          ❤️ {count.toLocaleString()}
        </motion.span>
        <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: `hsl(${accent} / 0.1)` }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress * 100}%` }}
            style={{ background: `linear-gradient(90deg, hsl(${accent}), hsl(${accent} / 0.6))`, boxShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.3)` }}
            transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="text-[10px] text-white/40 mt-2">Next milestone: {Math.ceil(count / 1000) * 1000}</p>
      </div>
    );
  }

  if (mode === "neon_counter") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div className="relative" animate={{ textShadow: [`0 0 ${20 * glow}px hsl(${accent})`, `0 0 ${40 * glow}px hsl(${accent})`, `0 0 ${20 * glow}px hsl(${accent})`] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <span className={`text-5xl font-black ${fontClass}`} style={{ color: `hsl(${accent})`, WebkitTextStroke: `1px hsl(${accent} / 0.3)` }}>
            {count.toLocaleString()}
          </span>
        </motion.div>
        <p className="absolute bottom-[30%] text-[10px] text-white/30 tracking-widest uppercase">likes</p>
      </div>
    );
  }

  // numeric (default) and milestone
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <motion.div className="flex items-center gap-2">
        <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }} className="text-2xl">❤️</motion.span>
        <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize }} key={count}
          initial={settings.rolling_number ? { y: -20, opacity: 0 } : { scale: 1.3, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          {count.toLocaleString()}
        </motion.span>
      </motion.div>
      {mode === "milestone" && count % (settings.milestone_interval || 1000) < 50 && (
        <motion.p className="text-xs font-bold mt-2" style={{ color: `hsl(${accent})` }}
          initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}>🎉 Milestone!</motion.p>
      )}
      <motion.div className="absolute rounded-full blur-2xl" style={{ width: 120, height: 120, background: `hsl(${accent} / ${0.06 * glow})` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
    </div>
  );
};

export default LikeCounterPreview;
