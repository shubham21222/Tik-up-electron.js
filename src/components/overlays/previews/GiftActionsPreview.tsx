import { motion } from "framer-motion";

const DEMO_ITEMS = [
  { img: "/gifts/rose.png", label: "Jump" },
  { img: "/gifts/flame_heart.png", label: "Dance" },
  { img: "/gifts/fluffy_heart.png", label: "Emote" },
  { img: "/gifts/morning_bloom.png", label: "Spin" },
  { img: "/gifts/love_you_so_much.png", label: "Shoutout" },
  { img: "/gifts/wink_wink.png", label: "Surprise" },
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
          <motion.img
            src={item.img}
            alt={item.label}
            className="w-[42px] h-[42px] object-contain"
            draggable={false}
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
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
