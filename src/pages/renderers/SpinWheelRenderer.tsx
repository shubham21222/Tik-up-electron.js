import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface Segment {
  label: string;
  color: string;
}

const DEFAULT_SEGMENTS: Segment[] = [
  { label: "10x Push-ups", color: "350 80% 50%" },
  { label: "15x Planks", color: "45 100% 50%" },
  { label: "Nothing!", color: "160 80% 40%" },
  { label: "5x Squats", color: "200 80% 50%" },
  { label: "1x Sit-ups", color: "280 70% 55%" },
  { label: "20x Jumping Jacks", color: "15 90% 50%" },
  { label: "Dance!", color: "320 80% 50%" },
  { label: "30s Wall Sit", color: "180 70% 45%" },
];

const defaultSettings = {
  segments: DEFAULT_SEGMENTS,
  spin_duration: 4,
  auto_spin: false,
  show_winner: true,
  winner_duration: 5,
  glow_intensity: 50,
  wheel_size: 400,
  transparent_bg: true,
  custom_css: "",
};

const SpinWheelRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultSettings);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const spinTimeoutRef = useRef<number | null>(null);

  const segments: Segment[] = settings.segments?.length > 0 ? settings.segments : DEFAULT_SEGMENTS;
  const segAngle = 360 / segments.length;

  // Load settings
  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultSettings, ...(data as any).settings }); });
  }, [publicToken]);

  const doSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    const extraSpins = 1440 + Math.random() * 1080;
    const newRotation = rotation + extraSpins;
    setRotation(newRotation);

    const dur = (settings.spin_duration || 4) * 1000;
    spinTimeoutRef.current = window.setTimeout(() => {
      const normalizedAngle = newRotation % 360;
      const idx = Math.floor(((360 - normalizedAngle + segAngle / 2) % 360) / segAngle) % segments.length;
      if (settings.show_winner) setWinner(segments[idx].label);
      setSpinning(false);
    }, dur);
  };

  // Subscribe to events
  useEffect(() => {
    if (!publicToken) return;

    const ch = supabase.channel(`spin-wheel-${publicToken}`)
      .on("broadcast", { event: "spin" }, () => doSpin())
      .on("broadcast", { event: "gift" }, () => doSpin())
      .on("broadcast", { event: "test_alert" }, () => doSpin())
      .subscribe(s => setConnected(s === "SUBSCRIBED"));

    const db = supabase.channel(`spin-wheel-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (p: any) => {
        if (p.new?.settings) setSettings({ ...defaultSettings, ...p.new.settings });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      supabase.removeChannel(db);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, [publicToken]);

  // Clear winner
  useEffect(() => {
    if (!winner) return;
    const t = setTimeout(() => setWinner(null), (settings.winner_duration || 5) * 1000);
    return () => clearTimeout(t);
  }, [winner, settings.winner_duration]);

  const size = settings.wheel_size || 400;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const glowInt = (settings.glow_intensity || 50) / 100;

  const getSegmentPath = (index: number) => {
    const startAngle = (index * segAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = segAngle > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
  };

  const getLabelPos = (index: number) => {
    const midAngle = ((index + 0.5) * segAngle - 90) * (Math.PI / 180);
    return {
      x: cx + (radius * 0.6) * Math.cos(midAngle),
      y: cy + (radius * 0.6) * Math.sin(midAngle),
      angle: (index + 0.5) * segAngle,
    };
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: size * 0.8, height: size * 0.8,
          borderRadius: "50%",
          background: `radial-gradient(circle, hsl(45 100% 55% / ${glowInt * 0.2}), transparent 70%)`,
        }} />
      </div>

      {/* Pointer */}
      <div className="relative z-10" style={{ marginBottom: -size * 0.03 }}>
        <svg width="36" height="28" viewBox="0 0 36 28">
          <polygon points="18,28 0,0 36,0" fill="hsl(45 100% 55%)" stroke="hsl(45 100% 35%)" strokeWidth="1.5" />
          <polygon points="18,22 5,2 31,2" fill="hsl(45 100% 65%)" />
        </svg>
      </div>

      {/* Wheel */}
      <motion.div
        className="relative z-0"
        animate={{ rotate: rotation }}
        transition={{ duration: settings.spin_duration || 4, ease: [0.12, 0.8, 0.3, 1] }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer glow ring */}
          <circle cx={cx} cy={cy} r={radius + 6} fill="none"
            stroke={`hsl(45 100% 55% / ${glowInt * 0.4})`} strokeWidth="3" />
          <circle cx={cx} cy={cy} r={radius + 3} fill="none"
            stroke={`hsl(45 100% 55% / ${glowInt * 0.15})`} strokeWidth="8" />

          {/* Segments */}
          {segments.map((seg, i) => (
            <path key={i} d={getSegmentPath(i)} fill={`hsl(${seg.color})`}
              stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
          ))}

          {/* Segment divider highlights */}
          {segments.map((_, i) => {
            const angle = (i * segAngle - 90) * (Math.PI / 180);
            return (
              <line key={`d-${i}`}
                x1={cx} y1={cy}
                x2={cx + radius * Math.cos(angle)}
                y2={cy + radius * Math.sin(angle)}
                stroke="rgba(255,255,255,0.1)" strokeWidth="1"
              />
            );
          })}

          {/* Labels */}
          {segments.map((seg, i) => {
            const pos = getLabelPos(i);
            const fontSize = Math.max(10, Math.min(16, size / segments.length / 3));
            return (
              <text
                key={`t-${i}`}
                x={pos.x} y={pos.y}
                fill="white" fontSize={fontSize} fontWeight="bold"
                textAnchor="middle" dominantBaseline="central"
                transform={`rotate(${pos.angle}, ${pos.x}, ${pos.y})`}
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)", fontFamily: "var(--font-heading, sans-serif)" }}
              >
                {seg.label.length > 14 ? seg.label.slice(0, 13) + "…" : seg.label}
              </text>
            );
          })}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={size * 0.06} fill="url(#hubGradR)" stroke="hsl(45 100% 35%)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={size * 0.025} fill="hsl(45 100% 65%)" />
          <defs>
            <radialGradient id="hubGradR">
              <stop offset="0%" stopColor="hsl(45 100% 70%)" />
              <stop offset="100%" stopColor="hsl(45 80% 30%)" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Pedestal */}
      <div style={{
        width: size * 0.3, height: size * 0.06, marginTop: -size * 0.01,
        borderRadius: "0 0 8px 8px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "none",
      }} />

      {/* Winner */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-6 px-6 py-3 rounded-2xl"
          style={{
            background: "hsl(45 100% 55% / 0.1)",
            border: "1px solid hsl(45 100% 55% / 0.25)",
            boxShadow: `0 0 30px hsl(45 100% 55% / ${glowInt * 0.15})`,
          }}
        >
          <p className="text-lg font-bold font-heading" style={{ color: "hsl(45 100% 65%)" }}>🎉 {winner}</p>
        </motion.div>
      )}

      {spinning && !winner && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="mt-6 text-sm text-white/40 font-medium"
        >
          Spinning...
        </motion.p>
      )}

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default SpinWheelRenderer;
