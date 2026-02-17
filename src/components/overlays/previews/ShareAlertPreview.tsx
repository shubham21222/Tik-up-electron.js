import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const mockShares = [
  { user: "Tikup_User", count: 5 },
  { user: "Tikup_User", count: 15 },
];

interface ShareAlertPreviewProps {
  settings?: Record<string, any>;
  testTrigger?: number;
}

const ShareAlertPreview = ({ settings = {}, testTrigger = 0 }: ShareAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 5;
  const style = settings.animation_style || "rocket_launch";
  // Scaled up icon size
  const iconSize = (settings.icon_size || 68) * 1.25;
  const glowIntensity = (settings.glow_intensity || 55) / 100;
  const accentColor = settings.accent_color || "200 100% 55%";

  const triggerNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % mockShares.length);
      setVisible(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (testTrigger > 0) triggerNext();
  }, [testTrigger, triggerNext]);

  useEffect(() => {
    const cycle = setInterval(() => {
      triggerNext();
    }, duration * 1000 + 1000);
    return () => clearInterval(cycle);
  }, [duration, triggerNext]);

  const share = mockShares[currentIdx % mockShares.length];

  const getAnimation = () => {
    switch (style) {
      case "shockwave": return { initial: { scale: 0, opacity: 0 }, animate: { scale: [0, 1.25, 1], opacity: 1 } };
      case "neon_burst": return { initial: { opacity: 0, scale: 2.5, filter: "blur(10px)" }, animate: { opacity: 1, scale: 1, filter: "blur(0px)" } };
      case "paper_plane": return { initial: { x: -150, y: 80, rotate: -60, opacity: 0 }, animate: { x: 0, y: 0, rotate: 0, opacity: 1 } };
      case "warp_speed": return { initial: { scaleX: 4, opacity: 0 }, animate: { scaleX: 1, opacity: 1 } };
      case "sonic_boom": return { initial: { scale: 0.2, opacity: 0 }, animate: { scale: [0.2, 1.2, 1], opacity: 1 } };
      default: return { initial: { y: 80, opacity: 0, scale: 0.6 }, animate: { y: [80, -15, 0], opacity: 1, scale: 1 } };
    }
  };

  const anim = getAnimation();
  const icon = style === "paper_plane" ? "✈️" : style === "rocket_launch" ? "🚀" : "🔗";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentIdx}-${testTrigger}`}
            className="relative flex flex-col items-center"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ duration: 0.65 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Shockwave rings */}
            {(style === "shockwave" || style === "sonic_boom") && [0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  width: iconSize * 2, height: iconSize * 2,
                  borderColor: `hsl(${accentColor} / ${0.4 * glowIntensity})`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 4 + i, opacity: 0 }}
                transition={{ duration: 1.4, delay: i * 0.2 }}
              />
            ))}

            {/* Ambient Glow */}
            <motion.div
              className="absolute rounded-full blur-2xl z-0"
              style={{
                width: iconSize * 1.8, height: iconSize * 1.8,
                background: `hsl(${accentColor} / ${0.15 * glowIntensity})`,
              }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Trail particles for rocket */}
            {style === "rocket_launch" && Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4, height: 4,
                  background: `hsl(${accentColor} / 0.7)`,
                }}
                initial={{ y: iconSize / 2, x: (Math.random() - 0.5) * 15, opacity: 1 }}
                animate={{ y: iconSize + 60 + Math.random() * 40, opacity: 0, scale: 0 }}
                transition={{ duration: 1, delay: 0.1 + i * 0.05 }}
              />
            ))}

            {/* Icon Card */}
            <motion.div
              className="relative rounded-3xl flex items-center justify-center mb-5 z-10"
              style={{
                width: iconSize, height: iconSize,
                background: `linear-gradient(135deg, hsl(${accentColor} / 0.2), rgba(0,0,0,0.6))`,
                backdropFilter: "blur(16px)",
                border: `2px solid hsl(${accentColor} / 0.4)`,
                boxShadow: `0 0 35px hsl(${accentColor} / ${0.2 * glowIntensity})`,
              }}
              animate={style === "rocket_launch" ? {
                y: [0, -5, 0],
              } : undefined}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span style={{ fontSize: iconSize * 0.5 }}>{icon}</span>
            </motion.div>

            {/* Text content - Larger and bold */}
            <motion.div className="text-center z-10" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {settings.username_visible !== false && (
                <p className="text-lg font-black text-white tracking-tight drop-shadow-lg">{share.user}</p>
              )}
              <p className="text-xs font-bold text-white/60 mt-1.5 uppercase tracking-widest">shared your stream!</p>
              {settings.show_share_count !== false && share.count > 1 && (
                <motion.p
                  className="text-base font-black mt-2"
                  style={{ color: `hsl(${accentColor})`, textShadow: `0 0 15px hsl(${accentColor} / 0.5)` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ delay: 0.35, type: "spring" }}
                >
                  {share.count}x SHARES
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareAlertPreview;