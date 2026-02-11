import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const mockShares = [
  { user: "StreamFan42", count: 3 },
  { user: "ShareKing", count: 12 },
  { user: "TikTokPro", count: 1 },
  { user: "Supporter99", count: 7 },
];

interface ShareAlertPreviewProps {
  settings: Record<string, any>;
}

const ShareAlertPreview = ({ settings }: ShareAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 5;
  const style = settings.animation_style || "rocket_launch";
  const iconSize = settings.icon_size || 52;
  const glowIntensity = (settings.glow_intensity || 55) / 100;
  const accentColor = settings.accent_color || "200 100% 55%";

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % mockShares.length);
        setVisible(true);
      }, 700);
    }, duration * 1000);
    return () => clearInterval(cycle);
  }, [duration]);

  const share = mockShares[currentIdx];

  const getAnimation = () => {
    switch (style) {
      case "shockwave": return { initial: { scale: 0, opacity: 0 }, animate: { scale: [0, 1.2, 1], opacity: 1 } };
      case "neon_burst": return { initial: { opacity: 0, scale: 2 }, animate: { opacity: 1, scale: 1 } };
      case "paper_plane": return { initial: { x: -100, y: 50, rotate: -45, opacity: 0 }, animate: { x: 0, y: 0, rotate: 0, opacity: 1 } };
      case "warp_speed": return { initial: { scaleX: 3, opacity: 0 }, animate: { scaleX: 1, opacity: 1 } };
      case "sonic_boom": return { initial: { scale: 0.3, opacity: 0 }, animate: { scale: [0.3, 1.15, 1], opacity: 1 } };
      default: return { initial: { y: 60, opacity: 0, scale: 0.5 }, animate: { y: [60, -10, 0], opacity: 1, scale: 1 } };
    }
  };

  const anim = getAnimation();
  const icon = style === "paper_plane" ? "✈️" : style === "rocket_launch" ? "🚀" : "🔗";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentIdx}
            className="relative flex flex-col items-center"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.6 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Shockwave rings */}
            {(style === "shockwave" || style === "sonic_boom") && [0, 1].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: iconSize * 2, height: iconSize * 2,
                  borderColor: `hsl(${accentColor} / ${0.3 * glowIntensity})`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 3 + i, opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.15 }}
              />
            ))}

            {/* Glow */}
            <motion.div
              className="absolute rounded-full blur-xl"
              style={{
                width: iconSize * 1.5, height: iconSize * 1.5,
                background: `hsl(${accentColor} / ${0.12 * glowIntensity})`,
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Trail particles for rocket */}
            {style === "rocket_launch" && Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3, height: 3,
                  background: `hsl(${accentColor} / 0.6)`,
                }}
                initial={{ y: iconSize / 2, x: (Math.random() - 0.5) * 10, opacity: 1 }}
                animate={{ y: iconSize + 40 + Math.random() * 30, opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
              />
            ))}

            {/* Icon */}
            <motion.div
              className="relative rounded-2xl flex items-center justify-center mb-3"
              style={{
                width: iconSize, height: iconSize,
                background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), rgba(0,0,0,0.5))`,
                backdropFilter: "blur(12px)",
                border: `1px solid hsl(${accentColor} / 0.25)`,
                boxShadow: `0 0 ${20 * glowIntensity}px hsl(${accentColor} / 0.15)`,
              }}
              animate={style === "rocket_launch" ? {
                y: [0, -3, 0],
              } : undefined}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <span style={{ fontSize: iconSize * 0.45 }}>{icon}</span>
            </motion.div>

            {/* Text */}
            <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {settings.username_visible !== false && (
                <p className="text-sm font-bold text-white">{share.user}</p>
              )}
              <p className="text-[11px] text-white/50 mt-0.5">shared your stream!</p>
              {settings.show_share_count !== false && share.count > 1 && (
                <motion.p
                  className="text-xs font-bold mt-1"
                  style={{ color: `hsl(${accentColor})` }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.15, 1] }}
                  transition={{ delay: 0.3 }}
                >
                  {share.count}x shares
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
