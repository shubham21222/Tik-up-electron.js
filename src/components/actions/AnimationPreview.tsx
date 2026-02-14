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
    case "tikup_signature":
      return {
        initial: { scale: 0, opacity: 0, rotate: -180 },
        animate: { scale: [0, 1.3, 0.9, 1.05, 1], opacity: 1, rotate: [-180, 10, -5, 0] },
        transition: { duration: 1.0, ease: "easeOut" },
      };
    case "bounce":
      return {
        initial: { scale: 0.3, opacity: 0, y: 40 },
        animate: { scale: [0.3, 1.15, 0.95, 1], opacity: 1, y: [40, -10, 5, 0] },
        transition: { duration: 0.7 },
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
        transition: { duration: 0.6 },
      };
    case "neon_pulse":
      return {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: [0.5, 1.1, 0.95, 1.02, 1], opacity: 1 },
        transition: { duration: 0.8, ease: "easeOut" },
      };
    case "cosmic_burst":
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 2, 0.8, 1.05, 1], opacity: [0, 0.6, 1, 1, 1] },
        transition: { duration: 1.2, ease: "easeOut" },
      };
    case "3d_flip":
      return {
        initial: { rotateY: 0, opacity: 1, scale: 1 },
        animate: { rotateY: [0, 180, 360], scale: [1, 0.85, 1], opacity: 1 },
        transition: { duration: 1.0, ease: "easeInOut" },
      };
    case "liquid_wave":
      return {
        initial: { scale: 0.3, opacity: 0, y: 60 },
        animate: { scale: [0.3, 1.1, 0.95, 1], opacity: 1, y: [60, -15, 8, 0] },
        transition: { duration: 1.0, ease: [0.34, 1.56, 0.64, 1] },
      };
    case "firework":
      return {
        initial: { scale: 0, opacity: 0, y: 80 },
        animate: { scale: [0, 0.3, 1.6, 0.9, 1.1, 1], opacity: [0, 0.5, 1, 1, 1, 1], y: [80, 40, -25, 5, -5, 0] },
        transition: { duration: 1.0, ease: "easeOut" },
      };
    case "glitch":
      return {
        initial: { x: 0, opacity: 0, scaleX: 1.8, scaleY: 0.3 },
        animate: {
          x: [40, -30, 20, -15, 8, -3, 0],
          opacity: [0, 1, 0.3, 1, 0.5, 1, 1],
          scaleX: [1.8, 0.7, 1.3, 0.9, 1.1, 0.98, 1],
          scaleY: [0.3, 1.4, 0.8, 1.2, 0.95, 1.02, 1],
          skewX: [25, -15, 10, -6, 3, -1, 0],
        },
        transition: { duration: 0.7, ease: "easeOut" },
      };
    case "arc_reactor":
      return {
        initial: { scale: 0, opacity: 0, rotate: -90 },
        animate: { scale: [0, 0.5, 1.3, 0.9, 1], opacity: [0, 0.8, 1, 1, 1], rotate: [-90, 0, 10, -5, 0] },
        transition: { duration: 1.1, ease: "easeOut" },
      };
    case "flames_rising":
      return {
        initial: { scale: 0.6, opacity: 0, y: 40 },
        animate: { scale: [0.6, 1.2, 0.95, 1], opacity: 1, y: [40, -8, 2, 0] },
        transition: { duration: 0.8, ease: "easeOut" },
      };
    case "icy_blast":
      return {
        initial: { scale: 1.8, opacity: 0 },
        animate: { scale: [1.8, 0.85, 1.05, 1], opacity: [0, 0.8, 1, 1] },
        transition: { duration: 0.7, ease: "easeOut" },
      };
    case "christmas_spark":
      return {
        initial: { scale: 0, opacity: 0, rotate: -30 },
        animate: { scale: [0, 1.2, 0.9, 1.05, 1], opacity: 1, rotate: [-30, 5, -2, 0] },
        transition: { duration: 1.0, ease: "easeOut" },
      };
    case "snowfall":
      return {
        initial: { scale: 0.5, opacity: 0, y: -30 },
        animate: { scale: [0.5, 1.05, 1], opacity: 1, y: [-30, 5, 0] },
        transition: { duration: 0.9, ease: "easeOut" },
      };
    case "cyber_pulse":
      return {
        initial: { scaleX: 2, scaleY: 0.3, opacity: 0 },
        animate: { scaleX: [2, 0.8, 1.1, 1], scaleY: [0.3, 1.2, 0.95, 1], opacity: 1 },
        transition: { duration: 0.6, ease: "easeOut" },
      };
    case "explosion_burst":
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 2.5, 0.8, 1.1, 1], opacity: [0, 1, 1, 1, 1] },
        transition: { duration: 0.7, ease: "easeOut" },
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
  tikup_signature: ["hsl(160 100% 50%)", "hsl(280 100% 65%)", "hsl(200 100% 60%)"],
  bounce: ["hsl(280 100% 65%)", "hsl(200 100% 60%)", "hsl(320 100% 60%)"],
  slide: ["hsl(160 100% 50%)", "hsl(180 100% 60%)"],
  explosion: ["hsl(30 100% 60%)", "hsl(50 100% 55%)", "hsl(0 100% 60%)", "hsl(280 100% 65%)"],
  neon_pulse: ["hsl(160 100% 55%)", "hsl(180 100% 60%)", "hsl(200 100% 65%)", "hsl(140 100% 50%)"],
  cosmic_burst: ["hsl(260 100% 70%)", "hsl(280 100% 65%)", "hsl(320 80% 60%)", "hsl(200 100% 70%)", "hsl(50 100% 65%)"],
  "3d_flip": ["hsl(220 100% 70%)", "hsl(280 100% 75%)", "hsl(200 100% 65%)", "hsl(320 80% 65%)"],
  liquid_wave: ["hsl(200 100% 60%)", "hsl(180 100% 55%)", "hsl(220 100% 65%)", "hsl(160 100% 50%)"],
  glitch: ["hsl(0 100% 55%)", "hsl(120 100% 55%)", "hsl(200 100% 65%)", "hsl(50 100% 60%)"],
  firework: ["hsl(50 100% 60%)", "hsl(30 100% 55%)", "hsl(0 100% 55%)", "hsl(280 100% 65%)", "hsl(160 100% 55%)", "hsl(200 100% 65%)"],
  arc_reactor: ["hsl(200 100% 70%)", "hsl(180 100% 65%)", "hsl(220 100% 75%)", "hsl(160 100% 60%)"],
  flames_rising: ["hsl(15 100% 55%)", "hsl(35 100% 55%)", "hsl(50 100% 60%)", "hsl(0 100% 50%)"],
  icy_blast: ["hsl(200 100% 75%)", "hsl(190 100% 80%)", "hsl(210 80% 85%)", "hsl(180 100% 65%)"],
  christmas_spark: ["hsl(0 100% 50%)", "hsl(120 100% 40%)", "hsl(45 100% 55%)", "hsl(0 80% 60%)"],
  snowfall: ["hsl(210 30% 90%)", "hsl(200 40% 85%)", "hsl(220 20% 95%)", "hsl(0 0% 100%)"],
  cyber_pulse: ["hsl(180 100% 55%)", "hsl(300 100% 60%)", "hsl(200 100% 65%)", "hsl(320 80% 55%)"],
  explosion_burst: ["hsl(40 100% 55%)", "hsl(20 100% 50%)", "hsl(0 100% 55%)", "hsl(50 100% 65%)", "hsl(30 90% 50%)"],
};

