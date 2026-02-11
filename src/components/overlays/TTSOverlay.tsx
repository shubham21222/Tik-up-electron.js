import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentMsg((prev) => (prev + 1) % messages.length);
        setVisible(true);
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 2800);
      }, 600);
    }, 5000);
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 2800);
    return () => clearInterval(cycle);
  }, []);

  const msg = messages[currentMsg];

  return (
    <div className="relative w-full h-full flex items-end justify-center pb-8">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentMsg}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-[hsl(160,100%,45%/0.3)] to-[hsl(160,100%,45%/0.05)] blur-[1px]" />

            <div className="relative flex items-start gap-3.5 px-5 py-4 rounded-[20px] bg-[rgba(0,0,0,0.7)] backdrop-blur-xl border border-[hsl(160,100%,45%/0.15)] min-w-[320px] max-w-[420px]">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(160,100%,45%)] to-[hsl(180,100%,38%)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-black">
                {msg.user[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white tracking-wide">{msg.user}</p>
                <p className="text-[12px] text-white/70 mt-0.5 leading-relaxed">{msg.text}</p>

                {/* Soundwave */}
                <div className="flex items-end gap-[3px] mt-2.5 h-3">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-[2.5px] rounded-full bg-[hsl(160,100%,45%)]"
                      animate={speaking ? {
                        height: [3, 8 + Math.random() * 6, 3, 10 + Math.random() * 4, 3],
                      } : { height: 3 }}
                      transition={speaking ? {
                        duration: 0.4 + Math.random() * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.04,
                      } : { duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TTSOverlay;
