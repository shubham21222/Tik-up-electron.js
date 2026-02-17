import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const gifters = ["Tikup_User", "Tikup_User", "Tikup_User", "Tikup_User", "Tikup_User"];
const tiers = [
  { min: 1, label: "COMBO", color: "200 100% 55%" },
  { min: 5, label: "SUPER", color: "45 100% 55%" },
  { min: 10, label: "EPIC", color: "280 100% 65%" },
  { min: 20, label: "LEGENDARY", color: "350 90% 55%" },
];

const GiftComboPreview = () => {
  const [combo, setCombo] = useState(1);
  const [gifter] = useState(gifters[0]);
  const maxCombo = 25;
  const dir = useRef<1 | -1>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCombo((prev) => {
        if (prev >= maxCombo) dir.current = -1;
        if (prev <= 1) dir.current = 1;
        return prev + dir.current * (1 + Math.floor(Math.random() * 2));
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const tier = [...tiers].reverse().find((t) => combo >= t.min) || tiers[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Particles */}
      {combo > 5 &&
        [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: `hsl(${tier.color})` }}
            animate={{
              x: [0, (Math.random() - 0.5) * 120],
              y: [0, -60 - Math.random() * 80],
              opacity: [1, 0],
              scale: [1, 0.3],
            }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}

      <motion.div
        className="flex flex-col items-center gap-1"
        animate={combo > 10 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        <span className="text-xs font-bold tracking-widest" style={{ color: `hsl(${tier.color})` }}>
          {tier.label}
        </span>
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={combo}
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.5 }}
              className="text-5xl font-black text-white"
              style={{ textShadow: `0 0 20px hsl(${tier.color} / 0.5)` }}
            >
              {combo}x
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-xs text-white/50">{gifter}</span>
      </motion.div>
    </div>
  );
};

export default GiftComboPreview;
