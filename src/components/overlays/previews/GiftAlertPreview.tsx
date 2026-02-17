import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const mockAlerts = [
  { user: "Tikup_User", gift: "Rose", emoji: "🌹", value: 1, count: 1 },
  { user: "Tikup_User", gift: "Lion", emoji: "🦁", value: 500, count: 3 },
  { user: "Tikup_User", gift: "Universe", emoji: "🌌", value: 10000, count: 1 },
  { user: "Tikup_User", gift: "Crown", emoji: "👑", value: 2000, count: 7 },
];

const getEntryVariants = (style: string) => {
  switch (style) {
    case "slide": return { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "explosion": return { initial: { scale: 3, opacity: 0, rotate: 15 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "flip_3d": return { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 } };
    case "glitch": return { initial: { x: [-5, 5, -3, 0], opacity: 0, skewX: 5 }, animate: { x: 0, opacity: 1, skewX: 0 } };
    case "flames_rising": return { initial: { scale: 0.6, opacity: 0, y: 30 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "icy_blast": return { initial: { scale: 1.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "cyber_pulse": return { initial: { scaleX: 2, scaleY: 0.3, opacity: 0 }, animate: { scaleX: 1, scaleY: 1, opacity: 1 } };
    case "explosion_burst": return { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    default: return { initial: { scale: 0.3, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 } };
  }
};

const getFontFamily = (f: string) => {
  switch (f) {
    case "inter": return "'Inter', sans-serif";
    case "space-grotesk": return "'Space Grotesk', sans-serif";
    case "orbitron": return "'Orbitron', sans-serif";
    case "bebas": return "'Bebas Neue', sans-serif";
    case "press-start": return "'Press Start 2P', cursive";
    default: return "inherit";
  }
};

const getBgStyle = (bgStyle: string, accentColor: string, glowIntensity: number) => {
  switch (bgStyle) {
    case "glass": return {
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(24px) saturate(1.5)",
      border: `1px solid hsl(${accentColor} / ${0.15 * glowIntensity})`,
      borderRadius: "20px",
    };
    case "neon": return {
      background: "rgba(0,0,0,0.7)",
      border: `2px solid hsl(${accentColor} / ${0.6 * glowIntensity})`,
      borderRadius: "16px",
      boxShadow: `0 0 ${20 * glowIntensity}px hsl(${accentColor} / ${0.25 * glowIntensity}), inset 0 0 ${15 * glowIntensity}px hsl(${accentColor} / ${0.05 * glowIntensity})`,
    };
    case "solid": return {
      background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), rgba(0,0,0,0.8))`,
      border: `1px solid hsl(${accentColor} / ${0.1 * glowIntensity})`,
      borderRadius: "16px",
    };
    default: return {};
  }
};

const getPositionClass = (pos: string) => {
  switch (pos) {
    case "top": return "items-start justify-center pt-6";
    case "bottom": return "items-end justify-center pb-6";
    case "top-left": return "items-start justify-start pt-6 pl-6";
    case "top-right": return "items-start justify-end pt-6 pr-6";
    case "bottom-left": return "items-end justify-start pb-6 pl-6";
    case "bottom-right": return "items-end justify-end pb-6 pr-6";
    default: return "items-center justify-center";
  }
};

interface GiftAlertPreviewProps {
  settings?: Record<string, any>;
}

const GiftAlertPreview = ({ settings = {} }: GiftAlertPreviewProps) => {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 5;
  const animStyle = settings.animation_style || "bounce";
  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const shadowDepth = (settings.shadow_depth || 30) / 100;
  const imageSize = settings.gift_image_size || 80;
  const noBackground = settings.no_background ?? false;
  const noBorder = settings.no_border ?? false;
  const accentColor = settings.accent_color || "280 100% 65%";
  const glowColor = settings.glow_color || accentColor;
  const textColor = settings.text_color || "0 0% 100%";
  const bgStyle = settings.bg_style || "glass";
  const fontFamily = getFontFamily(settings.font_family || "default");
  const fontSize = Math.min(settings.font_size || 24, 24);
  const fontWeight = settings.font_weight || 800;
  const alertPosition = settings.alert_position || "center";
  const cardBg = noBackground ? {} : getBgStyle(bgStyle, accentColor, glowIntensity);

  // Load Google Font
  useEffect(() => {
    const fontMap: Record<string, string> = {
      "inter": "Inter:wght@400;600;700;800",
      "space-grotesk": "Space+Grotesk:wght@400;600;700",
      "orbitron": "Orbitron:wght@400;600;700;800;900",
      "bebas": "Bebas+Neue",
      "press-start": "Press+Start+2P",
    };
    const fontKey = settings.font_family || "default";
    if (fontKey !== "default" && fontMap[fontKey]) {
      const id = `gf-${fontKey}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontMap[fontKey]}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [settings.font_family]);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentAlert(prev => (prev + 1) % mockAlerts.length);
        setVisible(true);
      }, 600);
    }, duration * 1000);
    return () => clearInterval(cycle);
  }, [duration]);

  const alert = mockAlerts[currentAlert];
  const variants = getEntryVariants(animStyle);
  const isHighValue = alert.value >= 500;

  return (
    <div className={`relative w-full h-full flex ${getPositionClass(alertPosition)}`}>
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentAlert}
            className="relative flex flex-col items-center"
            style={{ fontFamily, ...cardBg, padding: noBackground ? 0 : "20px 32px" }}
            initial={variants.initial}
            animate={variants.animate}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer glow ring */}
            {!noBorder && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: imageSize * 1.5, height: imageSize * 1.5,
                  top: "50%", left: "50%", transform: "translate(-50%, -65%)",
                  border: `1.5px solid hsl(${glowColor} / ${0.3 * glowIntensity})`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            )}

            {/* Ambient glow */}
            {!noBackground && (
              <motion.div
                className="absolute blur-2xl"
                style={{
                  width: imageSize * 1.3, height: imageSize * 1.3,
                  top: "50%", left: "50%", transform: "translate(-50%, -65%)",
                  background: `radial-gradient(circle, hsl(${glowColor} / ${0.2 * glowIntensity}), transparent 70%)`,
                  borderRadius: "50%",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Shadow under card */}
            {!noBackground && shadowDepth > 0 && (
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full blur-xl"
                style={{
                  width: "70%", height: "16px",
                  background: `hsl(${accentColor} / ${0.15 * shadowDepth})`,
                }}
              />
            )}

            {/* Gift icon */}
            <motion.div
              className="rounded-full flex items-center justify-center mb-3 relative z-10"
              style={{
                width: imageSize, height: imageSize,
                background: noBackground ? "transparent" : "rgba(0,0,0,0.5)",
                backdropFilter: noBackground ? "none" : "blur(20px)",
                border: noBorder ? "none" : `2px solid hsl(${glowColor} / ${0.25 * glowIntensity})`,
                boxShadow: noBorder ? "none" : `0 0 ${30 * glowIntensity}px hsl(${glowColor} / ${0.2 * glowIntensity}), 0 ${12 * shadowDepth}px ${24 * shadowDepth}px rgba(0,0,0,0.5)`,
              }}
              animate={isHighValue ? { scale: [1, 1.06, 1] } : undefined}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span style={{ fontSize: imageSize * 0.45 }}>{alert.emoji}</span>
            </motion.div>

            {/* Text */}
            <div className="text-center relative z-10">
              <motion.p
                className="truncate max-w-[260px]"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight,
                  color: `hsl(${textColor})`,
                  textShadow: `0 2px 8px rgba(0,0,0,0.8), 0 0 ${14 * glowIntensity}px hsl(${glowColor} / ${0.3 * glowIntensity})`,
                  letterSpacing: "-0.02em",
                }}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {alert.user}
              </motion.p>

              <motion.p
                className="mt-0.5 font-semibold"
                style={{
                  fontSize: `${Math.max(fontSize * 0.55, 10)}px`,
                  color: `hsl(${textColor} / 0.55)`,
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                sent a gift!
              </motion.p>

              <motion.p
                className="mt-1 font-bold"
                style={{
                  fontSize: `${Math.max(fontSize * 0.75, 13)}px`,
                  color: `hsl(${accentColor})`,
                  textShadow: `0 0 ${12 * glowIntensity}px hsl(${glowColor} / ${0.5 * glowIntensity})`,
                }}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {alert.gift}
              </motion.p>

              {/* Combo counter */}
              {alert.count > 1 && (
                <motion.p
                  className="mt-1.5 tracking-tight"
                  style={{
                    fontSize: `${Math.max(fontSize * 1.4, 24)}px`,
                    fontWeight: 900,
                    color: "hsl(45 100% 60%)",
                    textShadow: "0 0 14px hsl(45 100% 55% / 0.6), 0 0 28px hsl(45 100% 55% / 0.3)",
                  }}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  ×{alert.count}
                </motion.p>
              )}

              {alert.value > 0 && (
                <motion.p
                  className="mt-1 font-medium"
                  style={{
                    fontSize: `${Math.max(fontSize * 0.45, 9)}px`,
                    color: `hsl(${textColor} / 0.45)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  🪙 {alert.value}
                </motion.p>
              )}
            </div>

            {/* Sparkle particles for high-value */}
            {isHighValue && [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ background: `hsl(${glowColor})`, top: "35%", left: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 50,
                  y: Math.sin((i * 60) * Math.PI / 180) * 50,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.04, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftAlertPreview;
