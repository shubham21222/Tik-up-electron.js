import { motion } from "framer-motion";

const DEMO_ITEMS = [
  { emoji: "🏀", label: "Jump" },
  { emoji: "🌹", label: "Dance" },
  { emoji: "💜", label: "Emote" },
  { emoji: "🍩", label: "Spin" },
  { emoji: "⭐", label: "Shoutout" },
  { emoji: "🎁", label: "Surprise" },
];

const GiftActionsPreview = () => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden">
    <motion.div
      className="flex gap-5 items-end"
      animate={{ x: [0, -120, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      {DEMO_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
        >
          <motion.div
            className="text-[36px] leading-none"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            {item.emoji}
          </motion.div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{
              color: "white",
              textShadow: "0 1px 6px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)",
              fontFamily: "var(--font-heading, sans-serif)",
            }}
          >
            {item.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

export default GiftActionsPreview;
