import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const events = [
  { user: "NightOwl", type: "follow" },
  { user: "StreamFan42", type: "like" },
  { user: "CoolViewer", type: "follow" },
  { user: "GamerX", type: "like" },
  { user: "MusicLover", type: "follow" },
  { user: "StarGazer", type: "like" },
];

const LikeFollowOverlay = () => {
  const [notifications, setNotifications] = useState<Array<{ user: string; type: string; id: number }>>([]);
  const idRef = useRef(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const event = events[indexRef.current % events.length];
      indexRef.current += 1;
      idRef.current += 1;
      const id = idRef.current;

      setNotifications((prev) => [...prev.slice(-3), { ...event, id }]);

      // Auto remove after 3s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-start justify-end p-6">
      <div className="flex flex-col gap-2 w-[240px]">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.3 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[rgba(0,0,0,0.6)] backdrop-blur-xl border border-[hsl(160,100%,45%/0.12)]">
                {/* Icon */}
                <div className="relative">
                  {notif.type === "follow" ? (
                    <motion.div
                      className="w-7 h-7 rounded-full bg-[hsl(160,100%,45%/0.15)] flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(160,100%,50%)" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-7 h-7 rounded-full bg-[hsl(340,80%,55%/0.15)] flex items-center justify-center"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-xs">❤️</span>
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{notif.user}</p>
                  <p className="text-[10px] text-white/40">
                    {notif.type === "follow" ? "just followed!" : "liked the stream"}
                  </p>
                </div>

                {/* Float hearts for likes */}
                {notif.type === "like" && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-[8px]"
                        style={{ right: 12 + i * 8, top: -2 }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -20 - i * 8 }}
                        transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                      >
                        ❤️
                      </motion.span>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LikeFollowOverlay;
