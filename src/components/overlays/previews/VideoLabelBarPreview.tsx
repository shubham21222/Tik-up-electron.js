import { motion } from "framer-motion";

interface Props {
  settings?: Record<string, any>;
}

const VideoLabelBarPreview = ({ settings }: Props) => {
  const color = settings?.label_color || "280 100% 65%";

  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
        style={{ filter: `drop-shadow(0 0 10px hsl(${color} / 0.35))` }}
      >
        <video
          src="/overlays/label-bar.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-56 h-auto object-contain"
          style={{ mixBlendMode: "screen" }}
        />
      </motion.div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at bottom center, hsl(${color} / 0.05), transparent 70%)` }}
      />
    </div>
  );
};

export default VideoLabelBarPreview;
