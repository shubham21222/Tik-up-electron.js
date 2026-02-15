import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const GIFT_IMAGES = [
  "/gifts/rose.png",
  "/gifts/flame_heart.png",
  "/gifts/fluffy_heart.png",
  "/gifts/morning_bloom.png",
  "/gifts/wink_wink.png",
  "/gifts/youre_awesome.png",
  "/gifts/blow_a_kiss.png",
  "/gifts/love_you_so_much.png",
];

interface JarGift {
  id: number;
  img: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
}

const CONFETTI_COLORS = [
  "hsl(45 100% 60%)", "hsl(350 80% 60%)", "hsl(160 100% 50%)",
  "hsl(200 80% 60%)", "hsl(280 70% 60%)", "hsl(30 90% 55%)",
];

const CoinJarPreview = () => {
  const [gifts, setGifts] = useState<JarGift[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastSender, setLastSender] = useState<{ name: string; coins: number } | null>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [celebrated, setCelebrated] = useState(false);
  const nextId = useRef(0);
  const TARGET = 500;

  useEffect(() => {
    const addGift = () => {
      const coins = [5, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
      const names = ["Luna", "DarkKnight", "Sparkle", "TikTokFan", "GiftKing"];
      const img = GIFT_IMAGES[Math.floor(Math.random() * GIFT_IMAGES.length)];
      const id = nextId.current++;

      setGifts(prev => {
        const fillLevel = Math.min(prev.length / 25, 1);
        const maxY = 80;
        const minY = maxY - fillLevel * 50;
        const next = [...prev, {
          id, img,
          x: 22 + Math.random() * 56,
          y: minY + Math.random() * (maxY - minY) * 0.4,
          size: 18 + Math.random() * 10,
          rotation: Math.random() * 30 - 15,
        }];
        return next.slice(-35);
      });

      setTotalCoins(prev => prev + coins);
      setLastSender({ name: names[Math.floor(Math.random() * names.length)], coins });
    };

    addGift();
    const interval = setInterval(addGift, 2000);
    return () => clearInterval(interval);
  }, []);

  // Confetti burst when target reached
  useEffect(() => {
    if (totalCoins >= TARGET && !celebrated) {
      setCelebrated(true);
      const pieces: ConfettiPiece[] = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 0.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 4 + Math.random() * 4,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 3000);
    }
  }, [totalCoins, celebrated]);

  // Reset cycle for demo
  useEffect(() => {
    if (celebrated) {
      const t = setTimeout(() => {
        setGifts([]);
        setTotalCoins(0);
        setCelebrated(false);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [celebrated]);

  useEffect(() => {
    if (!lastSender) return;
    const t = setTimeout(() => setLastSender(null), 3000);
    return () => clearTimeout(t);
  }, [lastSender]);

  const fillPercent = Math.min((totalCoins / TARGET) * 100, 100);
  const isComplete = totalCoins >= TARGET;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Confetti layer */}
      <AnimatePresence>
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ y: "50%", x: `${piece.x}%`, opacity: 1, scale: 0 }}
            animate={{
              y: ["-10%", "110%"],
              x: `${piece.x + (Math.random() * 20 - 10)}%`,
              opacity: [1, 1, 0],
              scale: [0, 1, 0.6],
              rotate: [0, Math.random() * 360],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 + Math.random(), delay: piece.delay, ease: "easeOut" }}
            className="absolute pointer-events-none z-20"
            style={{ width: piece.size, height: piece.size * 1.5, borderRadius: 1, background: piece.color }}
          />
        ))}
      </AnimatePresence>

      {/* Completion glow */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0.15] }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "radial-gradient(circle, hsl(45 100% 60% / 0.2), transparent 60%)" }}
        />
      )}

      {/* Subtle warm ambient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(45 80% 60%), transparent 70%)" }} />
      </div>

      {/* Jar */}
      <div className="relative w-[130px] h-[170px]">
        {/* Jar body */}
        <div className="absolute inset-x-2 top-[24px] bottom-0 rounded-b-[24px] rounded-t-[4px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: `1.5px solid ${isComplete ? "hsl(45 100% 55% / 0.3)" : "rgba(255,255,255,0.14)"}`,
            boxShadow: isComplete
              ? "inset 0 0 15px hsl(45 100% 55% / 0.08), 0 0 25px hsl(45 100% 55% / 0.15)"
              : "inset 0 0 15px rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)",
          }}>

          {/* Liquid fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${fillPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(180deg, hsl(45 70% 60% / 0.08) 0%, hsl(45 80% 50% / 0.18) 100%)",
              borderTop: "1px solid hsl(45 80% 60% / 0.15)",
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-15, 15, -15] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "linear-gradient(90deg, transparent, hsl(45 80% 70% / 0.06), transparent)" }}
            />
          </motion.div>

          {/* Gift images inside jar */}
          <AnimatePresence>
            {gifts.map(gift => (
              <motion.img
                key={gift.id}
                src={gift.img}
                initial={{ y: -30, opacity: 0, scale: 0.3 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotate: gift.rotation }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${gift.x}%`,
                  top: `${gift.y}%`,
                  width: gift.size,
                  height: gift.size,
                  transform: "translate(-50%, -50%)",
                  objectFit: "contain",
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
                }}
                draggable={false}
              />
            ))}
          </AnimatePresence>

          {/* Glass highlights */}
          <div className="absolute top-0 left-[2px] w-[28%] h-full opacity-[0.07] rounded-bl-[24px]"
            style={{ background: "linear-gradient(135deg, white 0%, transparent 50%)" }} />
          <div className="absolute top-[10%] right-[3px] w-[12%] h-[60%] opacity-[0.04] rounded-r-[20px]"
            style={{ background: "linear-gradient(180deg, white, transparent)" }} />
        </div>

        {/* Jar lid */}
        <div className="absolute top-0 left-0 right-0 h-[28px]">
          <div className="absolute inset-x-[-3px] top-[10px] h-[18px] rounded-t-[5px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderBottom: "none",
            }} />
          <div className="absolute inset-x-[-7px] top-[5px] h-[12px] rounded-[4px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.1)",
            }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[18px] h-[8px] rounded-t-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
              border: "1px solid rgba(255,255,255,0.12)",
              borderBottom: "none",
            }} />
        </div>
      </div>

      {/* Coin total */}
      <motion.div
        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${isComplete ? "hsl(45 100% 55% / 0.2)" : "rgba(255,255,255,0.08)"}`,
        }}
        animate={{ scale: lastSender ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-sm">🪙</span>
        <motion.span
          className="text-sm font-bold font-heading"
          style={{ color: isComplete ? "hsl(45 100% 70%)" : "hsl(45 100% 65%)" }}
          key={totalCoins}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {totalCoins.toLocaleString()}
        </motion.span>
        <span className="text-[9px] text-white/25">/ {TARGET}</span>
      </motion.div>

      {/* Completion text */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-[10px] font-bold"
            style={{ color: "hsl(45 100% 65%)" }}
          >
            🎉 Goal Reached!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last sender */}
      <AnimatePresence>
        {lastSender && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="mt-1.5 flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-[10px] text-white/50">{lastSender.name}</span>
            <span className="text-[10px] font-bold" style={{ color: "hsl(160 100% 50%)" }}>+{lastSender.coins}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinJarPreview;
