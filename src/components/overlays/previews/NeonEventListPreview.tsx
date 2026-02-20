import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const events = [
  { user: "NightOwl_Pro", action: "Gift x3", type: "gift", color: "280 100% 65%" },
  { user: "StreamKing99", action: "New Follow", type: "follow", color: "160 100% 50%" },
  { user: "TikUp_Fan", action: "Rose 🌹", type: "gift", color: "350 90% 60%" },
  { user: "GiftKing42", action: "Liked Stream", type: "like", color: "200 100% 60%" },
  { user: "CoolViewer", action: "Gift x10", type: "gift", color: "45 100% 58%" },
  { user: "ProStreamer", action: "Shared LIVE", type: "share", color: "120 100% 50%" },
];

/* ── Animated tech corner borders ── */
const TechBorder = ({ color = "255 255 255", glowIntensity = 0.3 }: { color?: string; glowIntensity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
    {/* Main border */}
    <rect x="1" y="1" width="98" height="98" rx="4" ry="4"
      fill="none" stroke={`rgba(${color},${glowIntensity})`} strokeWidth="0.5" />
    {/* Corner cuts TL */}
    <polyline points="1,12 1,1 12,1" fill="none" stroke={`rgba(${color},0.9)`} strokeWidth="1.2" strokeLinecap="round" />
    {/* Corner cuts TR */}
    <polyline points="88,1 99,1 99,12" fill="none" stroke={`rgba(${color},0.9)`} strokeWidth="1.2" strokeLinecap="round" />
    {/* Corner cuts BL */}
    <polyline points="1,88 1,99 12,99" fill="none" stroke={`rgba(${color},0.9)`} strokeWidth="1.2" strokeLinecap="round" />
    {/* Corner cuts BR */}
    <polyline points="88,99 99,99 99,88" fill="none" stroke={`rgba(${color},0.9)`} strokeWidth="1.2" strokeLinecap="round" />
    {/* Glow overlay */}
    <rect x="1" y="1" width="98" height="98" rx="4" ry="4"
      fill="none" stroke={`rgba(${color},${glowIntensity * 0.5})`} strokeWidth="3" filter="url(#blur)" />
    <defs>
      <filter id="blur"><feGaussianBlur stdDeviation="1" /></filter>
    </defs>
  </svg>
);

/* ── Single event row ── */
const EventRow = ({ event, delay }: { event: typeof events[0]; delay: number }) => (
  <motion.div
    className="relative mx-2 mb-1.5"
    initial={{ x: -30, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 30, opacity: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="relative rounded-sm px-3 py-1.5 flex items-center gap-2"
      style={{ background: "rgba(0,0,0,0.7)", border: `1px solid hsl(${event.color} / 0.25)` }}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-0.5" style={{ background: `hsl(${event.color})` }} />
      <div className="absolute top-0 left-0 w-0.5 h-2" style={{ background: `hsl(${event.color})` }} />
      <div className="absolute bottom-0 right-0 w-2 h-0.5" style={{ background: `hsl(${event.color})` }} />
      <div className="absolute bottom-0 right-0 w-0.5 h-2" style={{ background: `hsl(${event.color})` }} />
      {/* Glow dot */}
      <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: `hsl(${event.color})`, boxShadow: `0 0 6px hsl(${event.color})` }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay * 0.3 }} />
      <span className="text-[10px] font-bold text-white/90 truncate">{event.user}</span>
      <span className="text-[9px] ml-auto flex-shrink-0" style={{ color: `hsl(${event.color})` }}>{event.action}</span>
    </div>
    {/* Row glow */}
    <div className="absolute inset-0 rounded-sm pointer-events-none"
      style={{ boxShadow: `inset 0 0 12px hsl(${event.color} / 0.05)` }} />
  </motion.div>
);

const NeonEventListPreview = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const [offset, setOffset] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setOffset(p => (p + 1) % events.length);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const shown = [...Array(visibleCount)].map((_, i) => events[(offset + i) % events.length]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 40% 50%, rgba(30,10,60,0.5), rgba(0,0,0,0.8) 70%)" }}>
      <div className="relative w-full max-w-[280px]">
        {/* Header */}
        <motion.div
          className="relative mb-2 px-3 py-2 mx-2 rounded-sm flex items-center gap-2"
          style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}
          animate={{ borderColor: pulse ? "rgba(160,100%,45%,0.6)" : "rgba(255,255,255,0.12)" }}
        >
          <div className="absolute top-0 left-0 w-3 h-0.5 bg-white/80" />
          <div className="absolute top-0 left-0 w-0.5 h-3 bg-white/80" />
          <div className="absolute bottom-0 right-0 w-3 h-0.5 bg-white/80" />
          <div className="absolute bottom-0 right-0 w-0.5 h-3 bg-white/80" />
          <motion.div className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="text-[11px] font-bold text-white/90 tracking-widest uppercase">Live Events</span>
          <span className="ml-auto text-[9px] text-primary font-mono">{String(shown.length).padStart(2, "0")}</span>
        </motion.div>

        {/* Event rows */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {shown.map((ev, i) => (
              <EventRow key={`${ev.user}-${offset}-${i}`} event={ev} delay={i * 0.06} />
            ))}
          </AnimatePresence>
        </div>

        {/* Outer container border */}
        <div className="absolute -inset-1 pointer-events-none rounded-md"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute top-0 left-0 w-4 h-0.5 bg-white/30" />
          <div className="absolute top-0 left-0 w-0.5 h-4 bg-white/30" />
          <div className="absolute bottom-0 right-0 w-4 h-0.5 bg-white/30" />
          <div className="absolute bottom-0 right-0 w-0.5 h-4 bg-white/30" />
        </div>

        {/* Ambient glow */}
        <div className="absolute -inset-4 pointer-events-none rounded-xl blur-2xl"
          style={{ background: "radial-gradient(ellipse, rgba(120,80,255,0.08), transparent 70%)" }} />
      </div>
    </div>
  );
};

export default NeonEventListPreview;