const AnimationPreview = ({ style, emoji, giftName, giftImage, isPremium }: AnimationPreviewProps) => {
  const [key, setKey] = useState(0);

  useEffect(() => { setKey(k => k + 1); }, [style]);
  useEffect(() => {
    const interval = setInterval(() => setKey(k => k + 1), 3500);
    return () => clearInterval(interval);
  }, [style]);

  const anim = getAnimation(style);
  const colors = particleColors[style] || particleColors.bounce;
  const is3dFlip = style === "3d_flip";
  const isGlitch = style === "glitch";
  const isFirework = style === "firework";
  const isNeonPulse = style === "neon_pulse";
  const isCosmicBurst = style === "cosmic_burst";
  const isLiquidWave = style === "liquid_wave";
  const isArcReactor = style === "arc_reactor";
  const isTikupSignature = style === "tikup_signature";
  const isFlames = style === "flames_rising";
  const isIcyBlast = style === "icy_blast";
  const isChristmas = style === "christmas_spark";
  const isSnowfall = style === "snowfall";
  const isCyberPulse = style === "cyber_pulse";
  const isExplosionBurst = style === "explosion_burst";
  const particleCount = isFirework || isCosmicBurst || isExplosionBurst ? 20 : isArcReactor || isFlames ? 16 : is3dFlip ? 8 : isGlitch || isCyberPulse ? 14 : isNeonPulse || isIcyBlast ? 12 : isChristmas || isSnowfall ? 18 : 6;

  return (
    <div className="relative w-full h-[200px] rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, hsl(280 60% 8% / 0.8), hsl(240 30% 5% / 0.95))" }}>
      
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          key={`glow-${key}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            width: isPremium ? 180 : 120,
            height: isPremium ? 180 : 120,
            background: `${colors[0].replace(")", " / 0.12)")}`,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.3, 1], opacity: [0, 0.3, 0.15] }}
          transition={{ duration: 1 }}
        />
        {isPremium && (
          <motion.div
            key={`glow2-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
            style={{ width: 100, height: 100, background: `${colors[1].replace(")", " / 0.1)")}` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 1.2], opacity: [0, 0.25, 0.08] }}
            transition={{ duration: 1.2, delay: 0.15 }}
          />
        )}
      </div>

      {/* Neon Pulse rings */}
      {isNeonPulse && (
        <>
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={`neon-ring-${key}-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 50,
                height: 50,
                border: `2px solid ${colors[i % colors.length].replace(")", " / 0.6)")}`,
                boxShadow: `0 0 15px ${colors[i % colors.length].replace(")", " / 0.3)")}, inset 0 0 15px ${colors[i % colors.length].replace(")", " / 0.1)")}`,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2 + i * 0.5], opacity: [0.8, 0] }}
              transition={{ duration: 1.2, delay: 0.1 + i * 0.15, ease: "easeOut", repeat: Infinity, repeatDelay: 2 }}
            />
          ))}
        </>
      )}

      {/* Cosmic Burst starburst */}
      {isCosmicBurst && (
        <>
          <motion.div
            key={`starburst-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-2xl"
            style={{ width: 200, height: 200, background: `radial-gradient(circle, ${colors[0].replace(")", " / 0.3)")}, transparent)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0.8], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.5, delay: 0.1 }}
          />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-ray-${key}-${i}`}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                width: 2,
                height: 40,
                background: `linear-gradient(180deg, ${colors[i % colors.length].replace(")", " / 0.6)")}, transparent)`,
                transformOrigin: "center top",
                rotate: `${i * 45}deg`,
              }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
            />
          ))}
        </>
      )}

      {/* Liquid Wave background */}
      {isLiquidWave && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`wave-${key}-${i}`}
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: 80,
                background: `linear-gradient(180deg, transparent, ${colors[i % colors.length].replace(")", " / 0.08)")})`,
                borderRadius: "50% 50% 0 0",
              }}
              initial={{ y: 80, scaleY: 0 }}
              animate={{ y: [80, -10 - i * 10, 20 - i * 5], scaleY: [0, 1.2, 0.8] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          ))}
        </>
      )}

      {/* Arc Reactor rings */}
      {isArcReactor && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`arc-ring-${key}-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 60 + i * 25,
                height: 60 + i * 25,
                border: `1.5px solid ${colors[i % colors.length].replace(")", " / 0.4)")}`,
                boxShadow: `0 0 20px ${colors[i % colors.length].replace(")", " / 0.2)")}, inset 0 0 10px ${colors[i % colors.length].replace(")", " / 0.1)")}`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.5], rotate: [0, 120 * (i % 2 === 0 ? 1 : -1)] }}
              transition={{ duration: 1.5, delay: 0.1 + i * 0.15, ease: "easeOut" }}
            />
          ))}
          {/* Energy core */}
          <motion.div
            key={`arc-core-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-md"
            style={{ width: 40, height: 40, background: `radial-gradient(circle, ${colors[0].replace(")", " / 0.5)")}, transparent)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </>
      )}

      {/* TikUp Signature background pulse */}
      {isTikupSignature && (
        <>
          <motion.div
            key={`sig-pulse-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-2xl"
            style={{ width: 150, height: 150, background: "radial-gradient(circle, hsl(160 100% 50% / 0.15), transparent)" }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.5, 1], opacity: [0, 0.4, 0.15] }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            key={`sig-ring-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: 80, height: 80, border: "2px solid hsl(160 100% 50% / 0.3)" }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.0, delay: 0.3 }}
          />
        </>
      )}

      {/* Flames Rising — dramatic fire rising from bottom */}
      {isFlames && (
        <>
          {/* Large flame tongues */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`flame-lg-${key}-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: 14 + (i % 3) * 8,
                height: 50 + (i % 4) * 20,
                left: `${5 + i * 12}%`,
                bottom: 0,
                background: `linear-gradient(180deg, transparent 0%, ${
                  i % 3 === 0 ? "hsl(45 100% 60% / 0.6)" : i % 3 === 1 ? "hsl(25 100% 55% / 0.7)" : "hsl(10 100% 50% / 0.6)"
                } 40%, ${
                  i % 2 === 0 ? "hsl(15 100% 50% / 0.9)" : "hsl(35 100% 55% / 0.8)"
                } 100%)`,
                borderRadius: "50% 50% 30% 30%",
                filter: "blur(3px)",
              }}
              animate={{
                y: [10, -30 - (i % 3) * 15, -50 - (i % 4) * 10, 10],
                scaleX: [0.8, 1.2, 0.9, 0.8],
                scaleY: [0.6, 1.1, 0.8, 0.6],
                opacity: [0.3, 0.8, 0.5, 0.3],
              }}
              transition={{
                duration: 0.8 + (i % 3) * 0.3,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* Small ember particles */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`ember-${key}-${i}`}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 3 + (i % 3) * 2,
                height: 3 + (i % 3) * 2,
                left: `${8 + i * 5.5}%`,
                bottom: 10,
                background: i % 4 === 0 ? "hsl(50 100% 70%)" : i % 4 === 1 ? "hsl(30 100% 60%)" : i % 4 === 2 ? "hsl(10 100% 55%)" : "hsl(40 100% 65%)",
                boxShadow: `0 0 4px ${i % 2 === 0 ? "hsl(35 100% 55%)" : "hsl(15 100% 50%)"}`,
              }}
              initial={{ y: 0, opacity: 0, scale: 0.3 }}
              animate={{
                y: [-10, -60 - (i % 5) * 20, -100 - (i % 3) * 15],
                x: [(i % 2 === 0 ? -1 : 1) * (3 + i % 4 * 2), (i % 2 === 0 ? 1 : -1) * 5],
                opacity: [0, 0.9, 0],
                scale: [0.3, 1, 0.2],
              }}
              transition={{
                duration: 1.0 + (i % 3) * 0.3,
                delay: i * 0.07,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
          {/* Bottom fire glow */}
          <motion.div
            key={`flame-glow-${key}`}
            className="absolute bottom-0 left-0 right-0 pointer-events-none blur-2xl"
            style={{ height: 80, background: "linear-gradient(180deg, transparent, hsl(25 100% 50% / 0.25), hsl(15 100% 45% / 0.35))" }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {/* Hot core glow at center bottom */}
          <motion.div
            key={`flame-core-${key}`}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none rounded-full blur-xl"
            style={{ width: 120, height: 50, background: "radial-gradient(ellipse, hsl(40 100% 60% / 0.3), transparent)" }}
            animate={{ scaleX: [0.9, 1.2, 0.9], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.0, repeat: Infinity }}
          />
        </>
      )}

      {/* Icy Blast — frost shards */}
      {isIcyBlast && (
        <>
          {[...Array(10)].map((_, i) => {
            const angle = (i / 10) * 360;
            return (
              <motion.div
                key={`ice-${key}-${i}`}
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: 3,
                  height: 20 + Math.random() * 15,
                  background: `linear-gradient(180deg, ${colors[i % colors.length]}, transparent)`,
                  transformOrigin: "center bottom",
                  rotate: `${angle}deg`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: [0, 1.2, 0.8], opacity: [0, 0.7, 0] }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
              />
            );
          })}
          <motion.div
            key={`frost-${key}`}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(200 100% 80% / 0.08), transparent)" }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 1.0 }}
          />
        </>
      )}

      {/* Christmas Spark — sparkle bursts + ornament colors */}
      {isChristmas && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`xmas-star-${key}-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: colors[i % colors.length],
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                boxShadow: `0 0 8px ${colors[i % colors.length]}`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.0, delay: i * 0.12, repeat: Infinity, repeatDelay: 1.5 }}
            />
          ))}
        </>
      )}

      {/* Snowfall — gentle particles drifting down */}
      {isSnowfall && (
        <>
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`snow-${key}-${i}`}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                background: colors[i % colors.length],
                left: `${5 + i * 6}%`,
                top: -10,
                filter: "blur(0.5px)",
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: [null, 220], x: [0, (Math.random() - 0.5) * 30], opacity: [0, 0.7, 0.5, 0] }}
              transition={{ duration: 2.5 + Math.random(), delay: i * 0.15, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </>
      )}

      {/* Cyber Pulse — electric lines + scan effect */}
      {isCyberPulse && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`cyber-line-${key}-${i}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: 2,
                top: `${20 + i * 20}%`,
                background: `linear-gradient(90deg, transparent, ${colors[i % colors.length].replace(")", " / 0.6)")}, transparent)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.2, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, repeat: Infinity, repeatDelay: 2 }}
            />
          ))}
          {[0, 1].map(i => (
            <motion.div
              key={`cyber-ring-${key}-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 50,
                height: 50,
                border: `1.5px solid ${colors[i].replace(")", " / 0.5)")}`,
                boxShadow: `0 0 12px ${colors[i].replace(")", " / 0.3)")}`,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2 + i], opacity: [0.8, 0] }}
              transition={{ duration: 1.0, delay: 0.2 + i * 0.2, repeat: Infinity, repeatDelay: 1.5 }}
            />
          ))}
        </>
      )}

      {/* Explosion Burst — bright burst + debris */}
      {isExplosionBurst && (
        <>
          <motion.div
            key={`burst-flash-${key}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-xl"
            style={{ width: 120, height: 120, background: `radial-gradient(circle, ${colors[0].replace(")", " / 0.4)")}, transparent)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1], opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6 }}
          />
          {[0, 1, 2].map(i => (
            <motion.div
              key={`burst-ring-${key}-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ width: 40, height: 40, border: `2px solid ${colors[i % colors.length].replace(")", " / 0.5)")}` }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 3 + i], opacity: [1, 0] }}
              transition={{ duration: 0.6 + i * 0.1, delay: 0.1 + i * 0.08 }}
            />
          ))}
        </>
      )}

      {/* Glitch scanlines */}
      {isGlitch && (
        <AnimatePresence>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`scan-${key}-${i}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: 1 + Math.random() * 2,
                top: `${15 + i * 18}%`,
                background: `linear-gradient(90deg, transparent, ${colors[i % colors.length].replace(")", " / 0.4)")}, transparent)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.5, 0], opacity: [0, 0.8, 0], x: ["-50%", "50%"] }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Firework rings */}
      {isFirework && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${key}-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ width: 60, height: 60, border: `2px solid ${colors[i % colors.length].replace(")", " / 0.5)")}` }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: [0, 3 + i * 0.8], opacity: [0.9, 0] }}
              transition={{ duration: 0.8 + i * 0.15, delay: 0.3 + i * 0.12, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* 3D Flip reflection */}
      {is3dFlip && (
        <motion.div
          key={`reflect-${key}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          initial={{ rotateY: -90, opacity: 0.5, scale: 1.2 }}
          animate={{ rotateY: [null, 0], opacity: [0.5, 0], scale: [1.2, 0.8] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          className="relative flex flex-col items-center gap-2"
          initial={anim.initial}
          animate={anim.animate}
          transition={anim.transition as any}
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        >
          {/* Particles */}
          {[...Array(particleCount)].map((_, i) => {
            const angle = (i / particleCount) * 360 + (isFirework || isCosmicBurst || isExplosionBurst ? Math.random() * 20 : 0);
            const dist = isFirework || isExplosionBurst ? 40 + Math.random() * 60
              : isCosmicBurst ? 50 + Math.random() * 50
              : isArcReactor ? 30 + Math.random() * 40
              : is3dFlip ? 35 + Math.random() * 25
              : isGlitch || isCyberPulse ? 25 + Math.random() * 40
              : isNeonPulse || isIcyBlast ? 35 + Math.random() * 30
              : isFlames ? 20 + Math.random() * 50
              : isChristmas || isSnowfall ? 30 + Math.random() * 40
              : 50;
            const size = isFirework || isExplosionBurst ? 2 + Math.random() * 4 : isGlitch || isCyberPulse ? 1 + Math.random() * 6 : isCosmicBurst ? 2 + Math.random() * 3 : isSnowfall ? 2 + Math.random() * 3 : 3;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: isGlitch ? size * 3 : size,
                  height: isGlitch ? 1 : size,
                  borderRadius: isGlitch ? 0 : "50%",
                  background: colors[i % colors.length],
                  top: "50%",
                  left: "50%",
                  boxShadow: isPremium ? `0 0 6px ${colors[i % colors.length].replace(")", " / 0.6)")}` : "none",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * dist,
                  y: Math.sin((angle * Math.PI) / 180) * dist + (isFirework ? 20 : 0),
                  opacity: [0, 1, isFirework ? 0.8 : 1, 0],
                  scale: [0, isPremium ? 2 : 1.5, isPremium ? 1 : 0.5, 0],
                  rotate: isGlitch ? [0, 90 * (i % 2 === 0 ? 1 : -1)] : undefined,
                }}
                transition={{
                  duration: isFirework ? 1.0 : isCosmicBurst ? 1.2 : isGlitch ? 0.4 : 0.8,
                  delay: isFirework ? 0.3 + i * 0.02 : 0.15 + i * 0.03,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Firework trailing sparks */}
          {isFirework && [...Array(8)].map((_, i) => (
            <motion.div
              key={`trail-${i}`}
              className="absolute rounded-full"
              style={{ width: 2, height: 2, background: "hsl(50 100% 80%)", top: "50%", left: "50%" }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos(((i * 45) * Math.PI) / 180) * (30 + Math.random() * 20),
                y: Math.sin(((i * 45) * Math.PI) / 180) * (30 + Math.random() * 20) + 30,
                opacity: [0, 0.6, 0],
              }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.04, ease: "easeOut" }}
            />
          ))}

          {/* Gift icon container */}
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 30px ${colors[0].replace(")", " / 0.25)")}`,
            }}
            animate={
              isGlitch
                ? {
                    boxShadow: [
                      `0 0 15px ${colors[0].replace(")", " / 0.2)")}`,
                      `4px 0 25px ${colors[0].replace(")", " / 0.5)")}, -4px 0 25px ${colors[1].replace(")", " / 0.5)")}`,
                      `-3px 0 20px ${colors[2].replace(")", " / 0.4)")}, 3px 0 20px ${colors[0].replace(")", " / 0.3)")}`,
                      `0 0 15px ${colors[0].replace(")", " / 0.2)")}`,
                    ],
                    x: [0, -2, 3, -1, 0],
                  }
                : isNeonPulse
                ? {
                    boxShadow: [
                      `0 0 15px ${colors[0].replace(")", " / 0.2)")}`,
                      `0 0 40px ${colors[0].replace(")", " / 0.5)")}, 0 0 60px ${colors[1].replace(")", " / 0.3)")}`,
                      `0 0 15px ${colors[0].replace(")", " / 0.2)")}`,
                    ],
                    border: [
                      `1px solid ${colors[0].replace(")", " / 0.2)")}`,
                      `2px solid ${colors[0].replace(")", " / 0.6)")}`,
                      `1px solid ${colors[0].replace(")", " / 0.2)")}`,
                    ],
                  }
                : isArcReactor
                ? {
                    boxShadow: [
                      `0 0 20px ${colors[0].replace(")", " / 0.2)")}`,
                      `0 0 50px ${colors[0].replace(")", " / 0.5)")}, 0 0 80px ${colors[1].replace(")", " / 0.3)")}`,
                      `0 0 20px ${colors[0].replace(")", " / 0.2)")}`,
                    ],
                  }
                : is3dFlip
                ? {
                    boxShadow: [
                      `0 0 20px ${colors[0].replace(")", " / 0.15)")}`,
                      `0 0 40px ${colors[1].replace(")", " / 0.3)")}, 0 0 60px ${colors[2].replace(")", " / 0.15)")}`,
                      `0 0 20px ${colors[0].replace(")", " / 0.15)")}`,
                    ],
                  }
                : isFirework
                ? {
                    boxShadow: [
                      `0 0 20px ${colors[0].replace(")", " / 0.2)")}`,
                      `0 0 50px ${colors[0].replace(")", " / 0.5)")}, 0 0 80px ${colors[3].replace(")", " / 0.3)")}`,
                      `0 0 25px ${colors[0].replace(")", " / 0.15)")}`,
                    ],
                  }
                : isTikupSignature
                ? {
                    boxShadow: [
                      `0 0 15px hsl(160 100% 50% / 0.15)`,
                      `0 0 35px hsl(160 100% 50% / 0.35), 0 0 60px hsl(280 100% 65% / 0.15)`,
                      `0 0 15px hsl(160 100% 50% / 0.15)`,
                    ],
                  }
                : undefined
            }
            transition={{
              duration: isGlitch ? 0.4 : 1.5,
              repeat: Infinity,
              repeatDelay: isGlitch ? 0.8 : 0.5,
            }}
          >
            {/* Glitch RGB split layers */}
            {isGlitch && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ mixBlendMode: "screen" }}
                  animate={{ x: [0, 3, -2, 0], opacity: [0, 0.5, 0.3, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  {giftImage ? (
                    <img src={giftImage} alt="" className="w-10 h-10 object-contain" style={{ filter: "hue-rotate(120deg) saturate(3)" }} />
                  ) : (
                    <span className="text-3xl" style={{ filter: "hue-rotate(120deg)" }}>{emoji}</span>
                  )}
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ mixBlendMode: "screen" }}
                  animate={{ x: [0, -3, 2, 0], opacity: [0, 0.4, 0.2, 0] }}
                  transition={{ duration: 0.3, delay: 0.05, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  {giftImage ? (
                    <img src={giftImage} alt="" className="w-10 h-10 object-contain" style={{ filter: "hue-rotate(-60deg) saturate(3)" }} />
                  ) : (
                    <span className="text-3xl" style={{ filter: "hue-rotate(-60deg)" }}>{emoji}</span>
                  )}
                </motion.div>
              </>
            )}

            {giftImage ? (
              <img src={giftImage} alt={giftName} className="w-10 h-10 object-contain relative z-10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <span className="text-3xl relative z-10">{emoji}</span>
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

      {isPremium && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background: "linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(280 100% 60% / 0.2))", color: "hsl(45 100% 65%)", border: "1px solid hsl(45 100% 50% / 0.2)" }}>
          <Lock size={8} /> PRO
        </div>
      )}

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
