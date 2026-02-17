import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import tikupLogo from "@/assets/tikup_logo.png";

const mockFollows = [
  { user: "Tikup_User", avatar: "🧑‍🎤" },
];

interface FollowAlertPreviewProps {
  settings?: Record<string, any>;
  testTrigger?: number;
}

const FollowAlertPreview = ({ settings = {}, testTrigger = 0 }: FollowAlertPreviewProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [streak, setStreak] = useState(1);
  const duration = settings.duration || 5;
  const style = settings.animation_style || "spotlight";
  // Increased base icon size for better preview visibility
  const iconSize = (settings.icon_size || 68) * 1.2;
  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const cardStyle = settings.card_style || "glass";
  const accentColor = settings.accent_color || "160 100% 45%";
  const showAvatar = settings.show_avatar ?? true;

  const triggerNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setStreak(prev => prev < 4 ? prev + 1 : 1);
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

  const follow = mockFollows[currentIdx % mockFollows.length];
  const isStreak = settings.streak_detection && streak >= (settings.streak_threshold || 3);

  const getAnimation = () => {
    switch (style) {
      case "badge_drop": return { initial: { y: -100, opacity: 0, rotate: -15 }, animate: { y: 0, opacity: 1, rotate: 0 } };
      case "neon_slide": return { initial: { x: -150, opacity: 0 }, animate: { x: 0, opacity: 1 } };
      case "hologram": return { initial: { scaleY: 0, opacity: 0, filter: "blur(10px)" }, animate: { scaleY: 1, opacity: 1, filter: "blur(0px)" } };
      case "portal": return { initial: { scale: 0, rotate: 270, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } };
      case "glitch_in": return { initial: { x: [-10, 10, -5, 0], opacity: 0, skewX: 15 }, animate: { x: 0, opacity: 1, skewX: 0 } };
      default: return { initial: { scale: 0.5, opacity: 0, y: 30 }, animate: { scale: 1, opacity: 1, y: 0 } };
    }
  };

  const getCardBg = () => {
    switch (cardStyle) {
      case "solid": return { background: "rgba(15,15,25,0.98)", border: `1px solid hsl(${accentColor} / 0.2)` };
      case "neon_border": return { background: "rgba(0,0,0,0.8)", border: `2px solid hsl(${accentColor} / 0.6)`, boxShadow: `0 0 30px hsl(${accentColor} / 0.2), inset 0 0 20px hsl(${accentColor} / 0.05)` };
      case "gradient": return { background: `linear-gradient(135deg, hsl(${accentColor} / 0.2), rgba(0,0,0,0.85))`, border: "1px solid rgba(255,255,255,0.08)" };
      case "minimal": return { background: "transparent", border: "none" };
      default: return { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" };
    }
  };

  const anim = getAnimation();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentIdx}-${testTrigger}`}
            className="relative"
            initial={anim.initial}
            animate={anim.animate}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.6 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Spotlight effect */}
            {style === "spotlight" && (
              <motion.div
                className="absolute -inset-12 rounded-full"
                style={{ background: `radial-gradient(circle, hsl(${accentColor} / ${0.15 * glowIntensity}), transparent 70%)` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Card */}
            <div className="relative rounded-2xl px-10 py-6 flex items-center gap-6 min-w-[340px]" style={getCardBg()}>
              {/* Streak indicator */}
              {isStreak && (
                <motion.div
                  className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black"
                  style={{ background: `hsl(${accentColor})`, color: "black", boxShadow: `0 0 15px hsl(${accentColor} / 0.5)` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: "spring" }}
                >
                  🔥 x{streak}
                </motion.div>
              )}

              {/* Logo/Avatar */}
              {showAvatar && (
                <motion.div
                  className="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    width: iconSize, height: iconSize,
                    background: `linear-gradient(135deg, hsl(${accentColor} / 0.25), hsl(${accentColor} / 0.05))`,
                    border: `2px solid hsl(${accentColor} / 0.4)`,
                    boxShadow: `0 0 25px hsl(${accentColor} / 0.2)`,
                    borderRadius: settings.avatar_style === "hexagon" ? "30% 70% 70% 30% / 30% 30% 70% 70%" : settings.avatar_style === "rounded_square" ? "24%" : "50%",
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 15px hsl(${accentColor} / 0.15)`,
                      `0 0 35px hsl(${accentColor} / 0.35)`,
                      `0 0 15px hsl(${accentColor} / 0.15)`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img src={tikupLogo} alt="TikUp" className="w-[75%] h-[75%] object-contain drop-shadow-md" />
                </motion.div>
              )}

              {/* Text */}
              <div className="flex-1">
                <motion.p
                  className={`text-xl font-black text-white tracking-tight ${settings.username_font === "mono" ? "font-mono" : settings.username_font === "heading" ? "font-heading" : ""}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {follow.user}
                </motion.p>
                <motion.p
                  className="text-sm font-semibold mt-0.5 opacity-90"
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
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <span className="text-3xl filter drop-shadow-md">👋</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowAlertPreview;