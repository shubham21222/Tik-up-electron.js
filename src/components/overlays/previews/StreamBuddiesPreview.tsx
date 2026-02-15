import { motion } from "framer-motion";

const TIERS = [
  { src: "/buddies/legendary.png", size: 52, x: "18%", glow: "0 0 18px rgba(255,200,50,0.6)", crown: true, name: "TopGifter" },
  { src: "/buddies/epic.png", size: 44, x: "45%", glow: "0 0 12px rgba(160,80,255,0.5)", crown: false, name: "EpicFan" },
  { src: "/buddies/rare.png", size: 38, x: "70%", glow: "0 0 8px rgba(80,160,255,0.4)", crown: false, name: "RareViewer" },
  { src: "/buddies/common.png", size: 32, x: "88%", glow: "none", crown: false, name: "NewFan" },
];

const StreamBuddiesPreview = () => (
  <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: "rgba(10,14,20,0.6)" }}>
    {/* Ground line */}
    <div className="absolute bottom-[18%] left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }} />

    {TIERS.map((t, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ left: t.x, bottom: "20%", transform: "translateX(-50%)", filter: `drop-shadow(${t.glow})`, zIndex: 40 - i * 10 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.6 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
      >
        {t.crown && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px]"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            👑
          </motion.div>
        )}

        {/* Chat bubble for first */}
        {i === 0 && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] text-white px-1.5 py-0.5 rounded"
            style={{ bottom: t.size + 6, background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.1)" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -2] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            Let's gooo 🔥
          </motion.div>
        )}

        <img src={t.src} alt={t.name} style={{ width: t.size, height: t.size, objectFit: "contain", imageRendering: "auto" }} />

        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[7px] font-bold whitespace-nowrap" style={{ color: i === 0 ? "rgba(255,200,50,0.9)" : "rgba(255,255,255,0.5)", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
          {t.name}
        </div>
      </motion.div>
    ))}
  </div>
);

export default StreamBuddiesPreview;
