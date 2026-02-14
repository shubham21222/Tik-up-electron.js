import { motion } from "framer-motion";

interface Props {
  settings?: Record<string, any>;
}

const VideoCamFramePreview = ({ settings }: Props) => {
  const color = settings?.frame_color || "160 100% 45%";

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
        style={{ filter: `drop-shadow(0 0 12px hsl(${color} / 0.4))` }}
      >
        <video
          src="/overlays/cam-frame.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-44 h-44 object-contain"
          style={{ mixBlendMode: "screen" }}
        />
      </motion.div>
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, hsl(${color} / 0.06), transparent 70%)` }}
      />
    </div>
  );
};

export default VideoCamFramePreview;
