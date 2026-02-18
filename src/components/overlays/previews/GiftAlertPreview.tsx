import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const mockAlerts = [
  { user: "Tikup_User", gift: "Rose", emoji: "🌹", value: 1, count: 5, giftImageUrl: "/gifts/rose.png" },
  { user: "NightOwl_Live", gift: "Flame Heart", emoji: "❤️‍🔥", value: 500, count: 3, giftImageUrl: "/gifts/flame_heart.png" },
  { user: "StreamFan99", gift: "Fluffy Heart", emoji: "☁️", value: 1000, count: 1, giftImageUrl: "/gifts/fluffy_heart.png" },
  { user: "GiftKing_Pro", gift: "Love You", emoji: "💖", value: 2000, count: 7, giftImageUrl: "/gifts/love_you_so_much.png" },
];

/* ── Animation variants (identical to renderer) ── */
const getEntryVariants = (style: string) => {
  switch (style) {
    case "slide": return { initial: { x: -200, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "explosion": return { initial: { scale: 3, opacity: 0, rotate: 15 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "flip_3d": return { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 } };
    case "glitch": return { initial: { x: [-8, 8, -4, 0], opacity: 0, skewX: 5 }, animate: { x: 0, opacity: 1, skewX: 0 } };
    case "flames_rising": return { initial: { scale: 0.6, opacity: 0, y: 40 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "icy_blast": return { initial: { scale: 1.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "christmas_spark": return { initial: { scale: 0, opacity: 0, rotate: -30 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "snowfall": return { initial: { scale: 0.5, opacity: 0, y: -30 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "cyber_pulse": return { initial: { scaleX: 2, scaleY: 0.3, opacity: 0 }, animate: { scaleX: 1, scaleY: 1, opacity: 1 } };
    case "explosion_burst": return { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    default: return { initial: { scale: 0.3, opacity: 0, y: 50 }, animate: { scale: 1, opacity: 1, y: 0 } };
  }
};

/* ── Font mapping (identical to renderer) ── */
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

/* ── Background style builder (identical to renderer) ── */
const getBgStyle = (bgStyle: string, accentColor: string, glowIntensity: number) => {
  switch (bgStyle) {
    case "glass": return {
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(24px) saturate(1.5)",
      border: `1px solid hsl(${accentColor} / ${0.15 * glowIntensity})`,
      borderRadius: "24px",
    };
    case "neon": return {
      background: "rgba(0,0,0,0.7)",
      border: `2px solid hsl(${accentColor} / ${0.6 * glowIntensity})`,
      borderRadius: "20px",
      boxShadow: `0 0 ${30 * glowIntensity}px hsl(${accentColor} / ${0.25 * glowIntensity}), inset 0 0 ${20 * glowIntensity}px hsl(${accentColor} / ${0.05 * glowIntensity})`,
    };
    case "solid": return {
      background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), rgba(0,0,0,0.8))`,
      border: `1px solid hsl(${accentColor} / ${0.1 * glowIntensity})`,
      borderRadius: "20px",
    };
    default: return {};
  }
};

/* ── Position mapping (identical to renderer) ── */
const getPositionClass = (pos: string) => {
  switch (pos) {
    case "top": return "items-start justify-center pt-8";
    case "bottom": return "items-end justify-center pb-8";
    case "top-left": return "items-start justify-start pt-8 pl-8";
    case "top-right": return "items-start justify-end pt-8 pr-8";
    case "bottom-left": return "items-end justify-start pb-8 pl-8";
    case "bottom-right": return "items-end justify-end pb-8 pr-8";
    default: return "items-center justify-center";
  }
};

interface GiftAlertPreviewProps {
  settings?: Record<string, any>;
  testTrigger?: number;
}

const GiftAlertPreview = ({ settings = {}, testTrigger = 0 }: GiftAlertPreviewProps) => {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [visible, setVisible] = useState(true);
  const duration = settings.duration || 5;
  const animStyle = settings.animation_style || "bounce";
  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const shadowDepth = (settings.shadow_depth || 30) / 100;
  const noBackground = true;
  const noBorder = true;
  const borderGlow = settings.border_glow ?? true;
  const accentColor = settings.accent_color || "280 100% 65%";
  const glowColor = settings.glow_color || accentColor;
  const textColor = settings.text_color || "0 0% 100%";
  const bgStyle = settings.bg_style || "glass";
  const fontFamily = getFontFamily(settings.font_family || "default");
  const fontSize = settings.font_size || 24;
  const fontWeight = settings.font_weight || 800;
  const alertPosition = settings.alert_position || "center";
  
  // Scale the image size exactly like the renderer (3x multiplier on base, then adjusted for preview)
  const imageSize = (settings.gift_image_size || 64) * 2.5; 
  const cardBg = noBackground ? {} : getBgStyle(bgStyle, accentColor, glowIntensity);

  const triggerNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentAlert(prev => (prev + 1) % mockAlerts.length);
      setVisible(true);
    }, 400);
  }, []);

  // Handle external test trigger
  useEffect(() => {
    if (testTrigger > 0) {
      triggerNext();
    }
  }, [testTrigger, triggerNext]);

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
      triggerNext();
    }, duration * 1000 + 1000);
    return () => clearInterval(cycle);
  }, [duration, triggerNext]);

  const alert = mockAlerts[currentAlert];
  const variants = getEntryVariants(animStyle);
  const isHighValue = alert.value >= 500;

  return (
    <div className={`relative w-full h-full flex ${getPositionClass(alertPosition)}`}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentAlert}-${testTrigger}`}
            className="relative flex flex-col items-center"
            style={{ 
              fontFamily, 
              ...cardBg, 
              padding: noBackground ? 0 : "36px 52px",
              minWidth: noBackground ? "auto" : "320px"
            }}
            initial={variants.initial}
            animate={variants.animate}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Border glow pulse */}
            {borderGlow && !noBorder && !noBackground && (
              <motion.div
                className="absolute inset-0 rounded-[24px] pointer-events-none"
                style={{
                  border: `1px solid hsl(${glowColor} / ${0.4 * glowIntensity})`,
                  boxShadow: `0 0 ${20 * glowIntensity}px hsl(${glowColor} / ${0.15 * glowIntensity})`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 ${15 * glowIntensity}px hsl(${glowColor} / ${0.1 * glowIntensity})`,
                    `0 0 ${35 * glowIntensity}px hsl(${glowColor} / ${0.3 * glowIntensity})`,
                    `0 0 ${15 * glowIntensity}px hsl(${glowColor} / ${0.1 * glowIntensity})`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {/* Outer glow ring */}
            {!noBorder && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: imageSize * 1.6, height: imageSize * 1.6,
                  top: "50%", left: "50%", transform: "translate(-50%, -70%)",
                  border: `2px solid hsl(${glowColor} / ${0.3 * glowIntensity})`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            )}

            {/* Ambient glow behind gift */}
            {!noBackground && (
              <motion.div
                className="absolute blur-3xl"
                style={{
                  width: imageSize * 1.5, height: imageSize * 1.5,
                  top: "50%", left: "50%", transform: "translate(-50%, -70%)",
                  background: `radial-gradient(circle, hsl(${glowColor} / ${0.25 * glowIntensity}), transparent 70%)`,
                  borderRadius: "50%",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Shadow under card */}
            {!noBackground && shadowDepth > 0 && (
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full blur-2xl"
                style={{
                  width: "80%", height: "28px",
                  background: `hsl(${accentColor} / ${0.2 * shadowDepth})`,
                }}
              />
            )}

            {/* Gift icon circle */}
            <motion.div
              className="rounded-full flex items-center justify-center mb-6 relative z-10"
              style={{
                width: imageSize, height: imageSize,
                background: noBackground ? "transparent" : "rgba(0,0,0,0.6)",
                backdropFilter: noBackground ? "none" : "blur(20px)",
                border: noBorder ? "none" : `2px solid hsl(${glowColor} / ${0.3 * glowIntensity})`,
                boxShadow: noBorder ? "none" : `0 0 ${50 * glowIntensity}px hsl(${glowColor} / ${0.25 * glowIntensity}), 0 ${25 * shadowDepth}px ${50 * shadowDepth}px rgba(0,0,0,0.6)`,
              }}
              animate={isHighValue ? { scale: [1, 1.1, 1] } : undefined}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {alert.giftImageUrl ? (
                <img src={alert.giftImageUrl} alt={alert.gift} className="w-[75%] h-[75%] object-contain drop-shadow-lg" />
              ) : (
                <span style={{ fontSize: imageSize * 0.48 }}>{alert.emoji}</span>
              )}
            </motion.div>

            {/* Text content — exact match to renderer but scaled for preview visibility */}
            <div className="text-center relative z-10">
              <motion.p
                className="truncate max-w-[450px]"
                style={{
                  fontSize: `${fontSize * 1.1}px`, // Slightly larger for dashboard preview
                  fontWeight,
                  color: `hsl(${textColor})`,
                  textShadow: `0 3px 15px rgba(0,0,0,0.9), 0 0 ${25 * glowIntensity}px hsl(${glowColor} / ${0.4 * glowIntensity})`,
                  letterSpacing: "-0.02em",
                }}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {alert.user}
              </motion.p>

              <motion.p
                className="mt-1.5 font-semibold"
                style={{
                  fontSize: `${Math.max(fontSize * 0.6, 14)}px`,
                  color: `hsl(${textColor} / 0.6)`,
                  textShadow: "0 2px 5px rgba(0,0,0,0.7)",
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                sent a gift!
              </motion.p>

              <motion.p
                className="mt-2.5 font-bold"
                style={{
                  fontSize: `${Math.max(fontSize * 0.9, 20)}px`,
                  color: `hsl(${accentColor})`,
                  textShadow: `0 0 ${20 * glowIntensity}px hsl(${glowColor} / ${0.6 * glowIntensity})`,
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {alert.gift}
              </motion.p>

              {/* Combo counter */}
              {alert.count > 1 && (
                <motion.p
                  className="mt-4 tracking-tighter"
                  style={{
                    fontSize: `${Math.max(fontSize * 1.8, 42)}px`,
                    fontWeight: 950,
                    color: "hsl(45 100% 60%)",
                    textShadow: "0 0 25px hsl(45 100% 55% / 0.7), 0 0 50px hsl(45 100% 55% / 0.4)",
                  }}
                  initial={{ scale: 3, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                >
                  ×{alert.count}
                </motion.p>
              )}

              {/* Coin value */}
              {alert.value > 0 && (
                <motion.p
                  className="mt-3 font-medium"
                  style={{
                    fontSize: `${Math.max(fontSize * 0.55, 13)}px`,
                    color: `hsl(${textColor} / 0.5)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  🪙 {alert.value}
                </motion.p>
              )}
            </div>

            {/* Sparkle particles for high-value gifts */}
            {isHighValue && [...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: `hsl(${glowColor})`, top: "40%", left: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * 30) * Math.PI / 180) * (100 + Math.random() * 50),
                  y: Math.sin((i * 30) * Math.PI / 180) * (100 + Math.random() * 50),
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1.2 + Math.random() * 0.6, delay: 0.1 + i * 0.04, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftAlertPreview;