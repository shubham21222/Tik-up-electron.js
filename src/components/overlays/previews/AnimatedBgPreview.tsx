import { motion } from "framer-motion";

const AnimatedBgPreview = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Moving gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, hsl(280 100% 15%), hsl(200 100% 10%), hsl(160 100% 12%))",
            "linear-gradient(135deg, hsl(200 100% 10%), hsl(160 100% 12%), hsl(350 90% 15%))",
            "linear-gradient(135deg, hsl(160 100% 12%), hsl(350 90% 15%), hsl(280 100% 15%))",
            "linear-gradient(135deg, hsl(280 100% 15%), hsl(200 100% 10%), hsl(160 100% 12%))",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${(i / 12) * 100}%`,
            top: `${30 + Math.sin(i) * 30}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
    </div>
  );
};

export default AnimatedBgPreview;
