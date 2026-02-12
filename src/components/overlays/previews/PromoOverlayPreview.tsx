import { motion } from "framer-motion";
import tikupLogo from "@/assets/tikup_logo.png";

interface PromoOverlayPreviewProps {
  settings?: Record<string, any>;
}

const PromoOverlayPreview = ({ settings = {} }: PromoOverlayPreviewProps) => {
  const accentColor = settings.accent_color || "160 100% 45%";
  const tagline = settings.tagline || "Follow for more!";
  const handle = settings.handle || "@tikup";
  const glowIntensity = (settings.glow_intensity || 60) / 100;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3">
      {/* Banner card */}
      <motion.div
        className="relative w-full max-w-[380px] rounded-2xl overflow-hidden flex flex-col items-center py-6 px-8 gap-3"
        style={{
          background: "linear-gradient(145deg, rgba(12,16,22,0.95), rgba(8,12,18,0.98))",
          border: `1.5px solid hsl(${accentColor} / 0.2)`,
          boxShadow: `0 0 ${30 * glowIntensity}px hsl(${accentColor} / 0.08), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Subtle accent line top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, hsl(${accentColor} / 0.4), transparent)` }} />

        {/* Logo - big */}
        <motion.div
          className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            width: 72, height: 72,
            background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), hsl(${accentColor} / 0.04))`,
            border: `2.5px solid hsl(${accentColor} / 0.35)`,
            boxShadow: `0 0 ${20 * glowIntensity}px hsl(${accentColor} / 0.15)`,
          }}
          animate={{
            boxShadow: [
              `0 0 ${15 * glowIntensity}px hsl(${accentColor} / 0.1)`,
              `0 0 ${30 * glowIntensity}px hsl(${accentColor} / 0.25)`,
              `0 0 ${15 * glowIntensity}px hsl(${accentColor} / 0.1)`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={tikupLogo} alt="TikUp" className="w-[62%] h-[62%] object-contain" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-base font-bold text-white text-center tracking-tight"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tagline}
        </motion.p>

        {/* Handle */}
        <motion.p
          className="text-sm font-semibold text-center tracking-wide"
          style={{ color: `hsl(${accentColor})` }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {handle}
        </motion.p>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, hsl(${accentColor} / 0.3), transparent)` }} />
      </motion.div>
    </div>
  );
};

export default PromoOverlayPreview;
