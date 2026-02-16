import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultAnimatedBgSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

interface Particle { id: number; x: number; y: number; size: number; delay: number; duration: number; }

const AnimatedBgRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultAnimatedBgSettings);
  const [connected, setConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultAnimatedBgSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`animated_bg-${publicToken}`)
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`bg-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultAnimatedBgSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  // Canvas-based grid and wave rendering
  useEffect(() => {
    if (settings.bg_type !== "grid" && settings.bg_type !== "waves") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let animFrame: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01 * (settings.animation_speed || 1);

      if (settings.bg_type === "grid") {
        const gridSize = settings.grid_size || 40;
        ctx.strokeStyle = `hsla(${settings.color_1}, ${settings.opacity * 0.3})`;
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += gridSize) {
          const offset = Math.sin(t + x * 0.01) * 5;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + offset, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          const offset = Math.cos(t + y * 0.01) * 5;
          ctx.beginPath();
          ctx.moveTo(0, y + offset);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        // Intersection dots
        ctx.fillStyle = `hsla(${settings.color_2}, ${settings.opacity * 0.5})`;
        for (let x = 0; x < canvas.width; x += gridSize) {
          for (let y = 0; y < canvas.height; y += gridSize) {
            const pulse = Math.sin(t * 2 + x * 0.05 + y * 0.05) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + pulse * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (settings.bg_type === "waves") {
        const amp = settings.wave_amplitude || 20;
        for (let layer = 0; layer < 3; layer++) {
          const colors = [settings.color_1, settings.color_2, settings.color_3];
          ctx.beginPath();
          ctx.fillStyle = `hsla(${colors[layer]}, ${settings.opacity * 0.2})`;
          const baseY = canvas.height * (0.4 + layer * 0.15);
          ctx.moveTo(0, canvas.height);
          for (let x = 0; x <= canvas.width; x += 2) {
            const y = baseY + Math.sin(x * 0.005 + t * (1 + layer * 0.3)) * amp * (1 + layer * 0.5)
              + Math.cos(x * 0.003 + t * 0.7) * amp * 0.5;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fill();
        }
      }

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [settings]);

  // Generate particles
  const particles: Particle[] = settings.bg_type === "particles"
    ? Array.from({ length: settings.particle_count || 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (settings.particle_size || 3) + 1,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 20,
      }))
    : [];

  const c1 = settings.color_1 || "280 100% 65%";
  const c2 = settings.color_2 || "200 100% 55%";
  const c3 = settings.color_3 || "160 100% 45%";
  const speed = settings.animation_speed || 1;

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: settings.dark_bg ? "#000" : "transparent" }}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20 z-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      {/* Gradient type */}
      {settings.bg_type === "gradient" && (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: settings.opacity,
            filter: settings.blur_amount ? `blur(${settings.blur_amount}px)` : undefined,
          }}
          animate={{
            background: [
              `linear-gradient(0deg, hsl(${c1} / 0.6), hsl(${c2} / 0.3), hsl(${c3} / 0.6))`,
              `linear-gradient(120deg, hsl(${c2} / 0.6), hsl(${c3} / 0.3), hsl(${c1} / 0.6))`,
              `linear-gradient(240deg, hsl(${c3} / 0.6), hsl(${c1} / 0.3), hsl(${c2} / 0.6))`,
              `linear-gradient(360deg, hsl(${c1} / 0.6), hsl(${c2} / 0.3), hsl(${c3} / 0.6))`,
            ],
          }}
          transition={{ duration: 8 / speed, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Aurora type */}
      {settings.bg_type === "aurora" && (
        <div className="absolute inset-0" style={{ opacity: settings.opacity }}>
          {[c1, c2, c3].map((color, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: "150%", height: "60%",
                background: `radial-gradient(ellipse, hsl(${color} / 0.3), transparent 60%)`,
                filter: "blur(60px)",
                left: "-25%",
              }}
              animate={{
                top: [`${20 + i * 10}%`, `${30 + i * 10}%`, `${20 + i * 10}%`],
                x: ["-10%", "10%", "-10%"],
                scaleX: [1, 1.2, 1],
              }}
              transition={{ duration: (6 + i * 2) / speed, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}

      {/* Particles type */}
      {settings.bg_type === "particles" && (
        <div className="absolute inset-0" style={{ opacity: settings.opacity }}>
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size, height: p.size,
                left: `${p.x}%`, top: `${p.y}%`,
                background: `hsl(${[c1, c2, c3][p.id % 3]})`,
                boxShadow: `0 0 ${p.size * 3}px hsl(${[c1, c2, c3][p.id % 3]} / 0.5)`,
              }}
              animate={{
                y: [0, -30, 0, 20, 0],
                x: [0, 15, -10, 5, 0],
                opacity: [0.3, 0.8, 0.5, 0.9, 0.3],
              }}
              transition={{ duration: p.duration / speed, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}

      {/* Canvas-based (grid, waves) */}
      {(settings.bg_type === "grid" || settings.bg_type === "waves") && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      
    </div>
  );
};

export default AnimatedBgRenderer;
