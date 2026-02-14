import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

interface AnimationPreviewProps {
  style: string;
  emoji: string;
  giftName: string;
  giftImage?: string;
  isPremium?: boolean;
}

const getAnimation = (style: string) => {
  switch (style) {
    case "bounce":
      return {
        initial: { scale: 0.3, opacity: 0, y: 40 },
        animate: { scale: [0.3, 1.15, 0.95, 1], opacity: 1, y: [40, -10, 5, 0] },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      };
    case "slide":
      return {
        initial: { x: -120, opacity: 0 },
        animate: { x: [null, 8, 0], opacity: 1 },
        transition: { duration: 0.5, ease: "easeOut" },
      };
    case "explosion":
      return {
        initial: { scale: 3.5, opacity: 0, rotate: -15 },
        animate: { scale: [3.5, 0.85, 1.05, 1], opacity: 1, rotate: [null, 5, 0] },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };
    case "3d_flip":
      return {
        initial: { rotateY: 180, opacity: 0, scale: 0.6 },
        animate: { rotateY: [180, -10, 0], opacity: 1, scale: [0.6, 1.05, 1] },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      };
    case "glitch":
      return {
        initial: { x: 0, opacity: 0, skewX: 20 },
        animate: {
          x: [15, -10, 8, -4, 0],
          opacity: [0, 1, 0.6, 1, 1],
          skewX: [20, -8, 5, -2, 0],
        },
        transition: { duration: 0.5, ease: "easeOut" },
      };
    case "firework":
      return {
        initial: { scale: 0, opacity: 0, y: 60 },
        animate: { scale: [0, 1.3, 1], opacity: [0, 1, 1], y: [60, -15, 0] },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      };
    default:
      return {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.4 },
      };
  }
};

const particleColors: Record<string, string[]> = {
  bounce: ["hsl(280 100% 65%)", "hsl(200 100% 60%)", "hsl(320 100% 60%)"],
  slide: ["hsl(160 100% 50%)", "hsl(180 100% 60%)"],
  explosion: ["hsl(30 100% 60%)", "hsl(50 100% 55%)", "hsl(0 100% 60%)", "hsl(280 100% 65%)"],
  "3d_flip": ["hsl(220 100% 65%)", "hsl(260 100% 70%)", "hsl(200 100% 60%)"],
  glitch: ["hsl(120 100% 50%)", "hsl(0 100% 55%)", "hsl(200 100% 60%)"],
  firework: ["hsl(50 100% 55%)", "hsl(30 100% 60%)", "hsl(0 100% 55%)", "hsl(280 100% 65%)", "hsl(160 100% 50%)"],
};

const AnimationPreview = ({ style, emoji, giftName, giftImage, isPremium }: AnimationPreviewProps) => {
  const [key, setKey] = useState(0);

  // Replay animation when style changes
  useEffect(() => {
    setKey(k => k + 1);
  }, [style]);

  // Auto-replay every 3s
  useEffect(() => {
    const interval = setInterval(() => setKey(k => k + 1), 3000);
    return () => clearInterval(interval);
  }, [style]);

  const anim = getAnimation(style);
  const colors = particleColors[style] || particleColors.bounce;
  const particleCount = style === "firework" ? 12 : style === "explosion" ? 10 : 6;

  return (
    <div className="relative w-full h-[180px] rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, hsl(280 60% 8% / 0.8), hsl(240 30% 5% / 0.95))" }}>
      
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl"
          style={{ background: `${colors[0].replace(")", " / 0.15)")}` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          className="relative flex flex-col items-center gap-2"
          initial={anim.initial}
          animate={anim.animate}
          transition={anim.transition as any}
          style={{ perspective: 800 }}
        >
          {/* Particles */}
          {[...Array(particleCount)].map((_, i) => {
            const angle = (i / particleCount) * 360;
            const dist = style === "firework" ? 70 + Math.random() * 30 : 50;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: style === "firework" ? 4 : 3,
                  height: style === "firework" ? 4 : 3,
                  background: colors[i % colors.length],
                  top: "50%",
                  left: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * dist,
                  y: Math.sin((angle * Math.PI) / 180) * dist,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.03, ease: "easeOut" }}
              />
            );
          })}

          {/* Gift icon container */}
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 30px ${colors[0].replace(")", " / 0.2)")}`,
            }}
            animate={style === "glitch" ? {
              boxShadow: [
                `0 0 20px ${colors[0].replace(")", " / 0.2)")}`,
                `3px 0 20px ${colors[1].replace(")", " / 0.3)")}, -3px 0 20px ${colors[2].replace(")", " / 0.3)")}`,
                `0 0 20px ${colors[0].replace(")", " / 0.2)")}`,
              ],
            } : undefined}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
          >
            {giftImage ? (
              <img src={giftImage} alt={giftName} className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <span className="text-3xl">{emoji}</span>
            )}
          </motion.div>

          {/* Text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[11px] font-semibold text-white/90">{giftName}</p>
            <p className="text-[9px] text-white/40">preview</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background: "linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(280 100% 60% / 0.2))", color: "hsl(45 100% 65%)", border: "1px solid hsl(45 100% 50% / 0.2)" }}>
          <Lock size={8} /> PRO
        </div>
      )}

      {/* Replay hint */}
      <button
        onClick={() => setKey(k => k + 1)}
        className="absolute bottom-2 right-2 text-[9px] text-white/30 hover:text-white/60 transition-colors"
      >
        ↻ replay
      </button>
    </div>
  );
};

export default AnimationPreview;
