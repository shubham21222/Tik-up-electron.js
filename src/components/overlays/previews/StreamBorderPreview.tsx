import { motion } from "framer-motion";
import { useMemo } from "react";

interface StreamBorderPreviewProps {
  settings?: Record<string, any>;
}

const Particle = ({ delay, x, y, color }: { delay: number; x: string; y: string; color: string }) => (
  <motion.div
    className="absolute rounded-full"
    style={{ width: 3, height: 3, left: x, top: y, background: `hsl(${color})`, boxShadow: `0 0 6px hsl(${color})` }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
    transition={{ duration: 2.5, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const StreamBorderPreview = ({ settings = {} }: StreamBorderPreviewProps) => {
  const style = settings.border_style || "neon_pulse";
  const thickness = settings.border_thickness || 3;
  const speed = settings.animation_speed || 1;
  const intensity = (settings.glow_intensity || 60) / 100;
  const accent1 = settings.color_1 || "180 100% 50%";
  const accent2 = settings.color_2 || "280 100% 65%";
  const dur = 3 / speed;

  // All hooks at top level
  const sparks = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, side: i % 4, pos: `${15 + (i * 11) % 70}%`, delay: i * 0.4,
  })), []);

  const glowParticles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: `${5 + (i * 7) % 90}%`,
    y: i < 4 ? "4%" : i < 8 ? "94%" : `${20 + i * 7}%`,
    delay: i * 0.3,
    color: i % 2 === 0 ? "45 90% 60%" : "0 0% 75%",
  })), []);

  const fireflies = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i, delay: i * 0.6,
  })), []);

  if (style === "neon_pulse") {
    return (
      <div className="relative w-full h-full">
        <motion.div className="absolute inset-2 rounded-xl"
          style={{ border: `${thickness}px solid hsl(${accent1} / 0.6)` }}
          animate={{
            boxShadow: [
              `inset 0 0 ${10*intensity}px hsl(${accent1}/0.1), 0 0 ${15*intensity}px hsl(${accent1}/0.2)`,
              `inset 0 0 ${25*intensity}px hsl(${accent1}/0.2), 0 0 ${40*intensity}px hsl(${accent1}/0.4)`,
              `inset 0 0 ${10*intensity}px hsl(${accent1}/0.1), 0 0 ${15*intensity}px hsl(${accent1}/0.2)`,
            ],
            borderColor: [`hsl(${accent1}/0.5)`, `hsl(${accent2}/0.7)`, `hsl(${accent1}/0.5)`],
          }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    );
  }

  if (style === "gold_metallic") {
    return (
      <div className="relative w-full h-full">
        <motion.div className="absolute inset-2 rounded-lg"
          style={{ border: `${thickness}px solid hsl(45 80% 55%/0.7)`, boxShadow: "inset 0 0 15px hsl(45 80% 55%/0.1), 0 0 20px hsl(45 80% 55%/0.15)" }}
          animate={{ borderColor: ["hsl(45 80% 55%/0.6)", "hsl(38 90% 65%/0.9)", "hsl(50 70% 50%/0.7)", "hsl(45 80% 55%/0.6)"] }}
          transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-2 h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.8),transparent)", width: "40%" }}
          animate={{ left: ["-10%", "110%"] }} transition={{ duration: dur*2, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    );
  }

  if (style === "glitch_digital") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-lg" style={{ border: `${thickness}px solid hsl(${accent1}/0.4)` }} />
        {[0,1,2].map(i => (
          <motion.div key={i} className="absolute rounded-sm"
            style={{ height: 2, width: `${20+i*15}%`, background: `hsl(${i%2===0?accent1:accent2}/0.7)`, top: `${15+i*30}%`, left: 8, boxShadow: `0 0 8px hsl(${accent1}/0.4)` }}
            animate={{ opacity: [0,1,0], x: [0,4,-3,0], scaleX: [1,1.05,0.98,1] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5+i*0.7, ease: "easeInOut" }} />
        ))}
      </div>
    );
  }

  if (style === "electric_spark") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-xl" style={{ border: `${thickness}px solid hsl(210 100% 70%/0.3)` }} />
        {sparks.map(sp => (
          <motion.div key={sp.id} className="absolute rounded-full"
            style={{
              width: 4, height: 4, background: "hsl(210 100% 80%)",
              boxShadow: "0 0 8px hsl(210 100% 70%), 0 0 16px hsl(210 100% 60%/0.5)",
              ...(sp.side===0?{top:8,left:sp.pos}:sp.side===1?{bottom:8,left:sp.pos}:sp.side===2?{left:8,top:sp.pos}:{right:8,top:sp.pos}),
            }}
            animate={{ opacity: [0,1,0.5,1,0], scale: [0.5,1.5,0.8,1.3,0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2, delay: sp.delay }} />
        ))}
      </div>
    );
  }

  if (style === "liquid_flow") {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <motion.div className="absolute inset-1 rounded-2xl"
          style={{
            background: `linear-gradient(var(--angle,0deg),hsl(${accent2}/0.6),hsl(${accent1}/0.6),hsl(280 100% 65%/0.6))`,
            padding: thickness,
            WebkitMask: "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor", maskComposite: "exclude",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: dur*3, repeat: Infinity, ease: "linear" }}>
          <div className="w-full h-full rounded-2xl" />
        </motion.div>
      </div>
    );
  }

  if (style === "holographic_grid") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-lg" style={{ border: `${thickness}px solid hsl(180 100% 60%/0.25)` }} />
        <motion.div className="absolute left-2 right-2 h-[1px]"
          style={{ background: "linear-gradient(90deg,transparent,hsl(180 100% 70%/0.6),hsl(300 100% 70%/0.4),transparent)" }}
          animate={{ top: ["8px", "calc(100% - 8px)"] }}
          transition={{ duration: dur*2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
        <motion.div className="absolute top-2 bottom-2 w-[1px]"
          style={{ background: "linear-gradient(180deg,transparent,hsl(300 100% 70%/0.5),hsl(180 100% 70%/0.3),transparent)" }}
          animate={{ left: ["8px", "calc(100% - 8px)"] }}
          transition={{ duration: dur*2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }} />
      </div>
    );
  }

  if (style === "particles_glow") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-xl" style={{ border: `${thickness}px solid hsl(45 70% 55%/0.2)` }} />
        {glowParticles.map(p => <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} color={p.color} />)}
      </div>
    );
  }

  if (style === "retro_wave") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-lg" style={{ border: `${thickness}px solid hsl(280 100% 60%/0.4)` }} />
        <motion.div className="absolute top-0 left-0 right-0 h-3 rounded-t-lg"
          style={{ background: "linear-gradient(90deg,hsl(350 90% 55%/0.4),hsl(45 100% 55%/0.3),hsl(280 100% 60%/0.4))" }}
          animate={{ opacity: [0.4,0.8,0.4] }} transition={{ duration: dur, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 left-0 right-0 h-3 rounded-b-lg"
          style={{ background: "linear-gradient(90deg,hsl(280 100% 60%/0.4),hsl(45 100% 55%/0.3),hsl(350 90% 55%/0.4))" }}
          animate={{ opacity: [0.4,0.8,0.4] }} transition={{ duration: dur, repeat: Infinity, delay: 0.5 }} />
        <motion.div className="absolute top-0 h-full w-[30%]"
          style={{ background: "linear-gradient(90deg,transparent,hsl(280 100% 70%/0.15),transparent)" }}
          animate={{ left: ["-30%", "130%"] }} transition={{ duration: dur*2, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    );
  }

  if (style === "firefly_trail") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-2 rounded-xl" style={{ border: `${thickness}px solid hsl(35 80% 55%/0.15)` }} />
        {fireflies.map(f => {
          const isTop = f.id < 2;
          const isBottom = f.id >= 2 && f.id < 4;
          return (
            <motion.div key={f.id} className="absolute rounded-full"
              style={{ width: 5, height: 5, background: "hsl(40 90% 60%)", boxShadow: "0 0 10px hsl(40 90% 60%), 0 0 20px hsl(35 80% 50%/0.5)" }}
              animate={
                isTop ? { left: ["5%", "95%"], top: ["8px", "8px"] }
                : isBottom ? { left: ["95%", "5%"], bottom: ["8px", "8px"], top: "auto" }
                : f.id < 5 ? { top: ["10%", "90%"], left: ["8px", "8px"] }
                : { top: ["90%", "10%"], right: ["8px", "8px"], left: "auto" }
              }
              transition={{ duration: dur*2, repeat: Infinity, repeatType: "reverse", delay: f.delay, ease: "easeInOut" }} />
          );
        })}
      </div>
    );
  }

  // Pulse Circuit (default)
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-2 rounded-lg" style={{ border: `${thickness}px solid hsl(210 100% 60%/0.2)` }} />
      <motion.div className="absolute top-2 left-2 h-[2px] rounded-full"
        style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
        animate={{ width: ["0%", "96%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-2 right-2 w-[2px] rounded-full"
        style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "96%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.4 }} />
      <motion.div className="absolute bottom-2 right-2 h-[2px] rounded-full"
        style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
        animate={{ width: ["0%", "96%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.8 }} />
      <motion.div className="absolute bottom-2 left-2 w-[2px] rounded-full"
        style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 8px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "96%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*1.2 }} />
    </div>
  );
};

export default StreamBorderPreview;
