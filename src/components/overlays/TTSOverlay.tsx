import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";

const messages = [
  { user: "StreamFan42", text: "This stream is amazing! 🔥🔥" },
  { user: "GiftKing", text: "You're the best streamer ever" },
  { user: "NightOwl", text: "Can you play that song again?" },
  { user: "CoolViewer", text: "Just sent a gift! Enjoy 🎁" },
  { user: "TikTokPro", text: "Love from Brazil 🇧🇷" },
];

const TTSOverlay = () => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentMsg((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(cycle);
  }, []);

  const msg = messages[currentMsg];

  return (
    <div className="relative w-full h-full flex items-end justify-center pb-8">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentMsg}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Outer glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.03] blur-[1px]" />

            <div className="relative flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] min-w-[300px] max-w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(160,100%,45%)] to-[hsl(180,100%,38%)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-black shadow-[0_0_12px_rgba(37,244,238,0.25)]">
                {msg.user[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/90 tracking-wide">{msg.user}</p>
                <p className="text-[12px] text-white/50 mt-0.5 leading-relaxed truncate">{msg.text}</p>
              </div>

              {/* Subtle speaker icon */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Volume2 size={16} className="text-white/30" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TTSOverlay;
