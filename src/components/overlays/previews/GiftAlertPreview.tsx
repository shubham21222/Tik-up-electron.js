import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const mockAlerts = [
  { user: "GiftKing", gift: "Rose", emoji: "🌹", value: 1 },
  { user: "StreamLover99", gift: "Lion", emoji: "🦁", value: 500 },
  { user: "TikTokPro", gift: "Universe", emoji: "🌌", value: 10000 },
  { user: "CoolViewer42", gift: "Crown", emoji: "👑", value: 2000 },
];

interface GiftAlertPreviewProps {
  settings: Record<string, any>;
}

const getEntryVariants = (style: string) => {
  switch (style) {
    case "slide": return { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "explosion": return { initial: { scale: 3, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "flip_3d": return { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 } };
    case "glitch": return { initial: { x: [-5, 5, -3, 0], opacity: 0 }, animate: { x: 0, opacity: 1 } };
    default: return { initial: { scale: 0.3, opacity: 0, y: 30 }, animate: { scale: 1, opacity: 1, y: 0 } };
  }
};

const GiftAlertPreview = ({ settings }: GiftAlertPreviewProps) => {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 5;
  const animStyle = settings.animation_style || "bounce";
  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const imageSize = settings.gift_image_size || 64;
  const borderGlow = settings.border_glow ?? true;

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentAlert(prev => (prev + 1) % mockAlerts.length);
        setVisible(true);
      }, 800);
    }, duration * 1000);
    return () => clearInterval(cycle);
  }, [duration]);

  const alert = mockAlerts[currentAlert];
  const variants = getEntryVariants(animStyle);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentAlert}
            className="relative flex flex-col items-center"
            initial={variants.initial}
            animate={variants.animate}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding rings */}
            <motion.div
              className="absolute rounded-full border"
              style={{
                width: imageSize * 1.5, height: imageSize * 1.5,
                borderColor: `hsl(280 100% 65% / ${0.3 * glowIntensity})`,
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5 }}
            />
            {borderGlow && (
              <motion.div
                className="absolute rounded-full border"
                style={{
                  width: imageSize * 1.5, height: imageSize * 1.5,
                  borderColor: `hsl(280 100% 65% / ${0.2 * glowIntensity})`,
                }}
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.15 }}
              />
            )}

            {/* Glow */}
            <motion.div
              className="absolute rounded-full blur-2xl"
              style={{
                width: imageSize, height: imageSize,
                background: `hsl(280 100% 65% / ${0.08 * glowIntensity})`,
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Gift icon */}
            <motion.div
              className="relative rounded-full flex items-center justify-center mb-4"
              style={{
                width: imageSize, height: imageSize,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                border: `1px solid hsl(280 100% 65% / ${0.2 * glowIntensity})`,
              }}
              animate={borderGlow ? {
                boxShadow: [
                  `0 0 0px hsl(280 100% 65% / 0)`,
                  `0 0 ${30 * glowIntensity}px hsl(280 100% 65% / ${0.2 * glowIntensity})`,
                  `0 0 0px hsl(280 100% 65% / 0)`,
                ],
              } : undefined}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span style={{ fontSize: imageSize * 0.45 }}>{alert.emoji}</span>
            </motion.div>

            {/* Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ background: "hsl(280 100% 65%)" }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 60,
                  y: Math.sin((i * 60) * Math.PI / 180) * 60,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            ))}

            {/* Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className={`text-sm font-bold text-white tracking-wide ${
                settings.username_font === "mono" ? "font-mono" : settings.username_font === "heading" ? "font-heading" : ""
              }`}>{alert.user}</p>
              <p className="text-[11px] text-white/50 mt-0.5">sent a gift!</p>
              <p className="text-xs font-semibold mt-1" style={{ color: "hsl(280 100% 70%)" }}>{alert.gift}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftAlertPreview;
