import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const mockFollows = [
  { user: "StreamLover99", avatar: "🧑‍🎤" },
  { user: "GamerX_Pro", avatar: "🎮" },
  { user: "NightVibes", avatar: "🌙" },
  { user: "CoolCreator42", avatar: "🎨" },
  { user: "MusicFanatic", avatar: "🎵" },
];

interface FollowAlertPreviewProps {
  settings: Record<string, any>;
}

const FollowAlertPreview = ({ settings }: FollowAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [streak, setStreak] = useState(1);
  const duration = settings.duration || 5;
  const style = settings.animation_style || "spotlight";
  const iconSize = settings.icon_size || 56;
  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const cardStyle = settings.card_style || "glass";
  const accentColor = settings.accent_color || "160 100% 45%";
  const showAvatar = settings.show_avatar ?? true;

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % mockFollows.length);
        setStreak(prev => prev < 4 ? prev + 1 : 1);
        setVisible(true);
      }, 700);
    }, duration * 1000);
    return () => clearInterval(cycle);
  }, [duration]);

  const follow = mockFollows[currentIdx];
  const isStreak = settings.streak_detection && streak >= (settings.streak_threshold || 3);

  const getAnimation = () => {
    switch (style) {
      case "badge_drop": return { initial: { y: -80, opacity: 0, rotate: -10 }, animate: { y: 0, opacity: 1, rotate: 0 } };
      case "neon_slide": return { initial: { x: -120, opacity: 0 }, animate: { x: 0, opacity: 1 } };
      case "hologram": return { initial: { scaleY: 0, opacity: 0 }, animate: { scaleY: 1, opacity: 1 } };
      case "portal": return { initial: { scale: 0, rotate: 180, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } };
      case "glitch_in": return { initial: { x: [-4, 4, -2, 0], opacity: 0, skewX: 10 }, animate: { x: 0, opacity: 1, skewX: 0 } };
      default: return { initial: { scale: 0.6, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 } };
    }
  };

  const getCardBg = () => {
    switch (cardStyle) {
      case "solid": return { background: "rgba(20,20,30,0.95)", border: `1px solid hsl(${accentColor} / 0.15)` };
      case "neon_border": return { background: "rgba(0,0,0,0.7)", border: `2px solid hsl(${accentColor} / 0.5)`, boxShadow: `0 0 20px hsl(${accentColor} / 0.15), inset 0 0 20px hsl(${accentColor} / 0.05)` };
      case "gradient": return { background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), rgba(0,0,0,0.8))`, border: "1px solid rgba(255,255,255,0.06)" };
      case "minimal": return { background: "transparent", border: "none" };
      default: return { background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" };
    }
  };

  const anim = getAnimation();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentIdx}
            className="relative"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Spotlight effect */}
            {style === "spotlight" && (
              <motion.div
                className="absolute -inset-8 rounded-full"
                style={{ background: `radial-gradient(circle, hsl(${accentColor} / ${0.1 * glowIntensity}), transparent 70%)` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Card */}
            <div className="relative rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[260px]" style={getCardBg()}>
              {/* Streak indicator */}
              {isStreak && (
                <motion.div
                  className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: `hsl(${accentColor})`, color: "black" }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  🔥 x{streak}
                </motion.div>
              )}

              {/* Avatar */}
              {showAvatar && (
                <motion.div
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: iconSize, height: iconSize,
                    background: `linear-gradient(135deg, hsl(${accentColor} / 0.2), hsl(${accentColor} / 0.05))`,
                    border: `2px solid hsl(${accentColor} / 0.3)`,
                    boxShadow: `0 0 ${15 * glowIntensity}px hsl(${accentColor} / 0.15)`,
                    borderRadius: settings.avatar_style === "hexagon" ? "30% 70% 70% 30% / 30% 30% 70% 70%" : settings.avatar_style === "rounded_square" ? "20%" : "50%",
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 ${10 * glowIntensity}px hsl(${accentColor} / 0.1)`,
                      `0 0 ${25 * glowIntensity}px hsl(${accentColor} / 0.25)`,
                      `0 0 ${10 * glowIntensity}px hsl(${accentColor} / 0.1)`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span style={{ fontSize: iconSize * 0.45 }}>{follow.avatar}</span>
                </motion.div>
              )}

              {/* Text */}
              <div>
                <motion.p
                  className={`text-sm font-bold text-white ${settings.username_font === "mono" ? "font-mono" : settings.username_font === "heading" ? "font-heading" : ""}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {follow.user}
                </motion.p>
                <motion.p
                  className="text-[11px] mt-0.5"
                  style={{ color: `hsl(${accentColor})` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  {settings.welcome_text || "just followed!"}
                </motion.p>
              </div>

              {/* Follow icon */}
              <motion.div
                className="ml-auto"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2, delay: 0.3 }}
              >
                <span className="text-xl">👋</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowAlertPreview;
