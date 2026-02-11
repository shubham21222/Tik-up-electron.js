import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const allMessages = [
  { user: "StreamFan42", text: "This is so fire 🔥", type: "chat" },
  { user: "GiftKing", text: "Sent a Rose 🌹", type: "gift" },
  { user: "NightOwl", text: "Love this stream!", type: "chat" },
  { user: "CoolViewer", text: "❤️❤️❤️", type: "like" },
  { user: "TikTokPro", text: "Hello from Japan 🇯🇵", type: "chat" },
  { user: "Supporter99", text: "Just followed!", type: "follow" },
  { user: "VibeCheck", text: "Play some music!", type: "chat" },
  { user: "StarGazer", text: "You're amazing", type: "chat" },
  { user: "MusicLover", text: "🎵🎵🎵", type: "chat" },
  { user: "GamerX", text: "GG!", type: "chat" },
];

const ChatOverlay = () => {
  const [messages, setMessages] = useState(allMessages.slice(0, 4).map((m, i) => ({ ...m, id: i })));
  const idRef = useRef(4);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextMsg = allMessages[idRef.current % allMessages.length];
      idRef.current += 1;
      setMessages((prev) => {
        const updated = [...prev, { ...nextMsg, id: idRef.current }];
        if (updated.length > 6) return updated.slice(-6);
        return updated;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-end justify-start p-6">
      <div className="w-[300px] flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <div className="flex items-start gap-2 px-3.5 py-2 rounded-2xl bg-[rgba(0,0,0,0.55)] backdrop-blur-lg border border-white/[0.06]">
                <span className="text-[11px] font-semibold text-[hsl(160,100%,50%)] flex-shrink-0">
                  {msg.user}
                </span>
                <span className="text-[11px] text-white/80 leading-relaxed">
                  {msg.text}
                </span>
                {msg.type === "like" && (
                  <motion.span
                    animate={{ y: [0, -4, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                    className="text-[10px] ml-auto"
                  >
                    ❤️
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatOverlay;
