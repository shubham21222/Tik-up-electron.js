import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

const defaults = {
  border_style: "neon_pulse",
  border_thickness: 4,
  animation_speed: 1,
  glow_intensity: 60,
  color_1: "180 100% 50%",
  color_2: "280 100% 65%",
  corner_radius: 16,
  transparent_bg: true,
  custom_css: "",
};

/* ─── Particle ─── */
const P = ({ d, x, y, c }: { d: number; x: string; y: string; c: string }) => (
  <motion.div className="absolute rounded-full" style={{ width: 4, height: 4, left: x, top: y, background: `hsl(${c})`, boxShadow: `0 0 8px hsl(${c})` }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: d, ease: "easeInOut" }} />
);

const StreamBorderRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [s, setS] = useState(defaults);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setS(applyUrlOverrides({ ...defaults, ...(data as any).settings }) as typeof defaults); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`border-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setS({ ...defaults, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [publicToken]);

  const t = s.border_thickness;
  const dur = 3 / s.animation_speed;
  const g = s.glow_intensity / 100;
  const r = s.corner_radius;
  const c1 = s.color_1;
  const c2 = s.color_2;

  const wrap = `w-screen h-screen overflow-hidden ${s.transparent_bg ? "bg-transparent" : "bg-black"}`;

  /* ── Neon Pulse ── */
  if (s.border_style === "neon_pulse") return (
    <div className={wrap}>
      <motion.div className="absolute inset-0" style={{ border: `${t}px solid hsl(${c1} / 0.6)`, borderRadius: r }}
        animate={{
          boxShadow: [
            `inset 0 0 ${15*g}px hsl(${c1}/0.1), 0 0 ${20*g}px hsl(${c1}/0.2)`,
            `inset 0 0 ${40*g}px hsl(${c1}/0.25), 0 0 ${60*g}px hsl(${c1}/0.4)`,
            `inset 0 0 ${15*g}px hsl(${c1}/0.1), 0 0 ${20*g}px hsl(${c1}/0.2)`,
          ],
          borderColor: [`hsl(${c1}/0.5)`, `hsl(${c2}/0.7)`, `hsl(${c1}/0.5)`],
        }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Gold Metallic ── */
  if (s.border_style === "gold_metallic") return (
    <div className={wrap}>
      <motion.div className="absolute inset-0" style={{ border: `${t}px solid hsl(45 80% 55%/0.7)`, borderRadius: r,
        boxShadow: `inset 0 0 20px hsl(45 80% 55%/0.1), 0 0 30px hsl(45 80% 55%/0.15)` }}
        animate={{ borderColor: ["hsl(45 80% 55%/0.6)", "hsl(38 90% 65%/0.9)", "hsl(50 70% 50%/0.7)", "hsl(45 80% 55%/0.6)"] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.8),transparent)", width: "40%", borderRadius: r }}
        animate={{ left: ["-20%", "120%"] }} transition={{ duration: dur*2.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,hsl(45 90% 70%/0.6),transparent)", width: "30%", borderRadius: r }}
        animate={{ right: ["-20%", "120%"] }} transition={{ duration: dur*3, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Glitch Digital ── */
  if (s.border_style === "glitch_digital") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(${c1}/0.3)`, borderRadius: r }} />
      {[0,1,2,3].map(i => (
        <motion.div key={i} className="absolute" style={{ height: 2, width: `${15+i*12}%`, background: `hsl(${i%2===0?c1:c2}/0.7)`,
          top: `${10+i*22}%`, left: 0, boxShadow: `0 0 10px hsl(${c1}/0.4)` }}
          animate={{ opacity: [0,1,0], x: [0,6,-4,0], scaleX: [1,1.08,0.95,1] }}
          transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 1.2+i*0.5 }} />
      ))}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Electric Spark ── */
  if (s.border_style === "electric_spark") {
    const sparks = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
      id: i, side: i % 4, pos: `${10+(i*8)%80}%`, delay: i * 0.35,
    })), []);
    return (
      <div className={wrap}>
        <div className="absolute inset-0" style={{ border: `${t}px solid hsl(210 100% 70%/0.25)`, borderRadius: r }} />
        {sparks.map(sp => (
          <motion.div key={sp.id} className="absolute rounded-full" style={{
            width: 5, height: 5, background: "hsl(210 100% 80%)",
            boxShadow: "0 0 10px hsl(210 100% 70%), 0 0 20px hsl(210 100% 60%/0.5)",
            ...(sp.side===0?{top:0,left:sp.pos}:sp.side===1?{bottom:0,left:sp.pos}:sp.side===2?{left:0,top:sp.pos}:{right:0,top:sp.pos}),
          }} animate={{ opacity: [0,1,0.4,1,0], scale: [0.5,1.8,0.8,1.5,0.5] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1.8, delay: sp.delay }} />
        ))}
        {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
      </div>
    );
  }

  /* ── Liquid Flow ── */
  if (s.border_style === "liquid_flow") return (
    <div className={wrap}>
      <motion.div className="absolute inset-0"
        style={{
          background: `linear-gradient(var(--angle,0deg),hsl(${c2}/0.6),hsl(${c1}/0.6),hsl(280 100% 65%/0.6))`,
          padding: t, borderRadius: r,
          WebkitMask: "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor", maskComposite: "exclude",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: dur*4, repeat: Infinity, ease: "linear" }}>
        <div className="w-full h-full" style={{ borderRadius: r - t }} />
      </motion.div>
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Holographic Grid ── */
  if (s.border_style === "holographic_grid") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(180 100% 60%/0.2)`, borderRadius: r }} />
      <motion.div className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,hsl(180 100% 70%/0.6),hsl(300 100% 70%/0.4),transparent)" }}
        animate={{ top: ["0px", "100%"] }}
        transition={{ duration: dur*2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
      <motion.div className="absolute top-0 bottom-0 w-[2px]"
        style={{ background: "linear-gradient(180deg,transparent,hsl(300 100% 70%/0.5),hsl(180 100% 70%/0.3),transparent)" }}
        animate={{ left: ["0px", "100%"] }}
        transition={{ duration: dur*3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Particles Glow ── */
  if (s.border_style === "particles_glow") {
    const pts = useMemo(() => Array.from({ length: 20 }, (_, i) => {
      const edge = i % 4;
      return { id: i, delay: i * 0.25,
        x: edge === 0 ? `${(i*5)%90+5}%` : edge === 1 ? `${(i*7)%90+5}%` : edge === 2 ? "1%" : "98%",
        y: edge === 0 ? "1%" : edge === 1 ? "98%" : `${(i*9)%80+10}%`,
        c: i % 3 === 0 ? "45 90% 60%" : i % 3 === 1 ? "0 0% 80%" : "45 70% 50%",
      };
    }), []);
    return (
      <div className={wrap}>
        <div className="absolute inset-0" style={{ border: `${t}px solid hsl(45 70% 55%/0.15)`, borderRadius: r }} />
        {pts.map(p => <P key={p.id} d={p.delay} x={p.x} y={p.y} c={p.c} />)}
        {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
      </div>
    );
  }

  /* ── Retro Wave ── */
  if (s.border_style === "retro_wave") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(280 100% 60%/0.35)`, borderRadius: r }} />
      <motion.div className="absolute top-0 left-0 right-0 h-4"
        style={{ background: "linear-gradient(90deg,hsl(350 90% 55%/0.4),hsl(45 100% 55%/0.3),hsl(280 100% 60%/0.4))", borderRadius: `${r}px ${r}px 0 0` }}
        animate={{ opacity: [0.3,0.8,0.3] }} transition={{ duration: dur, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-4"
        style={{ background: "linear-gradient(90deg,hsl(280 100% 60%/0.4),hsl(45 100% 55%/0.3),hsl(350 90% 55%/0.4))", borderRadius: `0 0 ${r}px ${r}px` }}
        animate={{ opacity: [0.3,0.8,0.3] }} transition={{ duration: dur, repeat: Infinity, delay: 0.5 }} />
      <motion.div className="absolute top-0 h-full w-[25%]"
        style={{ background: "linear-gradient(90deg,transparent,hsl(280 100% 70%/0.12),transparent)" }}
        animate={{ left: ["-25%", "125%"] }} transition={{ duration: dur*2.5, repeat: Infinity, ease: "easeInOut" }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Firefly Trail ── */
  if (s.border_style === "firefly_trail") {
    const flies = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ id: i, delay: i * 0.5 })), []);
    return (
      <div className={wrap}>
        <div className="absolute inset-0" style={{ border: `${t}px solid hsl(35 80% 55%/0.12)`, borderRadius: r }} />
        {flies.map(f => {
          const edge = f.id % 4;
          return (
            <motion.div key={f.id} className="absolute rounded-full"
              style={{ width: 6, height: 6, background: "hsl(40 90% 60%)",
                boxShadow: "0 0 12px hsl(40 90% 60%), 0 0 25px hsl(35 80% 50%/0.5)" }}
              animate={
                edge === 0 ? { left: ["2%", "98%"], top: ["0px", "0px"] }
                : edge === 1 ? { left: ["98%", "2%"], bottom: ["0px", "0px"], top: "auto" }
                : edge === 2 ? { top: ["5%", "95%"], left: ["0px", "0px"] }
                : { top: ["95%", "5%"], right: ["0px", "0px"], left: "auto" }
              }
              transition={{ duration: dur * 2.5, repeat: Infinity, repeatType: "reverse", delay: f.delay, ease: "easeInOut" }} />
          );
        })}
        {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
      </div>
    );
  }

  /* ── COD Tactical ── */
  if (s.border_style === "cod_tactical") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(120 60% 30%/0.5)`, borderRadius: r }} />
      <motion.div className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,hsl(120 100% 60%/0.5),transparent)" }}
        animate={{ top: ["0px", "100%"] }}
        transition={{ duration: dur*2, repeat: Infinity, ease: "linear" }} />
      {[0,1,2].map(i => (
        <motion.div key={i} className="absolute"
          style={{ left: 0, height: 2, width: `${30+i*15}%`, top: `${20+i*25}%`, background: "hsl(120 80% 45%/0.3)" }}
          animate={{ opacity: [0,0.8,0], scaleX: [0.95,1.02,0.95] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2+i*0.7 }} />
      ))}
      {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
        <motion.div key={i} className="absolute" style={{ ...pos, width: 16, height: 16,
          borderTop: pos.top!==undefined&&pos.top===0 ? "2px solid hsl(120 80% 45%/0.6)" : "none",
          borderBottom: pos.bottom!==undefined ? "2px solid hsl(120 80% 45%/0.6)" : "none",
          borderLeft: pos.left!==undefined&&pos.left===0 ? "2px solid hsl(120 80% 45%/0.6)" : "none",
          borderRight: pos.right!==undefined ? "2px solid hsl(120 80% 45%/0.6)" : "none",
        }} animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.3 }} />
      ))}
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Fortnite Victory ── */
  if (s.border_style === "fortnite_victory") return (
    <div className={wrap}>
      <motion.div className="absolute inset-0"
        style={{ border: `${t}px solid hsl(260 100% 65%/0.5)`, borderRadius: r }}
        animate={{
          boxShadow: [`0 0 ${15*g}px hsl(190 100% 60%/0.2)`, `0 0 ${35*g}px hsl(190 100% 60%/0.4)`, `0 0 ${15*g}px hsl(190 100% 60%/0.2)`],
          borderColor: ["hsl(260 100% 65%/0.5)", "hsl(190 100% 60%/0.7)", "hsl(50 100% 55%/0.6)", "hsl(260 100% 65%/0.5)"],
        }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-[5%] rounded-full"
        style={{ border: "1px solid hsl(190 100% 70%/0.15)" }}
        animate={{ scale: [1,1.02,1], opacity: [0.3,0.6,0.3] }}
        transition={{ duration: dur, repeat: Infinity }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Arch Raider ── */
  if (s.border_style === "arch_raider") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(145 60% 35%/0.4)`, borderRadius: r }} />
      {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
        <motion.div key={i} className="absolute w-5 h-5"
          style={{ ...pos, background: `radial-gradient(circle, hsl(35 90% 55%/0.6), transparent)` }}
          animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: i*0.5 }} />
      ))}
      <motion.div className="absolute top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,transparent,hsl(35 90% 55%/0.7),hsl(170 80% 45%/0.5),transparent)", width: "30%", borderRadius: r }}
        animate={{ left: ["-10%", "110%"] }}
        transition={{ duration: dur*2, repeat: Infinity, ease: "easeInOut" }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Battle Royale Pro ── */
  if (s.border_style === "battle_royale_pro") return (
    <div className={wrap}>
      <motion.div className="absolute inset-0"
        style={{ border: `${t}px solid hsl(0 80% 50%/0.4)`, borderRadius: r }}
        animate={{
          borderColor: ["hsl(0 80% 50%/0.4)", "hsl(210 100% 55%/0.6)", "hsl(0 80% 50%/0.4)"],
          boxShadow: [`0 0 ${10*g}px hsl(0 80% 50%/0.1)`, `0 0 ${25*g}px hsl(210 100% 55%/0.3)`, `0 0 ${10*g}px hsl(0 80% 50%/0.1)`],
        }}
        transition={{ duration: dur, repeat: Infinity }} />
      <motion.div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,hsl(0 80% 55%/0.6),hsl(210 100% 55%/0.4),hsl(0 80% 55%/0.6))", borderRadius: `${r}px ${r}px 0 0` }}
        animate={{ opacity: [0.3,0.9,0.3] }}
        transition={{ duration: dur*0.7, repeat: Infinity }} />
      <motion.div className="absolute inset-0" style={{ borderRadius: r }}
        animate={{ opacity: [0,0.12,0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}>
        <div className="w-full h-full" style={{ background: "hsl(0 80% 55%)", borderRadius: r }} />
      </motion.div>
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Space Fighter ── */
  if (s.border_style === "space_fighter") return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(220 80% 40%/0.3)`, borderRadius: r }} />
      <motion.div className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,hsl(200 100% 70%/0.5),transparent)" }}
        animate={{ top: ["0px", "100%"] }}
        transition={{ duration: dur*3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
      {[0,1,2,3,4,5,6,7].map(i => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: "white", left: `${8+i*12}%`, top: `${5+(i*19)%85}%`, boxShadow: "0 0 6px white" }}
          animate={{ opacity: [0,1,0], scale: [0.5,1.5,0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i*0.35 }} />
      ))}
      <motion.div className="absolute inset-[10%] rounded-full border border-red-500/20"
        animate={{ scale: [0.95,1.05,0.95], opacity: [0.1,0.3,0.1] }}
        transition={{ duration: dur*2, repeat: Infinity }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );

  /* ── Pulse Circuit (default) ── */
  return (
    <div className={wrap}>
      <div className="absolute inset-0" style={{ border: `${t}px solid hsl(210 100% 60%/0.15)`, borderRadius: r }} />
      <motion.div className="absolute top-0 left-0 h-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)", borderRadius: `${r}px 0 0 0` }}
        animate={{ width: ["0%", "100%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-0 right-0 w-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "100%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.4 }} />
      <motion.div className="absolute bottom-0 right-0 h-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)", borderRadius: `0 0 ${r}px 0` }}
        animate={{ width: ["0%", "100%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*0.8 }} />
      <motion.div className="absolute bottom-0 left-0 w-[3px]" style={{ background: "hsl(210 100% 70%)", boxShadow: "0 0 10px hsl(210 100% 60%)" }}
        animate={{ height: ["0%", "100%", "0%"], opacity: [0,1,0] }}
        transition={{ duration: dur*1.5, repeat: Infinity, ease: "easeInOut", delay: dur*1.2 }} />
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );
};

export default StreamBorderRenderer;
