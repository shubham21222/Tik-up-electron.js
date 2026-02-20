import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ElectricGiftAlertSettings {
  ring_color?: string;          // HSL string e.g. "180 100% 55%"
  color_mode?: "fixed" | "random" | "gift_match";
  particles?: boolean;
  electric_shards?: boolean;
  animation_style?: "electric" | "flip_3d" | "bounce" | "slide";
  name_size?: number;
  show_tier?: boolean;
  show_coins?: boolean;
  scanlines?: boolean;
  glow_intensity?: number;      // 0-100
  ring_count?: string;          // "1" | "2" | "3"
  position?: string;
  duration?: number;
  // Gift list from real catalog
  previewGifts?: Array<{ user: string; gift: string; emoji: string; img: string | null; coins: number; tier: string; color?: string }>;
}

// Tier→color palette for gift_match / random
const TIER_COLORS: Record<string, string> = {
  legendary: "45 100% 58%",
  epic:      "280 100% 70%",
  rare:      "200 100% 60%",
  common:    "180 100% 55%",
};
const RANDOM_PALETTE = [
  "180 100% 55%", "45 100% 55%", "280 100% 65%",
  "200 100% 60%", "350 90% 60%", "120 100% 50%",
  "30 100% 60%",  "320 100% 65%",
];

const defaultGifts = [
  { user: "NightOwl_Pro",  gift: "Lion",        emoji: "🦁", img: null,                         coins: 29999, tier: "legendary" },
  { user: "StreamKing99",  gift: "Rose",         emoji: "🌹", img: "/gifts/rose.png",             coins: 1,    tier: "common"   },
  { user: "GiftGod_X",    gift: "Drama Queen",  emoji: "👑", img: null,                         coins: 5000,  tier: "epic"     },
  { user: "TikUp_Fan42",  gift: "Flame Heart",  emoji: "❤️‍🔥", img: "/gifts/flame_heart.png",  coins: 500,   tier: "rare"     },
  { user: "ProStreamer_X", gift: "Love You",     emoji: "💖", img: "/gifts/love_you_so_much.png",coins: 2000,  tier: "epic"     },
];

/* ────────────────── sub-components ────────────────── */

const CrystalShard = ({ angle, dist, size, delay, active, color }: {
  angle: number; dist: number; size: number; delay: number; active: boolean; color: string;
}) => {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  const rot = angle + 90 + (Math.random() - 0.5) * 40;
  const w = size, h = size * 2.4;
  const pts = `${w*0.5},0 ${w},${h*0.35} ${w*0.75},${h} ${w*0.25},${h} 0,${h*0.35}`;
  const uid = `cs${Math.round(angle)}${Math.round(size)}`;
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="absolute pointer-events-none"
          style={{ top: "50%", left: "50%", translateX: "-50%", translateY: "-50%" }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: rot - 30 }}
          animate={{ x: tx, y: ty, opacity: [0, 1, 1, 0.8, 0], scale: [0.2, 1.1, 1, 0.95, 0.7], rotate: rot }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 + delay * 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${color})`} stopOpacity="0.95" />
                <stop offset="100%" stopColor={`hsl(${color})`} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <polygon points={pts} fill={`url(#${uid})`} />
            <polygon points={`${w*0.5},${h*0.05} ${w*0.8},${h*0.3} ${w*0.6},${h*0.55} ${w*0.4},${h*0.55} ${w*0.2},${h*0.3}`} fill="rgba(255,255,255,0.25)" />
            <polygon points={pts} fill="none" stroke={`hsl(${color})`} strokeWidth="0.8"
              style={{ filter: `drop-shadow(0 0 4px hsl(${color}))` }} />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Spark = ({ angle, dist, delay, active, color }: { angle: number; dist: number; delay: number; active: boolean; color: string }) => {
  const rad = (angle * Math.PI) / 180;
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{
            width: 4, height: 4,
            background: `hsl(${color})`,
            boxShadow: `0 0 6px hsl(${color}), 0 0 12px hsl(${color})`,
            top: "50%", left: "50%", marginTop: -2, marginLeft: -2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: [1, 1, 0], scale: [1, 1.5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 + delay * 0.2, ease: "easeOut" }} />
      )}
    </AnimatePresence>
  );
};

