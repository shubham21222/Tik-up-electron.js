import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const VoteBattlePreview = () => {
  const [leftScore, setLeftScore] = useState(45);
  const [rightScore, setRightScore] = useState(55);

  useEffect(() => {
    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? "left" : "right";
      const pts = 2 + Math.floor(Math.random() * 8);
      if (side === "left") {
        setLeftScore(l => l + pts);
        setRightScore(r => r);
      } else {
        setRightScore(r => r + pts);
        setLeftScore(l => l);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const total = leftScore + rightScore;
  const leftPct = Math.round((leftScore / total) * 100);
  const rightPct = 100 - leftPct;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none px-4">
      {/* VS badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black"
          style={{
            background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(200 80% 55%))",
            boxShadow: "0 0 15px rgba(255,255,255,0.15)",
          }}
        >VS</motion.div>
      </div>

      {/* Labels */}
      <div className="flex w-full justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(350 80% 55%)" }} />
          <span className="text-[10px] font-bold text-white/70">Team A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white/70">Team B</span>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(200 80% 55%)" }} />
        </div>
      </div>

      {/* Battle bar */}
      <div className="w-full h-10 rounded-xl overflow-hidden flex"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <motion.div
          className="h-full flex items-center justify-center relative overflow-hidden"
          animate={{ width: `${leftPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: "linear-gradient(90deg, hsl(350 80% 55% / 0.4), hsl(350 80% 55% / 0.2))" }}
        >
          <span className="text-[11px] font-bold text-white/90 z-10">{leftPct}%</span>
          <motion.div className="absolute inset-0 opacity-30"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ background: "linear-gradient(90deg, transparent, hsl(350 80% 60% / 0.3), transparent)" }} />
        </motion.div>
        <motion.div
          className="h-full flex items-center justify-center relative overflow-hidden"
          animate={{ width: `${rightPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: "linear-gradient(90deg, hsl(200 80% 55% / 0.2), hsl(200 80% 55% / 0.4))" }}
        >
          <span className="text-[11px] font-bold text-white/90 z-10">{rightPct}%</span>
          <motion.div className="absolute inset-0 opacity-30"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ background: "linear-gradient(90deg, transparent, hsl(200 80% 60% / 0.3), transparent)" }} />
        </motion.div>
      </div>

      {/* Scores */}
      <div className="flex w-full justify-between mt-2 px-1">
        <span className="text-[10px] font-bold" style={{ color: "hsl(350 80% 65%)" }}>{leftScore} pts</span>
        <span className="text-[10px] font-bold" style={{ color: "hsl(200 80% 65%)" }}>{rightScore} pts</span>
      </div>
    </div>
  );
};

export default VoteBattlePreview;
