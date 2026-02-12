import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const GiftFireworkPreview = () => {
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBurst((p) => p + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const particleCount = 18;
  const colors = ["45 100% 55%", "280 100% 65%", "160 100% 45%", "350 90% 55%", "200 100% 55%"];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Firework center glow */}
      <motion.div
        key={burst}
        className="absolute w-4 h-4 rounded-full"
        style={{ background: `hsl(${colors[burst % colors.length]})`, boxShadow: `0 0 30px hsl(${colors[burst % colors.length]} / 0.6)` }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 0], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.6 }}
      />

      {/* Particles */}
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const dist = 50 + Math.random() * 40;
        const color = colors[(burst + i) % colors.length];
        return (
          <motion.div
            key={`${burst}-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: `hsl(${color})`, boxShadow: `0 0 6px hsl(${color} / 0.5)` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 20,
              opacity: [1, 0.8, 0],
              scale: [1, 0.6, 0.2],
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.02 }}
          />
        );
      })}

      {/* Sparkle trails */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <motion.div
            key={`trail-${burst}-${i}`}
            className="absolute w-0.5 rounded-full"
            style={{ background: `hsl(45 100% 75%)`, height: 12 + Math.random() * 8 }}
            initial={{ x: 0, y: 0, opacity: 0.8, rotate: (angle * 180) / Math.PI }}
            animate={{
              x: Math.cos(angle) * 70,
              y: Math.sin(angle) * 70 + 30,
              opacity: 0,
            }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          />
        );
      })}

      {/* Username tag */}
      <motion.div
        key={`name-${burst}`}
        className="absolute mt-20"
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -5], scale: [0.8, 1, 1, 0.95] }}
        transition={{ duration: 2.5, times: [0, 0.15, 0.7, 1] }}
      >
        <span className="text-[11px] font-bold text-white/80 px-3 py-1 rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-sm border border-white/[0.06]"
          style={{ textShadow: "0 0 8px hsl(45 100% 55% / 0.4)" }}>
          ✨ GiftKing99
        </span>
      </motion.div>
    </div>
  );
};

export default GiftFireworkPreview;
