import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const mockLikes = [
  { user: "Tikup_User", count: 15 },
  { user: "Tikup_User", count: 25 },
];

interface LikeAlertPreviewProps {
  settings?: Record<string, any>;
  testTrigger?: number;
}

const HeartParticle = ({ index, total, color }: { index: number; total: number; color: string }) => {
  const angle = (index / total) * 360;
  const distance = 50 + Math.random() * 40;
  return (
    <motion.div
      className="absolute z-0"
      style={{ color, fontSize: 12 + Math.random() * 10 }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle * Math.PI / 180) * distance,
        y: -distance - Math.random() * 50,
        opacity: 0,
        scale: 0.2,
        rotate: Math.random() * 360 - 180,
      }}
      transition={{ duration: 1.5 + Math.random() * 0.5, ease: "easeOut", delay: index * 0.03 }}
    >
      ❤️
    </motion.div>
  );
};

const getColors = (mode: string) => {
  switch (mode) {
    case "cool": return ["hsl(200 100% 60%)", "hsl(220 100% 65%)", "hsl(180 100% 50%)"];
    case "rainbow": return ["hsl(0 90% 60%)", "hsl(45 100% 55%)", "hsl(120 80% 50%)", "hsl(200 100% 60%)", "hsl(280 100% 65%)"];
    case "mono": return ["hsl(0 0% 90%)", "hsl(0 0% 70%)", "hsl(0 0% 100%)"];
    default: return ["hsl(350 90% 55%)", "hsl(10 100% 60%)", "hsl(330 90% 60%)"];
  }
};

const LikeAlertPreview = ({ settings = {}, testTrigger = 0 }: LikeAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 4;
  const style = settings.animation_style || "hearts_rise";
  // Scaled up icon size
  const iconSize = (settings.icon_size || 64) * 1.3;
  const glowIntensity = (settings.glow_intensity || 60) / 100;
  const particleCount = settings.particle_count || 12;
  const colors = getColors(settings.color_mode || "warm");
  const showCount = settings.show_count ?? true;

  const triggerNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % mockLikes.length);
      setVisible(true);
    }, 400);
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

  const like = mockLikes[currentIdx % mockLikes.length];

  const getMainAnimation = () => {
    switch (style) {
      case "pulse_burst": return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 1.4, 1], opacity: 1 },
      };
      case "neon_wave": return {
        initial: { opacity: 0, x: -80, rotate: -10 },
        animate: { opacity: 1, x: 0, rotate: 0 },
      };
      case "sparkle_trail": return {
        initial: { opacity: 0, y: 60, rotate: -20 },
        animate: { opacity: 1, y: 0, rotate: 0 },
      };
      case "vortex": return {
        initial: { scale: 0, rotate: -270, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
      };
      case "ripple_glow": return {
        initial: { scale: 0.4, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
      };
      default: return {
        initial: { y: 40, opacity: 0, scale: 0.7 },
        animate: { y: 0, opacity: 1, scale: 1 },
      };
    }
  };

  const anim = getMainAnimation();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentIdx}-${testTrigger}`}
            className="relative flex flex-col items-center"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: iconSize * 2.2, height: iconSize * 2.2,
                background: `radial-gradient(circle, ${colors[0].replace(")", ` / ${0.2 * glowIntensity})`)}, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Ripple rings for ripple_glow */}
            {style === "ripple_glow" && [0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  width: iconSize * 1.6, height: iconSize * 1.6,
                  borderColor: colors[i % colors.length].replace(")", " / 0.4)"),
                }}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.5 + i * 0.6, opacity: 0 }}
                transition={{ duration: 1.8, delay: i * 0.25, repeat: Infinity, repeatDelay: 0.5 }}
              />
            ))}

            {/* Heart particles */}
            {Array.from({ length: particleCount }).map((_, i) => (
              <HeartParticle key={i} index={i} total={particleCount} color={colors[i % colors.length]} />
            ))}

            {/* Main heart icon */}
            <motion.div
              className="relative rounded-full flex items-center justify-center mb-4 z-10"
              style={{
                width: iconSize, height: iconSize,
                background: `linear-gradient(135deg, ${colors[0].replace(")", " / 0.2)")}, ${colors[1].replace(")", " / 0.1)")})`,
                backdropFilter: "blur(16px)",
                border: `2px solid ${colors[0].replace(")", " / 0.4)")}`,
                boxShadow: `0 0 30px ${colors[0].replace(")", " / 0.25)")}`,
              }}
              animate={{
                scale: [1, 1.18, 1],
                boxShadow: [
                  `0 0 15px ${colors[0].replace(")", " / 0.15)")}`,
                  `0 0 45px ${colors[0].replace(")", " / 0.45)")}`,
                  `0 0 15px ${colors[0].replace(")", " / 0.15)")}`,
                ],
              }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <span style={{ fontSize: iconSize * 0.55 }}>❤️</span>
            </motion.div>

            {/* Text content - Larger and bold */}
            <motion.div className="text-center z-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              {settings.username_visible !== false && (
                <p className="text-lg font-black text-white tracking-tight drop-shadow-lg">{like.user}</p>
              )}
              {showCount && (
                <motion.p
                  className="text-2xl font-heading font-black mt-1.5"
                  style={{ color: colors[0], textShadow: `0 0 15px ${colors[0].replace(")", " / 0.5)")}` }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.25, 1] }}
                  transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
                >
                  +{like.count} ❤️
                </motion.p>
              )}
              <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest">liked stream</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LikeAlertPreview;