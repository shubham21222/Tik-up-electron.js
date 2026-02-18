import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const messages = [
  { user: "StreamFan42", text: "This stream is amazing! 🔥🔥", avatar: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/demo1.jpeg" },
  { user: "GiftKing", text: "You're the best streamer ever", avatar: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/demo2.jpeg" },
  { user: "NightOwl", text: "Can you play that song again?", avatar: "" },
  { user: "CoolViewer", text: "Just sent a gift! Enjoy 🎁", avatar: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/demo3.jpeg" },
  { user: "TikTokPro", text: "Love from Brazil 🇧🇷", avatar: "" },
];

/** Animated volume icon that pulses wave arcs when "speaking" */
const SpeakingIcon = ({ speaking }: { speaking: boolean }) => (
  <div className="flex-shrink-0 relative w-5 h-5">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="rgba(255,255,255,0.5)" />
      <motion.path
        d="M15.54 8.46a5 5 0 0 1 0 7.07"
        stroke="rgba(255,255,255,0.4)"
        animate={speaking ? { opacity: [0.2, 0.8, 0.2], pathLength: [0.3, 1, 0.3] } : { opacity: 0.15, pathLength: 0.3 }}
        transition={speaking ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
      />
      <motion.path
        d="M19.07 4.93a10 10 0 0 1 0 14.14"
        stroke="rgba(255,255,255,0.3)"
        animate={speaking ? { opacity: [0.1, 0.6, 0.1], pathLength: [0.2, 1, 0.2] } : { opacity: 0.1, pathLength: 0.2 }}
        transition={speaking ? { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.15 } : { duration: 0.4 }}
      />
    </svg>
  </div>
);

const TTSOverlay = () => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [visible, setVisible] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setSpeaking(false);
      setTimeout(() => {
        setCurrentMsg((prev) => (prev + 1) % messages.length);
        setVisible(true);
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 3200);
      }, 600);
    }, 5000);
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 3200);
    return () => clearInterval(cycle);
  }, []);

  const msg = messages[currentMsg];
  const hasAvatar = !!msg.avatar;

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
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.03] blur-[1px]" />

            <div className="relative flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] min-w-[300px] max-w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {/* Avatar — TikTok profile pic or fallback initial */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(160,100%,45%)] to-[hsl(180,100%,38%)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-black shadow-[0_0_12px_rgba(37,244,238,0.25)] overflow-hidden">
                {hasAvatar ? (
                  <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  msg.user[0]
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/90 tracking-wide">{msg.user}</p>
                <p className="text-[12px] text-white/50 mt-0.5 leading-relaxed truncate">{msg.text}</p>
              </div>

              <SpeakingIcon speaking={speaking} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TTSOverlay;
