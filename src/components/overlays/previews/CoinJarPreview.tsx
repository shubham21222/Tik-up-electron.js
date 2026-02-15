import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const GIFT_EMOJIS = ["🌹", "💎", "🦁", "🐉", "⭐", "🎁", "💖", "🔥", "🌟", "🦋"];

interface JarGift {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const CoinJarPreview = () => {
  const [gifts, setGifts] = useState<JarGift[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastSender, setLastSender] = useState<{ name: string; coins: number } | null>(null);
  const nextId = useRef(0);

  // Simulate gifts dropping in
  useEffect(() => {
    const addGift = () => {
      const coins = [1, 5, 10, 50, 100][Math.floor(Math.random() * 5)];
      const names = ["Luna", "DarkKnight", "Sparkle", "TikTokFan", "GiftKing"];
      const emoji = GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)];
      const id = nextId.current++;

      // Fill level: bottom up within jar area (y: 85% down to 30%)
      const fillLevel = Math.min(gifts.length / 30, 1);
      const minY = 85 - fillLevel * 55;
      const y = minY + Math.random() * (85 - minY) * 0.3;

      setGifts(prev => {
        const next = [...prev, {
          id,
          emoji,
          x: 25 + Math.random() * 50,
          y,
          size: 12 + Math.random() * 10,
          rotation: Math.random() * 40 - 20,
        }];
        return next.slice(-40); // cap at 40
      });

      setTotalCoins(prev => prev + coins);
      setLastSender({ name: names[Math.floor(Math.random() * names.length)], coins });
    };

    addGift();
    const interval = setInterval(addGift, 2200);
    return () => clearInterval(interval);
  }, [gifts.length]);

  // Clear last sender after 3s
  useEffect(() => {
    if (!lastSender) return;
    const t = setTimeout(() => setLastSender(null), 3000);
    return () => clearTimeout(t);
  }, [lastSender]);

  const fillPercent = Math.min((gifts.length / 30) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{ background: "transparent" }}>

      {/* Ambient glow behind jar */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(280 100% 65%), transparent 70%)" }} />
      </div>

      {/* Jar container */}
      <div className="relative w-[140px] h-[180px]">
        {/* Jar body - glass effect */}
        <div className="absolute inset-x-2 top-[22px] bottom-0 rounded-b-[28px] rounded-t-[4px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.03), 0 0 30px rgba(128,0,255,0.08)",
          }}>

          {/* Fill level liquid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${fillPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, hsl(280 100% 65% / 0.15) 0%, hsl(280 100% 50% / 0.25) 100%)`,
              borderTop: "1px solid hsl(280 100% 65% / 0.2)",
            }}
          >
            {/* Liquid shimmer */}
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(90deg, transparent, hsl(280 100% 70% / 0.1), transparent)",
              }}
            />
          </motion.div>

          {/* Gifts inside jar */}
          <AnimatePresence>
            {gifts.map(gift => (
              <motion.span
                key={gift.id}
                initial={{ y: -40, opacity: 0, scale: 0.3 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotate: gift.rotation }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${gift.x}%`,
                  top: `${gift.y}%`,
                  fontSize: gift.size,
                  transform: `translate(-50%, -50%)`,
                  filter: "drop-shadow(0 0 4px rgba(128,0,255,0.3))",
                }}
              >
                {gift.emoji}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Glass reflection */}
          <div className="absolute top-0 left-1 w-[30%] h-full opacity-[0.08] rounded-bl-[28px]"
            style={{ background: "linear-gradient(135deg, white 0%, transparent 60%)" }} />
        </div>

        {/* Jar lid */}
        <div className="absolute top-0 left-0 right-0 h-[26px]">
          <div className="absolute inset-x-[-4px] top-[8px] h-[18px] rounded-t-[6px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderBottom: "none",
            }} />
          <div className="absolute inset-x-[-8px] top-[4px] h-[12px] rounded-[4px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
              border: "1px solid rgba(255,255,255,0.12)",
            }} />
          {/* Lid knob */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[2px] w-[20px] h-[8px] rounded-t-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
              border: "1px solid rgba(255,255,255,0.15)",
              borderBottom: "none",
            }} />
        </div>
      </div>

      {/* Coin total */}
      <motion.div
        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        animate={{ scale: lastSender ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-sm">🪙</span>
        <motion.span
          className="text-sm font-bold font-heading"
          style={{ color: "hsl(45 100% 65%)" }}
          key={totalCoins}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {totalCoins.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Last sender popup */}
      <AnimatePresence>
        {lastSender && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(128,0,255,0.12)",
              border: "1px solid rgba(128,0,255,0.2)",
            }}
          >
            <span className="text-[10px] text-white/60">{lastSender.name}</span>
            <span className="text-[10px] font-bold" style={{ color: "hsl(45 100% 65%)" }}>+{lastSender.coins}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinJarPreview;
