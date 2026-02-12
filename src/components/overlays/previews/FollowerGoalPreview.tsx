import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FollowerGoalPreviewProps {
  settings?: Record<string, any>;
}

const FollowerGoalPreview = ({ settings = {} }: FollowerGoalPreviewProps) => {
  const [current, setCurrent] = useState(420);
  const target = settings.target_value || 1000;
  const style = settings.display_style || "glass_bar";
  const barHeight = settings.bar_height || 32;
  const accent = settings.glow_color || "160 100% 45%";
  const showPct = settings.show_percentage ?? true;
  const title = settings.title_text || "Follower Goal";

  useEffect(() => {
    const t = setInterval(() => setCurrent(prev => Math.min(prev + Math.floor(Math.random() * 8) + 1, target)), 3000);
    return () => clearInterval(t);
  }, [target]);

  const pct = Math.min((current / target) * 100, 100);

  if (style === "circular") {
    const r = 48, c = 2 * Math.PI * r;
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke={`hsl(${accent})`} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct / 100) }}
            style={{ filter: `drop-shadow(0 0 10px hsl(${accent} / 0.3))` }} transform="rotate(-90 60 60)" transition={{ duration: 1 }} />
        </svg>
        <div className="absolute text-center">
          <p className="text-lg font-heading font-black text-white">{current}</p>
          <p className="text-[9px] text-white/40">/ {target}</p>
        </div>
        <p className="text-[10px] text-white/50 mt-2">{title}</p>
      </div>
    );
  }

  if (style === "liquid_fill") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
        <p className="text-[11px] text-white/60 font-medium mb-2">{title}</p>
        <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: barHeight + 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-2xl" animate={{ width: `${pct}%` }}
            style={{ background: `linear-gradient(90deg, hsl(${accent} / 0.8), hsl(${accent}))`, boxShadow: `0 0 20px hsl(${accent} / 0.3)` }}
            transition={{ duration: 1.2, ease: "easeOut" }}>
            <motion.div className="absolute inset-0 opacity-30" animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
              style={{ backgroundImage: `linear-gradient(90deg, transparent, hsl(${accent} / 0.4), transparent)`, backgroundSize: "50% 100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
          </motion.div>
          {showPct && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">{current} / {target}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // glass_bar / neon_gradient / minimal
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
      <div className="flex items-center justify-between w-full mb-2">
        <p className="text-[11px] text-white/60 font-medium">{title}</p>
        {showPct && <p className="text-[11px] font-bold" style={{ color: `hsl(${accent})` }}>{Math.round(pct)}%</p>}
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{
        height: barHeight,
        background: style === "minimal" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
        border: style === "neon_gradient" ? `1px solid hsl(${accent} / 0.2)` : "none",
        ...(style === "glass_bar" ? { backdropFilter: "blur(12px)" } : {}),
      }}>
        <motion.div className="h-full rounded-full relative overflow-hidden" animate={{ width: `${pct}%` }}
          style={{
            background: style === "neon_gradient"
              ? `linear-gradient(90deg, hsl(${accent}), hsl(${accent.split(" ")[0]} 100% 65%))`
              : `hsl(${accent})`,
            boxShadow: style !== "minimal" ? `0 0 15px hsl(${accent} / 0.3)` : "none",
          }}
          transition={{ duration: 1, ease: "easeOut" }}>
          <motion.div className="absolute inset-0 opacity-40"
            animate={{ x: ["-100%", "200%"] }}
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", width: "40%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        </motion.div>
      </div>
      <p className="text-[10px] text-white/40 mt-1.5">{current} / {target}</p>
    </div>
  );
};

export default FollowerGoalPreview;
