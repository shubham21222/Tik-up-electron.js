import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const alerts = [
  { label: "New Gift!", title: "StreamKing sent a Rose 🌹", sub: "×5 combo · 5 coins", color: "350 90% 60%", icon: "🎁" },
  { label: "New Follow!", title: "NightOwl_Pro followed you", sub: "Follower #1,204", color: "160 100% 50%", icon: "👤" },
  { label: "New Like!", title: "TikUp_Fan liked your stream", sub: "Total: 12,400 likes", color: "200 100% 60%", icon: "❤️" },
  { label: "New Gift!", title: "GiftKing42 sent Flame Heart ❤️‍🔥", sub: "×1 · 500 coins", color: "20 100% 58%", icon: "🎁" },
];

const GlowAlertPopupPreview = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(p => (p + 1) % alerts.length);
        setVisible(true);
      }, 500);
    }, 3200);
    return () => clearInterval(cycle);
  }, []);

  const alert = alerts[idx];

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(20,10,40,0.6), rgba(0,0,0,0.85) 70%)" }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            className="relative max-w-[300px] w-full mx-6"
            initial={{ y: -20, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding ring on entry */}
            <motion.div className="absolute inset-0 rounded-md pointer-events-none"
              style={{ border: `1px solid hsl(${alert.color} / 0.5)` }}
              initial={{ scale: 1.15, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.7 }}
            />

            {/* Header label bar */}
            <div className="relative mb-1.5">
              <div className="px-4 py-1.5 rounded-t-sm text-center"
                style={{ background: `hsl(${alert.color} / 0.15)`, border: `1px solid hsl(${alert.color} / 0.35)`, borderBottom: "none" }}>
                <div className="absolute top-0 left-0 w-3 h-0.5" style={{ background: `hsl(${alert.color})` }} />
                <div className="absolute top-0 left-0 w-0.5 h-3" style={{ background: `hsl(${alert.color})` }} />
                <div className="absolute top-0 right-0 w-3 h-0.5" style={{ background: `hsl(${alert.color})` }} />
                <div className="absolute top-0 right-0 w-0.5 h-3" style={{ background: `hsl(${alert.color})` }} />
                <motion.p className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: `hsl(${alert.color})`, textShadow: `0 0 12px hsl(${alert.color} / 0.8)` }}
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  {alert.label}
                </motion.p>
              </div>
            </div>

            {/* Main body */}
            <div className="relative px-4 py-4 rounded-b-sm"
              style={{ background: "rgba(0,0,0,0.82)", border: `1px solid hsl(${alert.color} / 0.3)`, backdropFilter: "blur(12px)" }}>
              {/* Corner accents */}
              <div className="absolute bottom-0 left-0 w-4 h-0.5" style={{ background: `hsl(${alert.color})` }} />
              <div className="absolute bottom-0 left-0 w-0.5 h-4" style={{ background: `hsl(${alert.color})` }} />
              <div className="absolute bottom-0 right-0 w-4 h-0.5" style={{ background: `hsl(${alert.color})` }} />
              <div className="absolute bottom-0 right-0 w-0.5 h-4" style={{ background: `hsl(${alert.color})` }} />

              <div className="flex items-center gap-3">
                {/* Icon circle */}
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `hsl(${alert.color} / 0.1)`,
                    border: `1.5px solid hsl(${alert.color} / 0.4)`,
                    boxShadow: `0 0 20px hsl(${alert.color} / 0.25)`,
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-2xl">{alert.icon}</span>
                  {/* Rotating ring */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
                    <motion.circle cx="24" cy="24" r="21" fill="none"
                      stroke={`hsl(${alert.color} / 0.5)`} strokeWidth="1"
                      strokeDasharray="8 4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "24px 24px" }} />
                  </svg>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.p className="text-[12px] font-bold text-white leading-tight truncate"
                    style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
                    initial={{ x: 8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}>
                    {alert.title}
                  </motion.p>
                  <motion.p className="text-[10px] mt-1"
                    style={{ color: `hsl(${alert.color} / 0.75)` }}
                    initial={{ x: 8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}>
                    {alert.sub}
                  </motion.p>
                </div>
              </div>

              {/* Scan line */}
              <motion.div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, hsl(${alert.color} / 0.4), transparent)` }}
                animate={{ top: ["20%", "90%", "20%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Bottom glow strip */}
              <div className="absolute bottom-0 left-[10%] right-[10%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, hsl(${alert.color} / 0.6), transparent)` }} />
            </div>

            {/* External glow */}
            <div className="absolute -inset-3 rounded-xl pointer-events-none blur-xl"
              style={{ background: `radial-gradient(ellipse, hsl(${alert.color} / 0.12), transparent 70%)` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlowAlertPopupPreview;
