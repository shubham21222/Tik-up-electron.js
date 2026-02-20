import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const profiles = [
  { name: "StreamKing", rank: "#1", coins: "12,450", color: "45 100% 58%", badge: "👑" },
  { name: "NightOwl_Pro", rank: "#2", coins: "8,200", color: "280 100% 65%", badge: "⚡" },
  { name: "TikUp_Fan", rank: "#3", coins: "5,880", color: "160 100% 50%", badge: "🌟" },
];

const segments = 6; // pie slices

const CircularProfileWidgetPreview = () => {
  const [profileIdx, setProfileIdx] = useState(0);
  const [rotating, setRotating] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setRotating(true);
      const deg = 360 / profiles.length;
      setRotation(p => p + deg);
      setTimeout(() => {
        setProfileIdx(p => (p + 1) % profiles.length);
        setRotating(false);
      }, 600);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const profile = profiles[profileIdx];
  const r = 90; // radius for SVG viewBox 200x200 center 100,100

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(15,10,30,0.7), rgba(0,0,0,0.9) 70%)" }}>
      <div className="relative flex flex-col items-center gap-3">

        {/* Circular widget */}
        <div className="relative w-52 h-52">
          {/* SVG ring system */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Segmented wheel */}
            {[...Array(segments)].map((_, i) => {
              const angle = (360 / segments) * i;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + r * Math.cos(rad);
              const y1 = 100 + r * Math.sin(rad);
              return (
                <line key={i} x1="100" y1="100" x2={x1} y2={y1}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              );
            })}

            {/* Rotating dashed accent ring */}
            <motion.circle cx="100" cy="100" r="90" fill="none"
              stroke={`hsl(${profile.color} / 0.35)`} strokeWidth="1.5"
              strokeDasharray="6 3"
              animate={{ rotate: rotation }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "100px 100px" }} />

            {/* Static outer border ring */}
            <circle cx="100" cy="100" r="96" fill="none"
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

            {/* Glow arc */}
            <motion.circle cx="100" cy="100" r="88" fill="none"
              stroke={`hsl(${profile.color} / 0.2)`} strokeWidth="4"
              strokeDasharray="280 300"
              animate={{ strokeDashoffset: [-20, -320] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

            {/* Arrow pointer (top center) */}
            <polygon points="100,4 94,16 106,16" fill="white" opacity="0.9" />
          </svg>

          {/* Center profile circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
            {/* Outer glow ring */}
            <motion.div className="absolute inset-0 rounded-full"
              style={{ border: `1.5px solid hsl(${profile.color} / 0.5)`, boxShadow: `0 0 20px hsl(${profile.color} / 0.3)` }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />

            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={profileIdx} className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}>
                  <span className="text-xl">{profile.badge}</span>
                  <span className="text-[8px] font-bold text-white/90 mt-0.5 text-center leading-tight">{profile.name}</span>
                  <span className="text-[7px] font-bold mt-0.5" style={{ color: `hsl(${profile.color})` }}>{profile.rank}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Outer corner markers */}
          {[0, 90, 180, 270].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 47 * Math.cos(rad - Math.PI / 2);
            const y = 50 + 47 * Math.sin(rad - Math.PI / 2);
            return (
              <motion.div key={angle}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${x}%`, top: `${y}%`,
                  background: `hsl(${profile.color})`,
                  boxShadow: `0 0 6px hsl(${profile.color})`,
                  transform: "translate(-50%, -50%)"
                }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: angle / 360 }} />
            );
          })}
        </div>

        {/* Stats below */}
        <AnimatePresence mode="wait">
          <motion.div key={profileIdx} className="text-center"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <p className="text-[11px] font-bold text-white/90">{profile.name}</p>
            <p className="text-[9px] mt-0.5" style={{ color: `hsl(${profile.color})` }}>
              🪙 {profile.coins} coins · {profile.rank} Top Gifter
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots pagination */}
        <div className="flex gap-1.5">
          {profiles.map((p, i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full"
              style={{ background: i === profileIdx ? `hsl(${p.color})` : "rgba(255,255,255,0.2)" }}
              animate={{ scale: i === profileIdx ? 1.4 : 1 }}
              transition={{ duration: 0.3 }} />
          ))}
        </div>

        {/* Ambient glow */}
        <div className="absolute -inset-8 pointer-events-none rounded-full blur-3xl"
          style={{ background: `radial-gradient(ellipse, hsl(${profile.color} / 0.07), transparent 70%)` }} />
      </div>
    </div>
  );
};

export default CircularProfileWidgetPreview;
