import { motion } from "framer-motion";

const events = [
  { icon: "❤️", text: "StreamFan42 liked" },
  { icon: "👤", text: "NightOwl followed" },
  { icon: "🎁", text: "GiftKing sent Rose" },
  { icon: "🔄", text: "CoolViewer shared" },
  { icon: "❤️", text: "StarGazer liked" },
  { icon: "👤", text: "MusicLover followed" },
  { icon: "🎁", text: "TikTokPro sent Lion" },
  { icon: "❤️", text: "VibeCheck liked" },
];

const TickerPreview = () => {
  const text = events.map((e) => `${e.icon} ${e.text}`).join("   •   ");
  const doubled = `${text}   •   ${text}`;

  return (
    <div className="relative w-full h-full flex items-end pb-4 overflow-hidden">
      <div className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.55)] backdrop-blur-lg border border-white/[0.06]">
        <div className="overflow-hidden">
          <motion.div
            className="whitespace-nowrap text-[11px] text-white/70 font-medium"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {doubled}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TickerPreview;
