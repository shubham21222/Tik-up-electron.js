import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const defaults = {
  frame_style: "neon_cyber",
  frame_thickness: 4,
  frame_size: 300,
  animation_speed: 1,
  glow_intensity: 60,
  color_1: "180 100% 50%",
  color_2: "280 100% 65%",
  corner_radius: 12,
  transparent_bg: true,
  custom_css: "",
};

const P = ({ d, x, y, c, style: st }: { d: number; x: number; y: number; c: string; style?: React.CSSProperties }) => (
  <motion.div className="absolute rounded-full" style={{ width: 4, height: 4, left: x, top: y, background: `hsl(${c})`, boxShadow: `0 0 8px hsl(${c})`, ...st }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: d, ease: "easeInOut" }} />
);

const WebcamFrameRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [s, setS] = useState(defaults);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setS({ ...defaults, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`webcam-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setS({ ...defaults, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [publicToken]);

  const t = s.frame_thickness;
  const dur = 3 / s.animation_speed;
  const g = s.glow_intensity / 100;
  const r = s.corner_radius;
  const c1 = s.color_1;
  const c2 = s.color_2;
  const size = s.frame_size;

  const sparks = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i, side: i % 4, pos: `${10 + (i * 8) % 80}%`, delay: i * 0.3,
  })), []);

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const edge = i % 4;
    return { id: i, delay: i * 0.2, edge,
      x: edge === 0 ? (i * 15) % (size - 20) + 10 : edge === 1 ? (i * 17) % (size - 20) + 10 : edge === 2 ? 0 : size - 4,
      y: edge === 0 ? 0 : edge === 1 ? size - 4 : (i * 13) % (size - 20) + 10,
      c: i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : "45 90% 60%",
    };
  }), [c1, c2, size]);

  const wrap = `w-screen h-screen overflow-hidden flex items-start justify-center pt-0 ${s.transparent_bg ? "bg-transparent" : "bg-black"}`;

  const frameStyle: React.CSSProperties = { width: size, height: size, position: "relative" };

  /* ── Neon Cyber Rim ── */
  if (s.frame_style === "neon_cyber") {
    const cs = 18;
    return (
      <div className={wrap}><div style={frameStyle}>
        <motion.div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(${c1}/0.6)` }}
          animate={{
            boxShadow: [`inset 0 0 ${10*g}px hsl(${c1}/0.1), 0 0 ${15*g}px hsl(${c1}/0.2)`, `inset 0 0 ${25*g}px hsl(${c1}/0.2), 0 0 ${40*g}px hsl(${c1}/0.4)`, `inset 0 0 ${10*g}px hsl(${c1}/0.1), 0 0 ${15*g}px hsl(${c1}/0.2)`],
            borderColor: [`hsl(${c1}/0.5)`, `hsl(${c2}/0.7)`, `hsl(${c1}/0.5)`],
          }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }} />
        {[{ top: 0, left: 0, bT: true, bL: true }, { top: 0, right: 0, bT: true, bR: true },
          { bottom: 0, left: 0, bB: true, bL: true }, { bottom: 0, right: 0, bB: true, bR: true }].map((pos, i) => (
          <motion.div key={i} className="absolute" style={{ ...pos, width: cs, height: cs,
            borderTop: pos.bT ? `3px solid hsl(${c1})` : "none", borderBottom: pos.bB ? `3px solid hsl(${c1})` : "none",
            borderLeft: pos.bL ? `3px solid hsl(${c1})` : "none", borderRight: pos.bR ? `3px solid hsl(${c1})` : "none",
            boxShadow: `0 0 ${8*g}px hsl(${c1}/0.4)` }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
        ))}
        {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
      </div></div>
    );
  }

  /* ── Golden Luxe ── */
  if (s.frame_style === "golden_luxe") return (
    <div className={wrap}><div style={frameStyle}>
      <motion.div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(45 80% 55%/0.7)`,
        boxShadow: `inset 0 0 15px hsl(45 80% 55%/0.08), 0 0 25px hsl(45 80% 55%/0.12)` }}
        animate={{ borderColor: ["hsl(45 80% 55%/0.6)", "hsl(38 90% 65%/0.9)", "hsl(50 70% 50%/0.7)", "hsl(45 80% 55%/0.6)"] }}
        transition={{ duration: dur * 1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-0 left-0 h-[3px]" style={{ width: "40%", background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.8),transparent)" }}
        animate={{ left: ["0%", "60%"] }} transition={{ duration: dur * 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-0 right-0 h-[3px]" style={{ width: "30%", background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.6),transparent)" }}
        animate={{ right: ["0%", "70%"] }} transition={{ duration: dur * 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Digital Pulse ── */
  if (s.frame_style === "digital_pulse") return (
    <div className={wrap}><div style={frameStyle}>
      <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(${c1}/0.25)` }} />
      {[0,1,2,3].map(i => (
        <motion.div key={i} className="absolute" style={{
          height: i < 2 ? 2 : "25%", width: i < 2 ? "25%" : 2,
          background: `hsl(${i%2===0?c1:c2}/0.7)`, boxShadow: `0 0 10px hsl(${c1}/0.4)`,
          ...(i===0?{top:0,left:0}:i===1?{bottom:0,right:0}:i===2?{top:0,right:0}:{bottom:0,left:0}),
        }} animate={{ opacity: [0,1,0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5+i*0.4 }} />
      ))}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Particle Aura ── */
  if (s.frame_style === "particle_aura") return (
    <div className={wrap}><div style={frameStyle}>
      <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(${c1}/0.1)` }} />
      {particles.map(p => <P key={p.id} d={p.delay} x={p.x} y={p.y} c={p.c} />)}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Circuit Flow ── */
  if (s.frame_style === "circuit_flow") return (
    <div className={wrap}><div style={frameStyle}>
      <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(210 100% 60%/0.12)` }} />
      <motion.div className="absolute top-0 left-0 h-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ width: ["0%", "100%", "0%"], opacity: [0,1,0] }} transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-0 right-0 w-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "100%", "0%"], opacity: [0,1,0] }} transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.35 }} />
      <motion.div className="absolute bottom-0 right-0 h-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ width: ["0%", "100%", "0%"], opacity: [0,1,0] }} transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.7 }} />
      <motion.div className="absolute bottom-0 left-0 w-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "100%", "0%"], opacity: [0,1,0] }} transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*1.05 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Electro Corners ── */
  if (s.frame_style === "electro_corners") {
    const cs = 24;
    return (
      <div className={wrap}><div style={frameStyle}>
        <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(${c1}/0.08)` }} />
        {[{ top: 0, left: 0, bT: true, bL: true }, { top: 0, right: 0, bT: true, bR: true },
          { bottom: 0, left: 0, bB: true, bL: true }, { bottom: 0, right: 0, bB: true, bR: true }].map((pos, i) => (
          <motion.div key={i} className="absolute" style={{ ...pos, width: cs, height: cs,
            borderTop: pos.bT ? `3px solid hsl(${c1})` : "none", borderBottom: pos.bB ? `3px solid hsl(${c1})` : "none",
            borderLeft: pos.bL ? `3px solid hsl(${c1})` : "none", borderRight: pos.bR ? `3px solid hsl(${c1})` : "none",
            boxShadow: `0 0 ${12*g}px hsl(${c1}/0.4)` }}
            animate={{ boxShadow: [`0 0 ${8*g}px hsl(${c1}/0.2)`, `0 0 ${25*g}px hsl(${c1}/0.6)`, `0 0 ${8*g}px hsl(${c1}/0.2)`] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }} />
        ))}
        {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
      </div></div>
    );
  }

  /* ── Liquid Glow ── */
  if (s.frame_style === "liquid_glow") return (
    <div className={wrap}><div style={frameStyle} className="overflow-hidden">
      <motion.div className="absolute inset-0" style={{
        borderRadius: r, background: `linear-gradient(var(--angle,0deg),hsl(${c2}/0.6),hsl(${c1}/0.6),hsl(280 100% 65%/0.6))`,
        padding: t, WebkitMask: "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor", maskComposite: "exclude" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: dur * 4, repeat: Infinity, ease: "linear" }}>
        <div className="w-full h-full" style={{ borderRadius: r - t }} />
      </motion.div>
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Holographic Shift ── */
  if (s.frame_style === "holographic_shift") return (
    <div className={wrap}><div style={frameStyle}>
      <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(180 100% 60%/0.18)` }} />
      <motion.div className="absolute left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,hsl(180 100% 70%/0.6),hsl(300 100% 70%/0.4),transparent)" }}
        animate={{ top: ["0px", `${size}px`] }} transition={{ duration: dur * 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
      <motion.div className="absolute top-0 bottom-0 w-[2px]" style={{ background: "linear-gradient(180deg,transparent,hsl(300 100% 70%/0.5),hsl(180 100% 70%/0.3),transparent)" }}
        animate={{ left: ["0px", `${size}px`] }} transition={{ duration: dur * 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Ember Flicker ── */
  if (s.frame_style === "ember_flicker") return (
    <div className={wrap}><div style={frameStyle}>
      <motion.div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(25 90% 50%/0.3)` }}
        animate={{
          borderColor: ["hsl(25 90% 50%/0.25)", "hsl(15 95% 55%/0.5)", "hsl(35 85% 50%/0.35)", "hsl(25 90% 50%/0.25)"],
          boxShadow: [`0 0 ${8*g}px hsl(25 90% 50%/0.1)`, `0 0 ${22*g}px hsl(15 95% 55%/0.25)`, `0 0 ${12*g}px hsl(35 85% 50%/0.15)`, `0 0 ${8*g}px hsl(25 90% 50%/0.1)`],
        }} transition={{ duration: dur * 0.8, repeat: Infinity, ease: "easeInOut" }} />
      {sparks.slice(0, 8).map(sp => (
        <motion.div key={sp.id} className="absolute rounded-full" style={{ width: 4, height: 4, background: "hsl(35 90% 60%)", boxShadow: "0 0 8px hsl(25 90% 55%)",
          ...(sp.side===0?{top:0,left:sp.pos}:sp.side===1?{bottom:0,left:sp.pos}:sp.side===2?{left:0,top:sp.pos}:{right:0,top:sp.pos}) }}
          animate={{ opacity: [0,0.8,0], y: sp.side<2?[0,-10,0]:undefined, x: sp.side>=2?[0,-8,0]:undefined }}
          transition={{ duration: 1.2, repeat: Infinity, delay: sp.delay, repeatDelay: 1 }} />
      ))}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );

  /* ── Audio Reactive (default) ── */
  return (
    <div className={wrap}><div style={frameStyle}>
      <div className="absolute inset-0" style={{ borderRadius: r, border: `${t}px solid hsl(${c1}/0.15)` }} />
      {Array.from({ length: 16 }).map((_, i) => {
        const edge = i < 4 ? "top" : i < 8 ? "bottom" : i < 12 ? "left" : "right";
        const isH = edge === "top" || edge === "bottom";
        const offset = 15 + ((i % 4) * 20);
        return (
          <motion.div key={i} className="absolute rounded-sm" style={{
            background: `hsl(${c1}/0.6)`, boxShadow: `0 0 6px hsl(${c1}/0.3)`,
            ...(isH ? { width: 3, [edge]: -4, left: `${offset}%` } : { height: 3, [edge]: -4, top: `${offset}%` }),
          }}
            animate={isH ? { height: [4, 16, 8, 18, 4] } : { width: [4, 16, 8, 18, 4] }}
            transition={{ duration: 0.7 + (i % 4) * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }} />
        );
      })}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div></div>
  );
};

export default WebcamFrameRenderer;
