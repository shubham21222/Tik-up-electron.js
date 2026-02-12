import { motion } from "framer-motion";
import { useMemo } from "react";

interface WebcamFramePreviewProps {
  settings?: Record<string, any>;
}

const WebcamFramePreview = ({ settings = {} }: WebcamFramePreviewProps) => {
  const style = settings.frame_style || "neon_cyber";
  const thickness = settings.frame_thickness || 3;
  const speed = settings.animation_speed || 1;
  const glow = (settings.glow_intensity || 60) / 100;
  const c1 = settings.color_1 || "180 100% 50%";
  const c2 = settings.color_2 || "280 100% 65%";
  const dur = 3 / speed;
  const r = settings.corner_radius || 8;

  // Webcam cutout area (centered square)
  const frameInset = 12; // px from edge of preview

  const sparks = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, side: i % 4, pos: `${15 + (i * 11) % 70}%`, delay: i * 0.35,
  })), []);

  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const edge = i % 4;
    return {
      id: i, delay: i * 0.25,
      x: edge === 0 ? `${(i * 6) % 85 + 8}%` : edge === 1 ? `${(i * 7) % 85 + 8}%` : edge === 2 ? `${frameInset}px` : "auto",
      y: edge === 0 ? `${frameInset}px` : edge === 1 ? "auto" : `${(i * 8) % 80 + 10}%`,
      right: edge === 3 ? `${frameInset}px` : undefined,
      bottom: edge === 1 ? `${frameInset}px` : undefined,
      color: i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : "45 90% 60%",
    };
  }), [c1, c2]);

  const cornerSize = 14;

  /* ── Neon Cyber Rim ── */
  if (style === "neon_cyber") {
    return (
      <div className="relative w-full h-full">
        <motion.div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(${c1} / 0.6)` }}
          animate={{
            boxShadow: [
              `inset 0 0 ${8 * glow}px hsl(${c1}/0.1), 0 0 ${12 * glow}px hsl(${c1}/0.2)`,
              `inset 0 0 ${20 * glow}px hsl(${c1}/0.2), 0 0 ${35 * glow}px hsl(${c1}/0.4)`,
              `inset 0 0 ${8 * glow}px hsl(${c1}/0.1), 0 0 ${12 * glow}px hsl(${c1}/0.2)`,
            ],
            borderColor: [`hsl(${c1}/0.5)`, `hsl(${c2}/0.7)`, `hsl(${c1}/0.5)`],
          }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }} />
        {/* Corner accents */}
        {[{ top: frameInset, left: frameInset }, { top: frameInset, right: frameInset }, { bottom: frameInset, left: frameInset }, { bottom: frameInset, right: frameInset }].map((pos, i) => (
          <motion.div key={i} className="absolute" style={{ ...pos, width: cornerSize, height: cornerSize,
            borderTop: i < 2 ? `2px solid hsl(${c1})` : "none", borderBottom: i >= 2 ? `2px solid hsl(${c1})` : "none",
            borderLeft: i % 2 === 0 ? `2px solid hsl(${c1})` : "none", borderRight: i % 2 === 1 ? `2px solid hsl(${c1})` : "none",
            boxShadow: `0 0 ${6 * glow}px hsl(${c1} / 0.4)` }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    );
  }

  /* ── Golden Luxe ── */
  if (style === "golden_luxe") {
    return (
      <div className="relative w-full h-full">
        <motion.div className="absolute" style={{ inset: frameInset, borderRadius: r,
          border: `${thickness}px solid hsl(45 80% 55%/0.7)`,
          boxShadow: `inset 0 0 12px hsl(45 80% 55%/0.08), 0 0 18px hsl(45 80% 55%/0.12)` }}
          animate={{ borderColor: ["hsl(45 80% 55%/0.6)", "hsl(38 90% 65%/0.9)", "hsl(50 70% 50%/0.7)", "hsl(45 80% 55%/0.6)"] }}
          transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute h-[2px]" style={{ top: frameInset, left: frameInset, width: "40%",
          background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.8),transparent)" }}
          animate={{ left: [`${frameInset}px`, `calc(100% - ${frameInset}px)`] }}
          transition={{ duration: dur * 2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute h-[2px]" style={{ bottom: frameInset, right: frameInset, width: "30%",
          background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.6),transparent)" }}
          animate={{ right: [`${frameInset}px`, `calc(100% - ${frameInset}px)`] }}
          transition={{ duration: dur * 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      </div>
    );
  }

  /* ── Digital Pulse ── */
  if (style === "digital_pulse") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(${c1}/0.3)` }} />
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i} className="absolute" style={{
            height: i < 2 ? 2 : "30%", width: i < 2 ? "30%" : 2,
            background: `hsl(${i % 2 === 0 ? c1 : c2}/0.7)`,
            boxShadow: `0 0 8px hsl(${c1}/0.4)`,
            ...(i === 0 ? { top: frameInset, left: frameInset } : i === 1 ? { bottom: frameInset, right: frameInset }
              : i === 2 ? { top: frameInset, right: frameInset } : { bottom: frameInset, left: frameInset }),
          }}
            animate={{ opacity: [0, 1, 0], scaleX: i < 2 ? [0.3, 1, 0.3] : undefined, scaleY: i >= 2 ? [0.3, 1, 0.3] : undefined }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 + i * 0.4 }} />
        ))}
      </div>
    );
  }

  /* ── Particle Aura ── */
  if (style === "particle_aura") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(${c1}/0.12)` }} />
        {particles.map(p => (
          <motion.div key={p.id} className="absolute rounded-full"
            style={{ width: 3, height: 3, left: p.x, top: p.y, right: p.right, bottom: p.bottom,
              background: `hsl(${p.color})`, boxShadow: `0 0 6px hsl(${p.color})` }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
        ))}
      </div>
    );
  }

  /* ── Circuit Flow ── */
  if (style === "circuit_flow") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(210 100% 60%/0.15)` }} />
        <motion.div className="absolute h-[2px]" style={{ top: frameInset, left: frameInset, background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
          animate={{ width: ["0%", "90%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute w-[2px]" style={{ top: frameInset, right: frameInset, background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
          animate={{ height: ["0%", "90%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut", delay: dur * 0.35 }} />
        <motion.div className="absolute h-[2px]" style={{ bottom: frameInset, right: frameInset, background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
          animate={{ width: ["0%", "90%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut", delay: dur * 0.7 }} />
        <motion.div className="absolute w-[2px]" style={{ bottom: frameInset, left: frameInset, background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
          animate={{ height: ["0%", "90%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut", delay: dur * 1.05 }} />
      </div>
    );
  }

  /* ── Electro Corners ── */
  if (style === "electro_corners") {
    const cs = 20;
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(${c1}/0.1)` }} />
        {[{ top: frameInset, left: frameInset, bT: true, bL: true }, { top: frameInset, right: frameInset, bT: true, bR: true },
          { bottom: frameInset, left: frameInset, bB: true, bL: true }, { bottom: frameInset, right: frameInset, bB: true, bR: true }].map((pos, i) => (
          <motion.div key={i} className="absolute" style={{
            top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right, width: cs, height: cs,
            borderTop: pos.bT ? `3px solid hsl(${c1})` : "none", borderBottom: pos.bB ? `3px solid hsl(${c1})` : "none",
            borderLeft: pos.bL ? `3px solid hsl(${c1})` : "none", borderRight: pos.bR ? `3px solid hsl(${c1})` : "none",
            boxShadow: `0 0 ${12 * glow}px hsl(${c1}/0.4)`,
          }}
            animate={{ boxShadow: [`0 0 ${8 * glow}px hsl(${c1}/0.2)`, `0 0 ${20 * glow}px hsl(${c1}/0.5)`, `0 0 ${8 * glow}px hsl(${c1}/0.2)`] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }} />
        ))}
      </div>
    );
  }

  /* ── Liquid Glow ── */
  if (style === "liquid_glow") {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <motion.div className="absolute"
          style={{
            inset: frameInset - 1, borderRadius: r,
            background: `linear-gradient(var(--angle,0deg),hsl(${c2}/0.6),hsl(${c1}/0.6),hsl(280 100% 65%/0.6))`,
            padding: thickness,
            WebkitMask: "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor", maskComposite: "exclude",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: dur * 3.5, repeat: Infinity, ease: "linear" }}>
          <div className="w-full h-full" style={{ borderRadius: r }} />
        </motion.div>
      </div>
    );
  }

  /* ── Holographic Shift ── */
  if (style === "holographic_shift") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(180 100% 60%/0.2)` }} />
        <motion.div className="absolute" style={{ top: frameInset, left: frameInset, right: frameInset, height: 1,
          background: "linear-gradient(90deg,transparent,hsl(180 100% 70%/0.6),hsl(300 100% 70%/0.4),transparent)" }}
          animate={{ top: [frameInset, `calc(100% - ${frameInset}px)`] }}
          transition={{ duration: dur * 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
        <motion.div className="absolute" style={{ top: frameInset, bottom: frameInset, left: frameInset, width: 1,
          background: "linear-gradient(180deg,transparent,hsl(300 100% 70%/0.5),hsl(180 100% 70%/0.3),transparent)" }}
          animate={{ left: [frameInset, `calc(100% - ${frameInset}px)`] }}
          transition={{ duration: dur * 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }} />
      </div>
    );
  }

  /* ── Ember Flicker ── */
  if (style === "ember_flicker") {
    return (
      <div className="relative w-full h-full">
        <motion.div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(25 90% 50%/0.3)` }}
          animate={{
            borderColor: ["hsl(25 90% 50%/0.25)", "hsl(15 95% 55%/0.5)", "hsl(35 85% 50%/0.35)", "hsl(25 90% 50%/0.25)"],
            boxShadow: [
              `0 0 ${8 * glow}px hsl(25 90% 50%/0.1)`,
              `0 0 ${20 * glow}px hsl(15 95% 55%/0.25)`,
              `0 0 ${12 * glow}px hsl(35 85% 50%/0.15)`,
              `0 0 ${8 * glow}px hsl(25 90% 50%/0.1)`,
            ],
          }}
          transition={{ duration: dur * 0.8, repeat: Infinity, ease: "easeInOut" }} />
        {sparks.slice(0, 6).map(sp => (
          <motion.div key={sp.id} className="absolute rounded-full"
            style={{ width: 3, height: 3, background: "hsl(35 90% 60%)", boxShadow: "0 0 6px hsl(25 90% 55%)",
              ...(sp.side === 0 ? { top: frameInset, left: sp.pos } : sp.side === 1 ? { bottom: frameInset, left: sp.pos }
                : sp.side === 2 ? { left: frameInset, top: sp.pos } : { right: frameInset, top: sp.pos }) }}
            animate={{ opacity: [0, 0.8, 0], y: sp.side < 2 ? [0, -8, 0] : undefined, x: sp.side >= 2 ? [0, -6, 0] : undefined }}
            transition={{ duration: 1.2, repeat: Infinity, delay: sp.delay, repeatDelay: 1 }} />
        ))}
      </div>
    );
  }

  /* ── Audio Reactive (default) ── */
  return (
    <div className="relative w-full h-full">
      <div className="absolute" style={{ inset: frameInset, borderRadius: r, border: `${thickness}px solid hsl(${c1}/0.2)` }} />
      {/* Simulated audio bars on each edge */}
      {Array.from({ length: 8 }).map((_, i) => {
        const edge = i < 2 ? "top" : i < 4 ? "bottom" : i < 6 ? "left" : "right";
        const isHoriz = edge === "top" || edge === "bottom";
        const pos = `${20 + (i * 10) % 60}%`;
        return (
          <motion.div key={i} className="absolute rounded-sm"
            style={{
              background: `hsl(${c1}/0.6)`, boxShadow: `0 0 4px hsl(${c1}/0.3)`,
              ...(isHoriz ? { width: 3, [edge]: frameInset - 4, left: pos }
                : { height: 3, [edge]: frameInset - 4, top: pos }),
            }}
            animate={isHoriz ? { height: [4, 12, 6, 14, 4] } : { width: [4, 12, 6, 14, 4] }}
            transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }} />
        );
      })}
    </div>
  );
};

export default WebcamFramePreview;
