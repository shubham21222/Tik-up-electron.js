import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

/* ── Mock gift data cycling through different gifts ── */
const mockGifts = [
  { user: "NightOwl_Pro", gift: "Lion 🦁", img: null, emoji: "🦁", color: "45 100% 58%", coins: 29999, tier: "legendary" },
  { user: "StreamKing99", gift: "Rose 🌹", img: "/gifts/rose.png", emoji: "🌹", color: "350 90% 60%", coins: 1, tier: "common" },
  { user: "GiftGod_X", gift: "Drama Queen 👑", img: null, emoji: "👑", color: "280 100% 70%", coins: 5000, tier: "epic" },
  { user: "TikUp_Fan42", gift: "Flame Heart ❤️‍🔥", img: "/gifts/flame_heart.png", emoji: "❤️‍🔥", color: "20 100% 60%", coins: 500, tier: "rare" },
  { user: "ProStreamer_X", gift: "Love You 💖", img: "/gifts/love_you_so_much.png", emoji: "💖", color: "320 100% 65%", coins: 2000, tier: "epic" },
];

/* ── Particle shard ── */
const Shard = ({ i, color, active }: { i: number; color: string; active: boolean }) => {
  const angle = (i / 16) * 360;
  const dist = 90 + Math.random() * 50;
  const size = 3 + Math.random() * 5;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size, height: size,
            background: `hsl(${color})`,
            boxShadow: `0 0 ${size * 2}px hsl(${color})`,
            top: "50%", left: "50%",
            marginTop: -size / 2, marginLeft: -size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((angle * Math.PI) / 180) * dist,
            y: Math.sin((angle * Math.PI) / 180) * dist,
            opacity: [1, 1, 0],
            scale: [1, 1.5, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 + Math.random() * 0.5, delay: Math.random() * 0.15, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
};

/* ── Electric arc shard (long thin streaks) ── */
const ElectricShard = ({ i, color, active }: { i: number; color: string; active: boolean }) => {
  const angle = (i / 8) * 360 + Math.random() * 20;
  const len = 40 + Math.random() * 60;
  const width = 1 + Math.random() * 1.5;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute pointer-events-none origin-left"
          style={{
            width: len, height: width,
            background: `linear-gradient(90deg, hsl(${color}), transparent)`,
            boxShadow: `0 0 4px hsl(${color})`,
            top: "50%", left: "50%",
            marginTop: -width / 2,
            transformOrigin: "0 50%",
            rotate: angle,
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 0.7, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 + Math.random() * 0.4, delay: Math.random() * 0.2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
};

/* ── Rotating ring ── */
const Ring = ({ size, color, speed, opacity, dash, gap }: {
  size: number; color: string; speed: number; opacity: number; dash?: number; gap?: number;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      top: "50%", left: "50%",
      marginTop: -size / 2, marginLeft: -size / 2,
      border: `${dash ?? 1.5}px dashed hsl(${color} / ${opacity})`,
      boxShadow: `0 0 12px hsl(${color} / ${opacity * 0.4})`,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
  />
);

/* ── Pulse ring (expands out on activation) ── */
const PulseRing = ({ color, active, delay = 0 }: { color: string; active: boolean; delay?: number }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 100, height: 100,
          top: "50%", left: "50%",
          marginTop: -50, marginLeft: -50,
          border: `2px solid hsl(${color})`,
          boxShadow: `0 0 20px hsl(${color} / 0.6), inset 0 0 10px hsl(${color} / 0.2)`,
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />
    )}
  </AnimatePresence>
);

const ElectricGiftAlertPreview = () => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const [particlesActive, setParticlesActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNext = useCallback(() => {
    setPhase("exit");
    setTimeout(() => {
      setIdx(p => (p + 1) % mockGifts.length);
      setPhase("enter");
      setParticlesActive(true);
      setTimeout(() => {
        setParticlesActive(false);
        setPhase("idle");
      }, 1400);
    }, 500);
  }, []);

  useEffect(() => {
    setParticlesActive(true);
    setTimeout(() => { setParticlesActive(false); setPhase("idle"); }, 1400);
    timerRef.current = setInterval(triggerNext, 3800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [triggerNext]);

  const gift = mockGifts[idx];
  const tierGlow = { legendary: 1, epic: 0.8, rare: 0.6, common: 0.4 }[gift.tier] ?? 0.5;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,15,30,0.95), rgba(0,0,0,0.98))" }}>

      {/* Background radial pulse */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, hsl(${gift.color} / 0.08), transparent 65%)` }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scan-line overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)",
        }} />

      {/* Corner tech accents */}
      {[
        "top-4 left-4 border-t-2 border-l-2",
        "top-4 right-4 border-t-2 border-r-2",
        "bottom-4 left-4 border-b-2 border-l-2",
        "bottom-4 right-4 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-6 h-6 pointer-events-none ${cls}`}
          style={{ borderColor: `hsl(${gift.color} / 0.6)` }} />
      ))}

      {/* Main alert container */}
      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div
            key={idx}
            className="relative flex flex-col items-center"
            initial={{ scale: 0.4, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {/* ── Icon Area ── */}
            <div className="relative" style={{ width: 160, height: 160 }}>

              {/* Outer rotating rings */}
              <Ring size={160} color={gift.color} speed={8} opacity={0.35 * tierGlow} />
              <Ring size={140} color={gift.color} speed={-12} opacity={0.2 * tierGlow} dash={2} />
              <Ring size={180} color={gift.color} speed={20} opacity={0.12 * tierGlow} dash={1} gap={4} />

              {/* Glow ring (solid, animated from thin → full on enter) */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 150, height: 150,
                  top: "50%", left: "50%",
                  marginTop: -75, marginLeft: -75,
                  border: `2px solid hsl(${gift.color})`,
                  boxShadow: `0 0 30px hsl(${gift.color} / 0.7), 0 0 60px hsl(${gift.color} / 0.3), inset 0 0 30px hsl(${gift.color} / 0.1)`,
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Radial light streaks */}
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * 360;
                return (
                  <motion.div key={i}
                    className="absolute pointer-events-none"
                    style={{
                      width: 2, height: 24,
                      background: `linear-gradient(to top, hsl(${gift.color}), transparent)`,
                      boxShadow: `0 0 8px hsl(${gift.color} / 0.8)`,
                      top: "50%", left: "50%",
                      marginLeft: -1,
                      transformOrigin: "50% 100%",
                      transform: `rotate(${angle}deg) translateY(-90px)`,
                    }}
                    animate={{ opacity: [0.4, 1, 0.4], scaleY: [0.6, 1.2, 0.6] }}
                    transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  />
                );
              })}

              {/* Pulse rings on activation */}
              <PulseRing color={gift.color} active={particlesActive} delay={0} />
              <PulseRing color={gift.color} active={particlesActive} delay={0.2} />
              <PulseRing color={gift.color} active={particlesActive} delay={0.4} />

              {/* Particle shards */}
              {[...Array(16)].map((_, i) => <Shard key={i} i={i} color={gift.color} active={particlesActive} />)}
              {[...Array(8)].map((_, i) => <ElectricShard key={i} i={i} color={gift.color} active={particlesActive} />)}

              {/* Gift icon emblem */}
              <motion.div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  width: 120, height: 120,
                  top: "50%", left: "50%",
                  marginTop: -60, marginLeft: -60,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid hsl(${gift.color} / 0.3)`,
                  boxShadow: `0 0 40px hsl(${gift.color} / 0.35), inset 0 0 20px hsl(${gift.color} / 0.08)`,
                }}
                animate={phase === "idle" ? { scale: [1, 1.04, 1] } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Inner glow disc */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, hsl(${gift.color} / 0.15) 0%, transparent 70%)`,
                  }} />
                {gift.img ? (
                  <img src={gift.img} alt={gift.gift}
                    className="object-contain drop-shadow-lg relative z-10"
                    style={{ width: 68, height: 68, filter: `drop-shadow(0 0 12px hsl(${gift.color} / 0.8))` }} />
                ) : (
                  <span className="relative z-10" style={{ fontSize: 52, filter: `drop-shadow(0 0 14px hsl(${gift.color} / 0.9))` }}>
                    {gift.emoji}
                  </span>
                )}
              </motion.div>

              {/* Coin tier badge (top right) */}
              <motion.div
                className="absolute top-0 right-0 rounded-full flex items-center justify-center"
                style={{
                  width: 34, height: 34,
                  background: `linear-gradient(135deg, hsl(${gift.color} / 0.9), hsl(${gift.color} / 0.5))`,
                  boxShadow: `0 0 12px hsl(${gift.color} / 0.7)`,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
              >
                <span className="text-[8px] font-black text-black">🪙{gift.coins >= 1000 ? `${(gift.coins / 1000).toFixed(0)}K` : gift.coins}</span>
              </motion.div>
            </div>

            {/* ── Text Area ── */}
            <div className="mt-5 text-center relative" style={{ minWidth: 260 }}>
              {/* Sender name */}
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  className="block font-black tracking-tight leading-none"
                  style={{
                    fontSize: 26,
                    fontFamily: "'Orbitron', monospace",
                    background: `linear-gradient(135deg, #ffffff, hsl(${gift.color}))`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: `drop-shadow(0 0 12px hsl(${gift.color} / 0.7))`,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {gift.user}
                </span>
              </motion.div>

              {/* "sent a" label */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-1"
              >
                <span className="text-white/50 font-semibold tracking-widest uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.18em" }}>
                  sent a
                </span>
              </motion.div>

              {/* Gift name */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 18 }}
                className="mt-0.5"
              >
                <span
                  className="block font-black"
                  style={{
                    fontSize: 22,
                    fontFamily: "'Orbitron', monospace",
                    color: `hsl(${gift.color})`,
                    textShadow: `0 0 20px hsl(${gift.color} / 0.8), 0 0 40px hsl(${gift.color} / 0.4)`,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {gift.gift}
                </span>
              </motion.div>

              {/* Electric underline bar */}
              <motion.div
                className="mx-auto mt-2 h-px rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(${gift.color}), transparent)`,
                  boxShadow: `0 0 8px hsl(${gift.color} / 0.8)`,
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "80%", opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
              />

              {/* Tier badge */}
              <motion.div
                className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full"
                style={{
                  background: `hsl(${gift.color} / 0.15)`,
                  border: `1px solid hsl(${gift.color} / 0.35)`,
                  boxShadow: `0 0 10px hsl(${gift.color} / 0.15)`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: `hsl(${gift.color})`, boxShadow: `0 0 4px hsl(${gift.color})` }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[9px] font-bold tracking-widest uppercase"
                  style={{ color: `hsl(${gift.color})` }}>
                  {gift.tier}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbitron font loader */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');`}</style>
    </div>
  );
};

export default ElectricGiftAlertPreview;
