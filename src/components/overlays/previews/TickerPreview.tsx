import { motion } from "framer-motion";

const events = [
  { icon: "❤️", text: "Tikup_User liked" },
  { icon: "👤", text: "Tikup_User followed" },
  { icon: "🎁", text: "Tikup_User sent Rose" },
  { icon: "🔄", text: "Tikup_User shared" },
  { icon: "❤️", text: "Tikup_User liked" },
  { icon: "👤", text: "Tikup_User followed" },
  { icon: "🎁", text: "Tikup_User sent Lion" },
  { icon: "❤️", text: "Tikup_User liked" },
];

const TickerPreview = () => {
  const text = events.map((e) => `${e.icon} ${e.text}`).join("   •   ");
  const doubled = `${text}   •   ${text}`;

  return (
    <div className="relative w-full h-full flex items-end pb-4 overflow-hidden">
      <div className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.55)] backdrop-blur-lg border border-white/[0.06]">
        <div className="overflow-hidden">
          <motion.div
            className="whitespace-nowrap text-xs text-white/70 font-medium"
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
