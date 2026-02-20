import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

// ── Tier colors
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

function coinToTier(coins: number): string {
  if (coins >= 10000) return "legendary";
  if (coins >= 1000)  return "epic";
  if (coins >= 100)   return "rare";
  return "common";
}

interface LiveGiftEvent {
  id: number;
  user: string;
  gift: string;
  coins: number;
  count: number;
  img?: string;
  emoji: string;
  tier: string;
}

// ── Crystal Shard
const CrystalShard = ({ angle, dist, size, delay, active, color }: {
  angle: number; dist: number; size: number; delay: number; active: boolean; color: string;
}) => {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  const rot = angle + 90;
  const w = size, h = size * 2.4;
  const pts = `${w*0.5},0 ${w},${h*0.35} ${w*0.75},${h} ${w*0.25},${h} 0,${h*0.35}`;
  const uid = `rcs${Math.round(angle)}${Math.round(size)}`;
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
            <polygon points={pts} fill="none" stroke={`hsl(${color})`} strokeWidth="0.8"
              style={{ filter: `drop-shadow(0 0 4px hsl(${color}))` }} />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Spark
const Spark = ({ angle, dist, delay, active, color }: {
  angle: number; dist: number; delay: number; active: boolean; color: string;
}) => {
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

// ── Pulse ring
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

// ── Entry anim per style
const getEntryAnim = (style: string) => {
  switch (style) {
    case "flip_3d":
      return {
        initial: { rotateY: -180, opacity: 0, scale: 0.7 },
        animate: { rotateY: 0,    opacity: 1, scale: 1 },
        exit:    { rotateY: 180,  opacity: 0, scale: 0.7 },
        transition: { type: "spring" as const, stiffness: 280, damping: 22 },
      };
    case "bounce":
      return {
        initial: { scale: 0.2, opacity: 0, y: -60 },
        animate: { scale: 1,   opacity: 1, y: 0 },
        exit:    { scale: 0.7, opacity: 0, y: 40 },
        transition: { type: "spring" as const, stiffness: 400, damping: 18 },
      };
    case "slide":
      return {
        initial: { x: -160, opacity: 0 },
        animate: { x: 0,    opacity: 1 },
        exit:    { x: 160,  opacity: 0 },
        transition: { type: "spring" as const, stiffness: 300, damping: 24 },
      };
    default: // electric
      return {
        initial: { scale: 0.6, opacity: 0 },
        animate: { scale: 1,   opacity: 1 },
        exit:    { scale: 0.75, opacity: 0 },
        transition: { type: "spring" as const, stiffness: 320, damping: 20 },
      };
  }
};

const SHARDS = [
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
const SPARKS = Array.from({ length: 20 }, (_, i) => ({
  angle: (i / 20) * 360, dist: 100 + Math.sin(i) * 40, delay: i * 0.03,
}));

// ── Full Electric Alert card
const ElectricAlertCard = ({
  event, settings, onDone,
}: {
  event: LiveGiftEvent;
  settings: Record<string, any>;
  onDone: () => void;
}) => {
  const [burst, setBurst] = useState(false);
  const [visible, setVisible] = useState(true);

  const color_mode   = settings.color_mode   || "fixed";
  const ring_color   = settings.ring_color   || "180 100% 55%";
  const glow_intensity = (settings.glow_intensity ?? 80) / 100;
  const ring_count   = parseInt(settings.ring_count || "3", 10);
  const particles    = settings.particles    !== false;
  const electric_shards = settings.electric_shards !== false;
  const scanlines    = settings.scanlines    || false;
  const show_tier    = settings.show_tier    !== false;
  const show_coins   = settings.show_coins   !== false;
  const name_size    = settings.name_size    || 26;
  const anim_style   = settings.animation_style || "electric";
  const duration     = (settings.duration    || 4) * 1000;

  // Resolve color per event
  const color = color_mode === "random"
    ? RANDOM_PALETTE[Math.floor(Math.random() * RANDOM_PALETTE.length)]
    : color_mode === "gift_match"
    ? TIER_COLORS[event.tier] || ring_color
    : ring_color;

  const anim = getEntryAnim(anim_style);

  const ringDefs = [
    { size: 220, speed: 8,  opacity: 0.35 * glow_intensity, dash: true },
    { size: 235, speed: -14, opacity: 0.2 * glow_intensity, dash: true },
    { size: 208, speed: 20, opacity: 0.12 * glow_intensity, dash: false },
  ].slice(0, ring_count);

  useEffect(() => {
    setBurst(true);
    setTimeout(() => setBurst(false), 1800);

    const hideTimer = setTimeout(() => setVisible(false), duration - 500);
    const doneTimer = setTimeout(onDone, duration);
    return () => { clearTimeout(hideTimer); clearTimeout(doneTimer); };
  }, [duration, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={event.id}
          className="flex flex-col items-center"
          initial={anim.initial}
          animate={anim.animate}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={anim.transition}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Ambient bloom */}
          <motion.div className="absolute pointer-events-none"
            style={{
              width: 380, height: 380, borderRadius: "50%",
              background: `radial-gradient(circle, hsl(${color} / ${0.12 * glow_intensity}) 0%, transparent 70%)`,
              top: "50%", left: "50%", transform: "translate(-50%, -58%)",
            }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

          {/* ── Icon frame ── */}
          <div className="relative" style={{ width: 240, height: 240 }}>
            {electric_shards && SHARDS.map((s, i) => (
              <CrystalShard key={i} {...s} active={burst} color={color} />
            ))}
            {particles && SPARKS.map((s, i) => (
              <Spark key={i} {...s} active={burst} color={color} />
            ))}
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
              boxShadow: `0 0 0 6px #111, 0 0 ${40 * glow_intensity}px hsl(${color} / ${0.5 * glow_intensity}), inset 0 2px 8px rgba(255,255,255,0.08)`,
            }} />

            {/* Cyan glow ring */}
            <motion.div className="absolute rounded-full pointer-events-none" style={{
              width: 220, height: 220, top: "50%", left: "50%", marginTop: -110, marginLeft: -110,
              border: `2px solid hsl(${color} / 0.9)`,
              boxShadow: `0 0 ${20 * glow_intensity}px hsl(${color} / 0.8), 0 0 ${50 * glow_intensity}px hsl(${color} / 0.4), inset 0 0 ${30 * glow_intensity}px hsl(${color} / 0.08)`,
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
            <div className="absolute rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: 190, height: 190, top: "50%", left: "50%", marginTop: -95, marginLeft: -95,
                background: "radial-gradient(circle at 40% 35%, #2a2a2a, #0d0d0d)",
                boxShadow: `inset 0 0 ${40 * glow_intensity}px hsl(${color} / 0.25), inset 0 -10px 30px rgba(0,0,0,0.8)`,
              }}>
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, hsl(${color} / 0.12) 0%, transparent 65%)` }} />
              {event.img ? (
                <img src={event.img} alt={event.gift} className="object-contain relative z-10"
                  style={{ width: 130, height: 130, filter: `drop-shadow(0 0 16px hsl(${color} / 0.6)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))` }} />
              ) : (
                <span className="relative z-10 select-none"
                  style={{ fontSize: 80, lineHeight: 1, filter: `drop-shadow(0 0 20px hsl(${color} / 0.7))` }}>
                  {event.emoji}
                </span>
              )}
            </div>
          </div>

          {/* ── Text area ── */}
          <div className="mt-6 text-center" style={{ minWidth: 280 }}>
            <motion.span className="block font-black tracking-tight leading-none"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                fontSize: name_size,
                fontFamily: "'Orbitron', monospace",
                color: "#ffffff",
                textShadow: `0 0 20px rgba(255,255,255,0.6), 0 0 40px hsl(${color} / 0.4)`,
              }}>
              {event.user}
            </motion.span>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              style={{ fontSize: 11, color: `hsl(${color} / 0.8)`, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4, fontWeight: 600, textShadow: `0 0 8px hsl(${color})` }}>
              sent a
            </motion.p>

            <motion.span className="block font-black"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.32, type: "spring", stiffness: 380, damping: 18 }}
              style={{
                fontSize: 26,
                fontFamily: "'Orbitron', monospace",
                color: `hsl(${color})`,
                textShadow: `0 0 16px hsl(${color}), 0 0 40px hsl(${color} / 0.7)`,
                marginTop: 2,
              }}>
              {event.gift}{event.count > 1 ? ` ×${event.count}` : ""}!
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
                  {show_coins && `🪙 ${event.coins >= 1000 ? `${(event.coins / 1000).toFixed(0)}K` : event.coins}`}
                  {show_tier && show_coins && " · "}
                  {show_tier && event.tier}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main renderer
const ElectricGiftAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [connected, setConnected] = useState(false);
  const [queue, setQueue] = useState<LiveGiftEvent[]>([]);
  const settingsRef = useRef<Record<string, any>>({});

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Load Google Fonts
  useEffect(() => {
    const id = "orbitron-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Fetch initial settings
  useEffect(() => {
    if (!publicToken) return;
    supabase
      .from("overlay_widgets")
      .select("settings")
      .eq("public_token", publicToken)
      .single()
      .then(({ data }) => {
        if (data) setSettings(applyUrlOverrides((data as any).settings || {}));
      });
  }, [publicToken]);

  const handleDone = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  // Realtime subscription — same channel convention as other gift alerts
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`gift-alert-${publicToken}`)
      .on("broadcast", { event: "gift_alert" }, (msg) => {
        const p = msg.payload || {} as any;
        const s = settingsRef.current;
        const giftName = p.giftName || p.gift_name || p.gift || "Gift";
        const coins = Number(p.coinValue || p.coin_value || p.diamondCount || 0);
        const tier = coinToTier(coins);

        // Trigger filter
        const trigger = s.trigger || "any_gift";
        if (trigger === "value_threshold" && coins < (s.min_coins || 1)) return;
        // specific gift check
        if (trigger === "specific_gift") {
          const specificId = s.specific_gift_id || "";
          const giftId = p.giftId || p.gift_id || "";
          if (specificId !== giftId && specificId !== giftName) return;
        }

        const event: LiveGiftEvent = {
          id: Date.now() + Math.random(),
          user: p.username || p.user || "Viewer",
          gift: giftName,
          coins,
          count: Number(p.repeatCount || p.repeat_count || p.count || 1),
          img: p.giftImageUrl || p.gift_image_url || undefined,
          emoji: p.emoji || "🎁",
          tier,
        };

        setQueue(prev => {
          if (s.queue !== false) return [...prev, event];
          return [event]; // replace current if queue disabled
        });
      })
      .on("broadcast", { event: "test_alert" }, () => {
        const testEvent: LiveGiftEvent = {
          id: Date.now(),
          user: "TikUp_User",
          gift: "Galaxy",
          coins: 5000,
          count: 1,
          img: undefined,
          emoji: "🌌",
          tier: "epic",
        };
        setQueue(prev => [...prev, testEvent]);
      })
      .subscribe(status => {
        setConnected(status === "SUBSCRIBED");
      });

    // Settings live update
    const dbChannel = supabase
      .channel(`electric-db-${publicToken}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (payload: any) => {
        if (payload.new?.settings) setSettings(payload.new.settings);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(dbChannel); };
  }, [publicToken]);

  const s = settings;
  const scanlines = s.scanlines || false;

  // Position mapping
  const posMap: Record<string, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-16",
    bottom: "items-end justify-center pb-16",
    "bottom-left": "items-end justify-start pb-16 pl-16",
    "bottom-right": "items-end justify-end pb-16 pr-16",
  };
  const posClass = posMap[s.position || "center"] || posMap.center;

  return (
    <div
      className={`w-screen h-screen overflow-hidden flex ${posClass} relative`}
      style={{ background: "transparent" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Scan-line overlay */}
      {scanlines && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-50"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)" }} />
      )}

      {/* Subtle vignette — fully transparent-safe for OBS / Live Studio */}
      {queue.length > 0 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.15) 0%, transparent 70%)" }} />
      )}

      {/* Connection dot */}
      <div className="fixed top-2 right-2 flex items-center gap-1 opacity-20 z-50">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/40 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <AnimatePresence mode="wait">
        {queue.length > 0 && (
          <ElectricAlertCard
            key={queue[0].id}
            event={queue[0]}
            settings={settings}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectricGiftAlertRenderer;