const PulseRing = ({ active, delay = 0, color }: { active: boolean; delay?: number; color: string }) => (
  <AnimatePresence>
    {active && (
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{
          width: 220, height: 220, top: "50%", left: "50%", marginTop: -110, marginLeft: -110,
          border: `2px solid hsl(${color})`,
          boxShadow: `0 0 30px hsl(${color} / 0.8)`,
        }}
        initial={{ scale: 0.7, opacity: 1 }}
        animate={{ scale: 2.2, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.4, delay, ease: "easeOut" }} />
    )}
  </AnimatePresence>
);

/* ────────────────── main component ────────────────── */

interface Props {
  settings?: ElectricGiftAlertSettings;
}

const ElectricGiftAlertPreview = ({ settings = {} }: Props) => {
  const {
    ring_color = "180 100% 55%",
    color_mode = "fixed",
    particles = true,
    electric_shards = true,
    animation_style = "electric",
    name_size = 26,
    show_tier = true,
    show_coins = true,
    scanlines = false,
    glow_intensity = 80,
    ring_count = "3",
    previewGifts,
  } = settings;

  const gifts = (previewGifts && previewGifts.length > 0) ? previewGifts : defaultGifts;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const [burst, setBurst] = useState(false);
  const [activeColor, setActiveColor] = useState(ring_color);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute glow factor from 0-100
  const glowFactor = (glow_intensity ?? 80) / 100;

  const resolveColor = useCallback((gift: typeof gifts[0]) => {
    if (color_mode === "random") return RANDOM_PALETTE[Math.floor(Math.random() * RANDOM_PALETTE.length)];
    if (color_mode === "gift_match") return (gift as any).color || TIER_COLORS[gift.tier] || ring_color;
    return ring_color;
  }, [color_mode, ring_color]);

  const triggerBurst = useCallback((gift: typeof gifts[0]) => {
    const c = resolveColor(gift);
    setActiveColor(c);
    setBurst(true);
    setTimeout(() => { setBurst(false); setPhase("idle"); }, 1800);
  }, [resolveColor]);

  const triggerNext = useCallback(() => {
    setPhase("exit");
    setTimeout(() => {
      setIdx(p => {
        const next = (p + 1) % gifts.length;
        triggerBurst(gifts[next]);
        return next;
      });
      setPhase("enter");
    }, 500);
  }, [gifts, triggerBurst]);

  // Restart cycle whenever key settings change so preview updates instantly
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx(0);
    triggerBurst(gifts[0]);
    timerRef.current = setInterval(triggerNext, 4200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ring_color, color_mode, animation_style, ring_count, glow_intensity, particles, electric_shards, scanlines, previewGifts]);

  const gift = gifts[idx];
  const color = activeColor;

  // Shards layout
  const shards = [
    { angle: -55,  dist: 145, size: 18, delay: 0 },
    { angle: -20,  dist: 160, size: 24, delay: 0.05 },
    { angle: 15,   dist: 150, size: 20, delay: 0.1 },
    { angle: 50,   dist: 140, size: 16, delay: 0.15 },
    { angle: 80,   dist: 155, size: 22, delay: 0.08 },
    { angle: 115,  dist: 145, size: 14, delay: 0.12 },
    { angle: -85,  dist: 130, size: 12, delay: 0.18 },
    { angle: -120, dist: 150, size: 20, delay: 0.06 },
    { angle: 150,  dist: 160, size: 26, delay: 0.02 },
    { angle: -145, dist: 145, size: 18, delay: 0.09 },
    { angle: 175,  dist: 130, size: 14, delay: 0.2 },
    { angle: -170, dist: 140, size: 22, delay: 0.04 },
  ];
  const sparks = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * 360, dist: 100 + Math.sin(i) * 40, delay: i * 0.03,
  }));

  // ── Entry animation variants by style ──
  type AnimDef = {
    initial: Record<string, number>;
    animate: Record<string, number>;
    exit: Record<string, number>;
    transition: { type: "spring"; stiffness: number; damping: number };
  };
  const getEntryAnim = (): AnimDef => {
    switch (animation_style) {
      case "flip_3d":
        return {
          initial: { rotateY: -180, opacity: 0, scale: 0.7 },
          animate: { rotateY: 0,    opacity: 1, scale: 1 },
          exit:    { rotateY: 180,  opacity: 0, scale: 0.7 },
          transition: { type: "spring", stiffness: 280, damping: 22 },
        };
      case "bounce":
        return {
          initial: { scale: 0.2, opacity: 0, y: -60 },
          animate: { scale: 1,   opacity: 1, y: 0 },
          exit:    { scale: 0.7, opacity: 0, y: 40 },
          transition: { type: "spring", stiffness: 400, damping: 18 },
        };
      case "slide":
        return {
          initial: { x: -160, opacity: 0 },
          animate: { x: 0,    opacity: 1 },
          exit:    { x: 160,  opacity: 0 },
          transition: { type: "spring", stiffness: 300, damping: 24 },
        };
      default: // electric
        return {
          initial: { scale: 0.6, opacity: 0 },
          animate: { scale: 1,   opacity: 1 },
          exit:    { scale: 0.75, opacity: 0, y: -20 },
          transition: { type: "spring", stiffness: 320, damping: 20 },
        };
    }
  };
  const anim = getEntryAnim();

  const ringCounts = parseInt(ring_count || "3", 10);
  const ringDefs = [
    { size: 220, speed: 8,  opacity: 0.35 * glowFactor, dash: true },
    { size: 235, speed: -14, opacity: 0.2 * glowFactor, dash: true },
    { size: 208, speed: 20, opacity: 0.12 * glowFactor, dash: false },
  ].slice(0, ringCounts);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 45%, #1a1a1a 0%, #0a0a0a 100%)", perspective: 1200 }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Scan-line overlay */}
      {scanlines && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)" }} />
      )}

      {/* Ambient bloom */}
      <motion.div className="absolute pointer-events-none"
        style={{
          width: 380, height: 380, borderRadius: "50%",
          background: `radial-gradient(circle, hsl(${color} / ${0.12 * glowFactor}) 0%, transparent 70%)`,
          top: "50%", left: "50%", transform: "translate(-50%, -58%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div
            key={`${idx}-${animation_style}`}
            className="flex flex-col items-center"
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={anim.transition}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ── Icon frame ── */}
            <div className="relative" style={{ width: 240, height: 240 }}>

              {/* Crystal shards */}
              {electric_shards && shards.map((s, i) => (
                <CrystalShard key={`${idx}-s${i}`} {...s} active={burst} color={color} />
              ))}

              {/* Sparks */}
              {particles && sparks.map((s, i) => (
                <Spark key={`${idx}-sp${i}`} {...s} active={burst} color={color} />
              ))}

              {/* Pulse rings */}
              {particles && <>
                <PulseRing active={burst} delay={0}    color={color} />
                <PulseRing active={burst} delay={0.18} color={color} />
                <PulseRing active={burst} delay={0.36} color={color} />
              </>}

              {/* Rotating rings */}
              {ringDefs.map((r, i) => (
                <motion.div key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: r.size, height: r.size,
                    top: "50%", left: "50%",
                    marginTop: -r.size / 2, marginLeft: -r.size / 2,
                    border: `${r.dash ? "1.5px dashed" : "1px solid"} hsl(${color} / ${r.opacity})`,
                    boxShadow: `0 0 10px hsl(${color} / ${r.opacity * 0.5})`,
                  }}
                  animate={{ rotate: r.speed > 0 ? 360 : -360 }}
                  transition={{ duration: Math.abs(r.speed), repeat: Infinity, ease: "linear" }} />
              ))}

              {/* Outer metallic ring */}
              <div className="absolute rounded-full" style={{
                width: 220, height: 220, top: "50%", left: "50%", marginTop: -110, marginLeft: -110,
                background: "conic-gradient(from 0deg, #1c1c1e, #3a3a3c, #0e0e10, #3a3a3c, #1c1c1e, #2c2c2e, #0e0e10, #1c1c1e)",
                boxShadow: `0 0 0 6px #111, 0 0 ${40 * glowFactor}px hsl(${color} / ${0.5 * glowFactor}), inset 0 2px 8px rgba(255,255,255,0.08)`,
              }} />

              {/* Cyan glow ring */}
              <motion.div className="absolute rounded-full pointer-events-none" style={{
                width: 220, height: 220, top: "50%", left: "50%", marginTop: -110, marginLeft: -110,
                border: `2px solid hsl(${color} / 0.9)`,
                boxShadow: `0 0 ${20 * glowFactor}px hsl(${color} / 0.8), 0 0 ${50 * glowFactor}px hsl(${color} / 0.4), inset 0 0 ${30 * glowFactor}px hsl(${color} / 0.08)`,
              }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />

              {/* Dot markers */}
              {[0, 90, 180, 270].map((a, i) => {
                const r2 = (a * Math.PI) / 180;
                return (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{
                      width: 8, height: 8,
                      left: 120 + Math.cos(r2) * 110 - 4,
                      top:  120 + Math.sin(r2) * 110 - 4,
                      background: `hsl(${color})`,
                      boxShadow: `0 0 8px hsl(${color}), 0 0 16px hsl(${color})`,
                    }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }} />
                );
              })}

              {/* Inner gift circle */}
              <motion.div className="absolute rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 190, height: 190, top: "50%", left: "50%", marginTop: -95, marginLeft: -95,
                  background: "radial-gradient(circle at 40% 35%, #2a2a2a, #0d0d0d)",
                  boxShadow: `inset 0 0 ${40 * glowFactor}px hsl(${color} / 0.25), inset 0 -10px 30px rgba(0,0,0,0.8)`,
                }}
                animate={phase === "idle" ? { scale: [1, 1.02, 1] } : undefined}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, hsl(${color} / 0.12) 0%, transparent 65%)` }} />
                {gift.img ? (
                  <img src={gift.img} alt={gift.gift} className="object-contain relative z-10"
                    style={{ width: 130, height: 130, filter: `drop-shadow(0 0 16px hsl(${color} / 0.6)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))` }} />
                ) : (
                  <span className="relative z-10 select-none"
                    style={{ fontSize: 90, lineHeight: 1, filter: `drop-shadow(0 0 20px hsl(${color} / 0.7)) drop-shadow(0 8px 24px rgba(0,0,0,0.9))` }}>
                    {gift.emoji}
                  </span>
                )}
              </motion.div>
            </div>

            {/* ── Text area ── */}
            <div className="mt-6 text-center" style={{ minWidth: 280 }}>
              <motion.span className="block font-black tracking-tight leading-none"
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: name_size,
                  fontFamily: "'Orbitron', monospace",
                  color: "#ffffff",
                  textShadow: `0 0 20px rgba(255,255,255,0.6), 0 0 40px hsl(${color} / 0.4)`,
                  letterSpacing: "-0.02em",
                }}>
                {gift.user}
              </motion.span>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
                style={{ fontSize: 11, color: `hsl(${color} / 0.8)`, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4, fontWeight: 600, textShadow: `0 0 8px hsl(${color})` }}>
                sent a
              </motion.p>

              <motion.span className="block font-black"
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.32, type: "spring", stiffness: 380, damping: 18 }}
                style={{
                  fontSize: 26, fontFamily: "'Orbitron', monospace",
                  color: `hsl(${color})`,
                  textShadow: `0 0 16px hsl(${color}), 0 0 40px hsl(${color} / 0.7)`,
                  marginTop: 2,
                }}>
                {gift.gift}!
              </motion.span>

              {/* Electric underline */}
              <motion.div className="mx-auto mt-3 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(${color}), hsl(${color} / 0.7), hsl(${color}), transparent)`,
                  boxShadow: `0 0 8px hsl(${color}), 0 0 20px hsl(${color} / 0.5)`,
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "75%", opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.7, ease: "easeOut" }} />

              {/* Tier / coin badge */}
              {(show_tier || show_coins) && (
                <motion.div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full"
                  style={{
                    background: `hsl(${color} / 0.12)`,
                    border: `1px solid hsl(${color} / 0.4)`,
                    boxShadow: `0 0 12px hsl(${color} / 0.2)`,
                  }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <motion.span className="w-2 h-2 rounded-full"
                    style={{ background: `hsl(${color})`, boxShadow: `0 0 6px hsl(${color})` }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: `hsl(${color})`, textShadow: `0 0 6px hsl(${color})` }}>
                    {show_coins && `🪙 ${gift.coins >= 1000 ? `${(gift.coins / 1000).toFixed(0)}K` : gift.coins}`}
                    {show_tier && show_coins && " · "}
                    {show_tier && gift.tier}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectricGiftAlertPreview;
