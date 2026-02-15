import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const SYMBOLS = ["🌹", "💎", "⭐", "🔥", "🦋", "💖", "🎁"];

const SlotMachinePreview = () => {
  const [reels, setReels] = useState([0, 2, 4]);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);

  useEffect(() => {
    const spin = () => {
      if (spinning) return;
      setSpinning(true);
      setWin(false);

      // Stagger reel stops
      const results = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      // 30% chance of win for demo
      if (Math.random() < 0.3) {
        results[1] = results[0];
        results[2] = results[0];
      }

      setTimeout(() => setReels(r => [results[0], r[1], r[2]]), 600);
      setTimeout(() => setReels(r => [r[0], results[1], r[2]]), 1000);
      setTimeout(() => {
        setReels([results[0], results[1], results[2]]);
        setSpinning(false);
        if (results[0] === results[1] && results[1] === results[2]) setWin(true);
      }, 1400);
    };

    const t = setTimeout(spin, 1500);
    const interval = setInterval(spin, 4500);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(45 100% 55%), transparent 70%)" }} />
      </div>

      {/* Machine frame */}
      <div className="relative px-3 py-3 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1.5px solid rgba(255,255,255,0.1)",
          boxShadow: win ? "0 0 30px hsl(45 100% 55% / 0.2)" : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: "hsl(45 100% 65%)" }}>🎰 Gift Slots</span>
        </div>

        {/* Reels */}
        <div className="flex gap-2">
          {reels.map((symbolIdx, i) => (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${win ? "hsl(45 100% 55% / 0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
              animate={spinning ? { y: [0, -8, 4, -4, 0] } : {}}
              transition={{ duration: 0.15, repeat: spinning ? Infinity : 0, delay: i * 0.1 }}
            >
              <motion.span
                key={`${i}-${symbolIdx}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl"
              >
                {SYMBOLS[symbolIdx]}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Win indicator */}
        <AnimatedResult win={win} />
      </div>
    </div>
  );
};

const AnimatedResult = ({ win }: { win: boolean }) => (
  <div className="text-center mt-2 h-4">
    {win && (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5 }}
        className="text-[10px] font-bold"
        style={{ color: "hsl(45 100% 65%)" }}
      >
        🎉 JACKPOT!
      </motion.span>
    )}
  </div>
);

export default SlotMachinePreview;
