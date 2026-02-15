import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const TEAMS = [
  { name: "🔥 Fire", color: "350 80% 55%" },
  { name: "💎 Ice", color: "200 80% 55%" },
  { name: "⭐ Gold", color: "45 100% 55%" },
];

const ProgressRacePreview = () => {
  const [progress, setProgress] = useState([15, 22, 10]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev.map(p => {
        const gain = Math.floor(Math.random() * 6);
        return Math.min(p + gain, 100);
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset when someone wins
  useEffect(() => {
    if (progress.some(p => p >= 100)) {
      const t = setTimeout(() => setProgress([5, 8, 3]), 3000);
      return () => clearTimeout(t);
    }
  }, [progress]);

  const maxP = Math.max(...progress);

  return (
    <div className="w-full h-full flex flex-col justify-center px-4 gap-3 select-none">
      {/* Title */}
      <div className="text-center mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">🏁 Race to 100</span>
      </div>

      {TEAMS.map((team, i) => {
        const isLeading = progress[i] === maxP && progress[i] > 0;
        const finished = progress[i] >= 100;
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold" style={{ color: `hsl(${team.color})` }}>{team.name}</span>
              <span className="text-[9px] font-medium text-white/50">{Math.min(progress[i], 100)}%</span>
            </div>
            <div className="h-5 rounded-lg overflow-hidden relative"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${isLeading ? `hsl(${team.color} / 0.25)` : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <motion.div
                className="h-full rounded-lg relative overflow-hidden"
                animate={{ width: `${Math.min(progress[i], 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(90deg, hsl(${team.color} / 0.3), hsl(${team.color} / 0.5))`,
                }}
              >
                {/* Shimmer */}
                <motion.div className="absolute inset-0 opacity-40"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${team.color} / 0.3), transparent)` }} />
              </motion.div>
              {/* Finish flag */}
              {finished && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px]"
                >🏆</motion.span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressRacePreview;
