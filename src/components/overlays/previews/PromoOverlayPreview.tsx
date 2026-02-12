import { motion } from "framer-motion";
import tikupLogo from "@/assets/tikup_logo.png";

interface PromoOverlayPreviewProps {
  settings?: Record<string, any>;
}

const PromoOverlayPreview = ({ settings = {} }: PromoOverlayPreviewProps) => {
  const accentColor = settings.accent_color || "160 100% 45%";
  const logoSize = settings.logo_size || 80;
  const tagline = settings.tagline || "Follow for more!";
  const showHandle = settings.show_handle ?? true;
  const handle = settings.handle || "@yourtiktok";
  const glowIntensity = (settings.glow_intensity || 60) / 100;
  const style = settings.animation_style || "pulse";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ambient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: logoSize * 2.2,
          height: logoSize * 2.2,
          border: `2px solid hsl(${accentColor} / 0.15)`,
          boxShadow: `0 0 ${40 * glowIntensity}px hsl(${accentColor} / 0.1)`,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Second ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: logoSize * 2.8,
          height: logoSize * 2.8,
          border: `1px solid hsl(${accentColor} / 0.08)`,
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="flex flex-col items-center gap-3">
        {/* Logo */}
        <motion.div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: logoSize,
            height: logoSize,
            background: `linear-gradient(135deg, hsl(${accentColor} / 0.2), hsl(${accentColor} / 0.05))`,
            border: `2.5px solid hsl(${accentColor} / 0.4)`,
            boxShadow: `0 0 ${25 * glowIntensity}px hsl(${accentColor} / 0.2), 0 0 ${60 * glowIntensity}px hsl(${accentColor} / 0.08)`,
          }}
          animate={
            style === "pulse"
              ? { scale: [1, 1.06, 1], boxShadow: [
                  `0 0 ${20 * glowIntensity}px hsl(${accentColor} / 0.15)`,
                  `0 0 ${40 * glowIntensity}px hsl(${accentColor} / 0.3)`,
                  `0 0 ${20 * glowIntensity}px hsl(${accentColor} / 0.15)`,
                ] }
              : style === "rotate"
              ? { rotate: [0, 360] }
              : { y: [0, -6, 0] }
          }
          transition={{ duration: style === "rotate" ? 8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={tikupLogo} alt="TikUp" className="w-[65%] h-[65%] object-contain" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-sm font-bold text-white text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {tagline}
        </motion.p>

        {/* Handle */}
        {showHandle && (
          <motion.p
            className="text-[11px] font-medium text-center"
            style={{ color: `hsl(${accentColor})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {handle}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default PromoOverlayPreview;
