import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const alerts = [
  { user: "GiftKing", gift: "Rose", emoji: "🌹" },
  { user: "StreamLover99", gift: "Lion", emoji: "🦁" },
  { user: "TikTokPro", gift: "Universe", emoji: "🌌" },
  { user: "CoolViewer42", gift: "Crown", emoji: "👑" },
];

const SoundAlertOverlay = () => {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentAlert((prev) => (prev + 1) % alerts.length);
        setVisible(true);
      }, 800);
    }, 4500);
    return () => clearInterval(cycle);
  }, []);

  const alert = alerts[currentAlert];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentAlert}
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding ring 1 */}
            <motion.div
              className="absolute w-28 h-28 rounded-full border border-[hsl(160,100%,45%/0.3)]"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Expanding ring 2 */}
            <motion.div
              className="absolute w-28 h-28 rounded-full border border-[hsl(280,100%,65%/0.2)]"
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
            />

            {/* Glow backdrop */}
            <motion.div
              className="absolute w-24 h-24 rounded-full bg-[hsl(160,100%,45%/0.08)] blur-2xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Gift icon */}
            <motion.div
              className="relative w-16 h-16 rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur-xl border border-[hsl(160,100%,45%/0.2)] flex items-center justify-center mb-4"
              animate={{ boxShadow: [
                "0 0 0px hsl(160 100% 45% / 0)",
                "0 0 30px hsl(160 100% 45% / 0.2)",
                "0 0 0px hsl(160 100% 45% / 0)",
              ]}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-2xl">{alert.emoji}</span>
            </motion.div>

            {/* Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[hsl(160,100%,45%)]"
                initial={{
                  x: 0, y: 0, opacity: 1, scale: 1
                }}
                animate={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 60,
                  y: Math.sin((i * 60) * Math.PI / 180) * 60,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            ))}

            {/* Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <p className="text-sm font-bold text-white tracking-wide">{alert.user}</p>
              <p className="text-[11px] text-white/50 mt-0.5">sent a gift!</p>
              <p className="text-xs font-semibold text-[hsl(160,100%,50%)] mt-1">{alert.gift}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoundAlertOverlay;
