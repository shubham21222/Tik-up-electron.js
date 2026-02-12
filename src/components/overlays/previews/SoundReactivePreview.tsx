import { motion } from "framer-motion";

const barCount = 24;

const SoundReactivePreview = () => {
  return (
    <div className="relative w-full h-full flex items-end justify-center gap-[3px] px-6 pb-6 overflow-hidden">
      {/* Subtle glow bg */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(280,100%,15%/0.3)] to-transparent" />
      {[...Array(barCount)].map((_, i) => {
        const hue = 160 + (i / barCount) * 180;
        return (
          <motion.div
            key={i}
            className="rounded-t-sm"
            style={{
              width: `${100 / barCount - 1}%`,
              background: `hsl(${hue}, 100%, 55%)`,
              boxShadow: `0 0 8px hsl(${hue}, 100%, 55%, 0.3)`,
            }}
            animate={{
              height: [
                8 + Math.random() * 15,
                20 + Math.random() * 60,
                10 + Math.random() * 20,
                30 + Math.random() * 50,
                8 + Math.random() * 15,
              ],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.03,
            }}
          />
        );
      })}
    </div>
  );
};

export default SoundReactivePreview;
