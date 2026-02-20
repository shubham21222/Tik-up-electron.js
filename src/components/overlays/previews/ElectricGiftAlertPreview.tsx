import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

const CYAN = "180 100% 55%";

const mockGifts = [
  { user: "NightOwl_Pro",   gift: "Lion",        emoji: "🦁", img: null,                          coins: 29999, tier: "legendary" },
  { user: "StreamKing99",   gift: "Rose",         emoji: "🌹", img: "/gifts/rose.png",              coins: 1,     tier: "common"   },
  { user: "GiftGod_X",      gift: "Drama Queen",  emoji: "👑", img: null,                          coins: 5000,  tier: "epic"     },
  { user: "TikUp_Fan42",    gift: "Flame Heart",  emoji: "❤️‍🔥", img: "/gifts/flame_heart.png",   coins: 500,   tier: "rare"     },
  { user: "ProStreamer_X",  gift: "Love You",     emoji: "💖", img: "/gifts/love_you_so_much.png", coins: 2000,  tier: "epic"     },
];

/* ── Crystal shard — large jagged polygon SVG ── */
const CrystalShard = ({
  angle, dist, size, delay, active,
}: { angle: number; dist: number; size: number; delay: number; active: boolean }) => {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  const rotate = angle + 90 + (Math.random() - 0.5) * 40;

  // Polygon points for a jagged crystal shape
  const w = size;
  const h = size * 2.4;
  const pts = `${w * 0.5},0 ${w},${h * 0.35} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h * 0.35}`;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: "50%", left: "50%", translateX: "-50%", translateY: "-50%" }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: rotate - 30 }}
          animate={{ x: tx, y: ty, opacity: [0, 1, 1, 0.8, 0], scale: [0.2, 1.1, 1, 0.95, 0.7], rotate }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 + delay * 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={`cg${Math.round(angle)}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(180 100% 80%)" stopOpacity="0.95" />
                <stop offset="40%" stopColor="hsl(180 100% 55%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(190 100% 35%)" stopOpacity="0.6" />
              </linearGradient>
              <filter id={`gf${Math.round(angle)}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Main facet */}
            <polygon points={pts} fill={`url(#cg${Math.round(angle)})`} filter={`url(#gf${Math.round(angle)})`} />
            {/* Inner highlight */}
            <polygon points={`${w*0.5},${h*0.05} ${w*0.8},${h*0.3} ${w*0.6},${h*0.55} ${w*0.4},${h*0.55} ${w*0.2},${h*0.3}`}
              fill="rgba(255,255,255,0.3)" />
            {/* Edge glow */}
            <polygon points={pts} fill="none"
              stroke="hsl(180 100% 75%)" strokeWidth="0.8"
              style={{ filter: "drop-shadow(0 0 4px hsl(180 100% 60%))" }} />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Small spark chip ── */
const Spark = ({ angle, dist, delay, active }: { angle: number; dist: number; delay: number; active: boolean }) => {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4, height: 4,
            background: "hsl(180 100% 80%)",
            boxShadow: "0 0 6px hsl(180 100% 55%), 0 0 12px hsl(180 100% 55%)",
            top: "50%", left: "50%",
            marginTop: -2, marginLeft: -2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: tx, y: ty, opacity: [1, 1, 0], scale: [1, 1.5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 + delay * 0.2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
};

/* ── Electric lightning bolt inside ring ── */
const LightningBolt = ({ angle, active, delay }: { angle: number; active: boolean; delay: number }) => {
  const r = (angle * Math.PI) / 180;
  const x1 = 50 + Math.cos(r) * 55;
  const y1 = 50 + Math.sin(r) * 55;
  const x2 = 50 + Math.cos(r) * 10;
  const y2 = 50 + Math.sin(r) * 10;
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 20;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;

  return (
    <AnimatePresence>
      {active && (
        <motion.svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.7, 0, 0.8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 + delay * 0.15, ease: "easeInOut" }}
        >
          <path
            d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
            stroke="hsl(180 100% 70%)" strokeWidth="0.8" fill="none"
            style={{ filter: "drop-shadow(0 0 3px hsl(180 100% 55%))" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
};

/* ── Pulse ring ── */
const PulseRing = ({ active, delay = 0 }: { active: boolean; delay?: number }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220, height: 220,
          top: "50%", left: "50%",
          marginTop: -110, marginLeft: -110,
          border: "2px solid hsl(180 100% 55%)",
          boxShadow: "0 0 30px hsl(180 100% 55% / 0.8)",
        }}
        initial={{ scale: 0.7, opacity: 1 }}
        animate={{ scale: 2.2, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.4, delay, ease: "easeOut" }}
      />
    )}
  </AnimatePresence>
);

/* ── Main component ── */
const ElectricGiftAlertPreview = () => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const [burst, setBurst] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNext = useCallback(() => {
    setPhase("exit");
    setTimeout(() => {
      setIdx(p => (p + 1) % mockGifts.length);
      setPhase("enter");
      setBurst(true);
      setTimeout(() => { setBurst(false); setPhase("idle"); }, 1800);
    }, 500);
  }, []);

  useEffect(() => {
    setBurst(true);
    setTimeout(() => { setBurst(false); setPhase("idle"); }, 1800);
    timerRef.current = setInterval(triggerNext, 4200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [triggerNext]);

  const gift = mockGifts[idx];

  // Crystal shard burst positions — asymmetric like the reference
  const shards = [
    { angle: -55,  dist: 145, size: 18, delay: 0    },
    { angle: -20,  dist: 160, size: 24, delay: 0.05 },
    { angle: 15,   dist: 150, size: 20, delay: 0.1  },
    { angle: 50,   dist: 140, size: 16, delay: 0.15 },
    { angle: 80,   dist: 155, size: 22, delay: 0.08 },
    { angle: 115,  dist: 145, size: 14, delay: 0.12 },
    { angle: -85,  dist: 130, size: 12, delay: 0.18 },
    { angle: -120, dist: 150, size: 20, delay: 0.06 },
    { angle: 150,  dist: 160, size: 26, delay: 0.02 },
    { angle: -145, dist: 145, size: 18, delay: 0.09 },
    { angle: 175,  dist: 130, size: 14, delay: 0.2  },
    { angle: -170, dist: 140, size: 22, delay: 0.04 },
  ];

  const sparks = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * 360, dist: 100 + Math.sin(i) * 40, delay: i * 0.03,
  }));

  const bolts = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360 + 22, delay: i * 0.08,
  }));

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 45%, #1a1a1a 0%, #0a0a0a 100%)" }}
    >
      {/* Orbitron font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Ambient background cyan bloom */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 380, height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(180 100% 45% / 0.12) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -58%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div
            key={idx}
            className="flex flex-col items-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            {/* ── Icon frame area ── */}
            <div className="relative" style={{ width: 240, height: 240 }}>

              {/* Crystal shards */}
              {shards.map((s, i) => (
                <CrystalShard key={`${idx}-${i}`} {...s} active={burst} />
              ))}

              {/* Spark chips */}
              {sparks.map((s, i) => (
                <Spark key={`${idx}-sp-${i}`} {...s} active={burst} />
              ))}

              {/* Pulse rings */}
              <PulseRing active={burst} delay={0} />
              <PulseRing active={burst} delay={0.18} />
              <PulseRing active={burst} delay={0.36} />

              {/* ── Outer metallic ring ── */}
              {/* Dark 3D ring base */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 220, height: 220,
                  top: "50%", left: "50%",
                  marginTop: -110, marginLeft: -110,
                  background: "conic-gradient(from 0deg, #1c1c1e, #3a3a3c, #0e0e10, #3a3a3c, #1c1c1e, #2c2c2e, #0e0e10, #1c1c1e)",
                  boxShadow: "0 0 0 6px #111, 0 0 40px hsl(180 100% 35% / 0.5), inset 0 2px 8px rgba(255,255,255,0.08), inset 0 -2px 8px rgba(0,0,0,0.6)",
                }}
              />

              {/* Cyan glow ring animated */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 220, height: 220,
                  top: "50%", left: "50%",
                  marginTop: -110, marginLeft: -110,
                  border: "2px solid hsl(180 100% 55% / 0.9)",
                  boxShadow: "0 0 20px hsl(180 100% 55% / 0.8), 0 0 50px hsl(180 100% 45% / 0.4), 0 0 80px hsl(180 100% 35% / 0.2), inset 0 0 30px hsl(180 100% 45% / 0.1)",
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Inner ring highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 198, height: 198,
                  top: "50%", left: "50%",
                  marginTop: -99, marginLeft: -99,
                  border: "1px solid hsl(180 100% 60% / 0.3)",
                  boxShadow: "inset 0 0 20px hsl(180 100% 55% / 0.15)",
                }}
              />

              {/* Ring rotation segments (mimics the aperture look) */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 220, height: 220,
                  top: "50%", left: "50%",
                  marginTop: -110, marginLeft: -110,
                  border: "3px dashed hsl(180 100% 55% / 0.15)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 208, height: 208,
                  top: "50%", left: "50%",
                  marginTop: -104, marginLeft: -104,
                  border: "1px dashed hsl(180 100% 45% / 0.12)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />

              {/* Lightning bolts inside ring */}
              {bolts.map((b, i) => (
                <LightningBolt key={`${idx}-bolt-${i}`} angle={b.angle} delay={b.delay} active={burst} />
              ))}

              {/* Idle lightning flicker */}
              {phase === "idle" && bolts.slice(0, 4).map((b, i) => (
                <motion.svg
                  key={`idle-bolt-${i}`}
                  className="absolute inset-0 pointer-events-none"
                  viewBox="0 0 100 100"
                  style={{ width: "100%", height: "100%" }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
                >
                  {(() => {
                    const r = (b.angle * Math.PI) / 180;
                    const x1 = 50 + Math.cos(r) * 52;
                    const y1 = 50 + Math.sin(r) * 52;
                    const x2 = 50 + Math.cos(r) * 12;
                    const y2 = 50 + Math.sin(r) * 12;
                    const mx = (x1+x2)/2 + 8;
                    const my = (y1+y2)/2 - 6;
                    return <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                      stroke="hsl(180 100% 65%)" strokeWidth="0.6" fill="none"
                      style={{ filter: "drop-shadow(0 0 2px hsl(180 100% 55%))" }} />;
                  })()}
                </motion.svg>
              ))}

              {/* ── Gift icon circle (fills inner ring) ── */}
              <motion.div
                className="absolute rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 190, height: 190,
                  top: "50%", left: "50%",
                  marginTop: -95, marginLeft: -95,
                  background: "radial-gradient(circle at 40% 35%, #2a2a2a, #0d0d0d)",
                  boxShadow: "inset 0 0 40px hsl(180 100% 30% / 0.25), inset 0 -10px 30px rgba(0,0,0,0.8)",
                }}
                animate={phase === "idle" ? { scale: [1, 1.02, 1] } : undefined}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Inner cyan crack glow overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, hsl(180 100% 45% / 0.12) 0%, transparent 65%)",
                  }}
                />
                {gift.img ? (
                  <img
                    src={gift.img} alt={gift.gift}
                    className="object-contain relative z-10"
                    style={{
                      width: 130, height: 130,
                      filter: "drop-shadow(0 0 16px hsl(180 100% 55% / 0.6)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))",
                    }}
                  />
                ) : (
                  <span
                    className="relative z-10 select-none"
                    style={{
                      fontSize: 90,
                      lineHeight: 1,
                      filter: "drop-shadow(0 0 20px hsl(180 100% 55% / 0.7)) drop-shadow(0 8px 24px rgba(0,0,0,0.9))",
                    }}
                  >
                    {gift.emoji}
                  </span>
                )}
              </motion.div>

              {/* Corner tech markers on ring */}
              {[0, 90, 180, 270].map((a, i) => {
                const r2 = (a * Math.PI) / 180;
                const cx = 120 + Math.cos(r2) * 110 - 4;
                const cy = 120 + Math.sin(r2) * 110 - 4;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 8, height: 8,
                      left: cx, top: cy,
                      background: "hsl(180 100% 55%)",
                      boxShadow: "0 0 8px hsl(180 100% 55%), 0 0 16px hsl(180 100% 40%)",
                    }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  />
                );
              })}
            </div>

            {/* ── Text block ── */}
            <div className="mt-6 text-center" style={{ minWidth: 280 }}>

              {/* Username */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  className="block font-black tracking-tight leading-none"
                  style={{
                    fontSize: 30,
                    fontFamily: "'Orbitron', monospace",
                    color: "#ffffff",
                    textShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px hsl(180 100% 55% / 0.4), 0 2px 8px rgba(0,0,0,0.8)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {gift.user}
                </span>
              </motion.div>

              {/* "sent a" */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                style={{
                  fontSize: 11,
                  color: "hsl(180 100% 75% / 0.8)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: 4,
                  fontWeight: 600,
                  textShadow: "0 0 8px hsl(180 100% 55%)",
                }}
              >
                sent a
              </motion.p>

              {/* Gift name */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.32, type: "spring", stiffness: 380, damping: 18 }}
              >
                <span
                  className="block font-black"
                  style={{
                    fontSize: 26,
                    fontFamily: "'Orbitron', monospace",
                    color: "hsl(180 100% 60%)",
                    textShadow: "0 0 16px hsl(180 100% 55%), 0 0 40px hsl(180 100% 40% / 0.7), 0 0 80px hsl(180 100% 30% / 0.4)",
                    letterSpacing: "0.01em",
                    marginTop: 2,
                  }}
                >
                  {gift.gift}!
                </span>
              </motion.div>

              {/* Electric underline */}
              <motion.div
                className="mx-auto mt-3 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(180 100% 55%), hsl(180 100% 75%), hsl(180 100% 55%), transparent)",
                  boxShadow: "0 0 8px hsl(180 100% 55%), 0 0 20px hsl(180 100% 40% / 0.5)",
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "75%", opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.7, ease: "easeOut" }}
              />

              {/* Coin badge */}
              <motion.div
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full"
                style={{
                  background: "hsl(180 100% 45% / 0.12)",
                  border: "1px solid hsl(180 100% 55% / 0.4)",
                  boxShadow: "0 0 12px hsl(180 100% 45% / 0.2)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "hsl(180 100% 55%)",
                    boxShadow: "0 0 6px hsl(180 100% 55%)",
                  }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "hsl(180 100% 65%)",
                  textShadow: "0 0 6px hsl(180 100% 55%)",
                }}>
                  🪙 {gift.coins >= 1000 ? `${(gift.coins / 1000).toFixed(0)}K` : gift.coins} coins · {gift.tier}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectricGiftAlertPreview;
