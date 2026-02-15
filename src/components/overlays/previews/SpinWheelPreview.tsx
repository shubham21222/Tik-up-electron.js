import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_SEGMENTS = [
  { label: "10x Push-ups", color: "350 80% 50%" },
  { label: "15x Planks", color: "45 100% 50%" },
  { label: "Nothing!", color: "160 80% 40%" },
  { label: "5x Squats", color: "200 80% 50%" },
  { label: "1x Sit-ups", color: "280 70% 55%" },
  { label: "20x Jumping Jacks", color: "15 90% 50%" },
  { label: "Dance!", color: "320 80% 50%" },
  { label: "30s Wall Sit", color: "180 70% 45%" },
];

const SpinWheelPreview = () => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const segments = DEFAULT_SEGMENTS;
  const segAngle = 360 / segments.length;

  // Auto-spin demo loop
  useEffect(() => {
    const spin = () => {
      if (spinning) return;
      setSpinning(true);
      setWinner(null);
      const extraSpins = 1440 + Math.random() * 720; // 4-6 full rotations
      const newRotation = rotation + extraSpins;
      setRotation(newRotation);

      setTimeout(() => {
        // Calculate winner
        const normalizedAngle = (newRotation % 360);
        const idx = Math.floor(((360 - normalizedAngle + segAngle / 2) % 360) / segAngle) % segments.length;
        setWinner(segments[idx].label);
        setSpinning(false);
      }, 4000);
    };

    const t = setTimeout(spin, 1500);
    return () => clearTimeout(t);
  }, [spinning, rotation, segAngle, segments]);

  // Clear winner
  useEffect(() => {
    if (!winner) return;
    const t = setTimeout(() => setWinner(null), 3000);
    return () => clearTimeout(t);
  }, [winner]);

  const radius = 90;
  const cx = 100;
  const cy = 100;

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
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, hsl(45 100% 55%), transparent 70%)" }} />
      </div>

      {/* Pointer / Arrow at top */}
      <div className="relative z-10 mb-[-12px]">
        <svg width="24" height="18" viewBox="0 0 24 18">
          <polygon points="12,18 0,0 24,0" fill="hsl(45 100% 55%)" stroke="hsl(45 100% 40%)" strokeWidth="1" />
        </svg>
      </div>

      {/* Wheel */}
      <motion.div
        className="relative z-0"
        animate={{ rotate: rotation }}
        transition={{ duration: 4, ease: [0.15, 0.85, 0.35, 1] }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Outer ring glow */}
          <circle cx={cx} cy={cy} r={radius + 4} fill="none" stroke="hsl(45 100% 55% / 0.3)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={radius + 2} fill="none" stroke="hsl(45 100% 55% / 0.15)" strokeWidth="6" />

          {/* Segments */}
          {segments.map((seg, i) => (
            <path key={i} d={getSegmentPath(i)} fill={`hsl(${seg.color})`}
              stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          ))}

          {/* Labels */}
          {segments.map((seg, i) => {
            const pos = getLabelPos(i);
            return (
              <text
                key={`t-${i}`}
                x={pos.x}
                y={pos.y}
                fill="white"
                fontSize="5.5"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${pos.angle}, ${pos.x}, ${pos.y})`}
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)", fontFamily: "var(--font-heading, sans-serif)" }}
              >
                {seg.label.length > 12 ? seg.label.slice(0, 11) + "…" : seg.label}
              </text>
            );
          })}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r="12" fill="url(#hubGrad)" stroke="hsl(45 100% 40%)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="5" fill="hsl(45 100% 60%)" />
          <defs>
            <radialGradient id="hubGrad">
              <stop offset="0%" stopColor="hsl(45 100% 70%)" />
              <stop offset="100%" stopColor="hsl(45 80% 35%)" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Pedestal */}
      <div className="w-[60px] h-[14px] mt-[-4px] rounded-b-lg"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "none",
        }} />

      {/* Winner announcement */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 px-4 py-2 rounded-full"
          style={{
            background: "hsl(45 100% 55% / 0.12)",
            border: "1px solid hsl(45 100% 55% / 0.25)",
            boxShadow: "0 0 20px hsl(45 100% 55% / 0.1)",
          }}
        >
          <span className="text-[11px] font-bold" style={{ color: "hsl(45 100% 65%)" }}>🎉 {winner}</span>
        </motion.div>
      )}

      {spinning && !winner && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="mt-3 text-[10px] text-white/40 font-medium"
        >
          Spinning...
        </motion.p>
      )}
    </div>
  );
};

export default SpinWheelPreview;
