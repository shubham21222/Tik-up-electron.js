import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const mockLikes = [
  { user: "StreamFan42", count: 12 },
  { user: "NightOwl", count: 5 },
  { user: "CoolViewer", count: 28 },
  { user: "TikTokPro", count: 3 },
  { user: "VibeCheck", count: 50 },
];

interface LikeAlertPreviewProps {
  settings: Record<string, any>;
}

const HeartParticle = ({ index, total, color }: { index: number; total: number; color: string }) => {
  const angle = (index / total) * 360;
  const distance = 40 + Math.random() * 30;
  return (
    <motion.div
      className="absolute"
      style={{ color, fontSize: 10 + Math.random() * 8 }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle * Math.PI / 180) * distance,
        y: -distance - Math.random() * 40,
        opacity: 0,
        scale: 0.3,
        rotate: Math.random() * 180 - 90,
      }}
      transition={{ duration: 1.2 + Math.random() * 0.5, ease: "easeOut", delay: index * 0.04 }}
    >
      ❤️
    </motion.div>
  );
};

const getColors = (mode: string) => {
  switch (mode) {
    case "cool": return ["hsl(200 100% 60%)", "hsl(220 100% 65%)", "hsl(180 100% 50%)"];
    case "rainbow": return ["hsl(0 90% 60%)", "hsl(45 100% 55%)", "hsl(120 80% 50%)", "hsl(200 100% 60%)", "hsl(280 100% 65%)"];
    case "mono": return ["hsl(0 0% 80%)", "hsl(0 0% 60%)", "hsl(0 0% 90%)"];
    default: return ["hsl(350 90% 55%)", "hsl(10 100% 60%)", "hsl(330 90% 60%)"];
  }
};

const LikeAlertPreview = ({ settings }: LikeAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 4;
  const style = settings.animation_style || "hearts_rise";
  const iconSize = settings.icon_size || 48;
  const glowIntensity = (settings.glow_intensity || 60) / 100;
  const particleCount = settings.particle_count || 12;
  const colors = getColors(settings.color_mode || "warm");
  const showCount = settings.show_count ?? true;

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % mockLikes.length);
        setVisible(true);
      }, 600);
    }, duration * 1000);
    return () => clearInterval(cycle);
  }, [duration]);

  const like = mockLikes[currentIdx];

  const getMainAnimation = () => {
    switch (style) {
      case "pulse_burst": return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 1.3, 1], opacity: 1 },
      };
      case "neon_wave": return {
        initial: { opacity: 0, x: -60 },
        animate: { opacity: 1, x: 0 },
      };
      case "sparkle_trail": return {
        initial: { opacity: 0, y: 40, rotate: -15 },
        animate: { opacity: 1, y: 0, rotate: 0 },
      };
      case "vortex": return {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
      };
      case "ripple_glow": return {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
      };
      default: return {
        initial: { y: 30, opacity: 0, scale: 0.8 },
        animate: { y: 0, opacity: 1, scale: 1 },
      };
    }
  };

  const anim = getMainAnimation();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentIdx}
            className="relative flex flex-col items-center"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: iconSize * 2, height: iconSize * 2,
                background: `radial-gradient(circle, ${colors[0].replace(")", ` / ${0.15 * glowIntensity})`)}, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Ripple rings for ripple_glow */}
            {style === "ripple_glow" && [0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: iconSize * 1.5, height: iconSize * 1.5,
                  borderColor: colors[i % colors.length].replace(")", " / 0.3)"),
                }}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}

            {/* Heart particles */}
            {Array.from({ length: particleCount }).map((_, i) => (
              <HeartParticle key={i} index={i} total={particleCount} color={colors[i % colors.length]} />
            ))}

            {/* Main heart icon */}
            <motion.div
              className="relative rounded-full flex items-center justify-center mb-3"
              style={{
                width: iconSize, height: iconSize,
                background: `linear-gradient(135deg, ${colors[0].replace(")", " / 0.15)")}, ${colors[1].replace(")", " / 0.08)")})`,
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors[0].replace(")", " / 0.25)")}`,
                boxShadow: `0 0 ${20 * glowIntensity}px ${colors[0].replace(")", " / 0.2)")}`,
              }}
              animate={{
                scale: [1, 1.15, 1],
                boxShadow: [
                  `0 0 ${10 * glowIntensity}px ${colors[0].replace(")", " / 0.1)")}`,
                  `0 0 ${30 * glowIntensity}px ${colors[0].replace(")", " / 0.3)")}`,
                  `0 0 ${10 * glowIntensity}px ${colors[0].replace(")", " / 0.1)")}`,
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span style={{ fontSize: iconSize * 0.5 }}>❤️</span>
            </motion.div>

            {/* Text */}
            <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              {settings.username_visible !== false && (
                <p className="text-sm font-bold text-white">{like.user}</p>
              )}
              {showCount && (
                <motion.p
                  className="text-lg font-heading font-black mt-0.5"
                  style={{ color: colors[0] }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.2, 1] }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  +{like.count} ❤️
                </motion.p>
              )}
              <p className="text-[10px] text-white/40 mt-0.5">liked your stream</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LikeAlertPreview;
