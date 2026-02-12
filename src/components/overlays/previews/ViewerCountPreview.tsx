import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ViewerCountPreviewProps {
  settings?: Record<string, any>;
}

const ViewerCountPreview = ({ settings = {} }: ViewerCountPreviewProps) => {
  const [count, setCount] = useState(342);
  const [peak, setPeak] = useState(342);
  const [history, setHistory] = useState<number[]>([280, 310, 290, 340, 320, 342]);
  const mode = settings.display_mode || "live_number";
  const accent = settings.accent_color || "45 100% 55%";
  const fontSize = settings.font_size || 36;
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";

  useEffect(() => {
    const t = setInterval(() => {
      const delta = Math.floor(Math.random() * 40) - 15;
      setCount(prev => {
        const next = Math.max(50, prev + delta);
        setPeak(p => Math.max(p, next));
        setHistory(h => [...h.slice(-11), next]);
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  if (mode === "mini_graph") {
    const max = Math.max(...history), min = Math.min(...history);
    const range = max - min || 1;
    const points = history.map((v, i) => `${(i / (history.length - 1)) * 200},${60 - ((v - min) / range) * 50}`).join(" ");
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-2">
          <motion.div className="w-2 h-2 rounded-full" style={{ background: `hsl(${accent})` }} animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.span className={`font-bold text-white ${fontClass}`} style={{ fontSize: fontSize * 0.7 }} key={count}
            initial={{ y: count > (history[history.length - 2] || 0) ? 10 : -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            {count}
          </motion.span>
          <span className="text-[10px] text-white/40">{settings.label_text || "viewers"}</span>
        </div>
        <svg width="200" height="60" className="opacity-60">
          <defs>
            <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`hsl(${accent})`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`hsl(${accent})`} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,60 ${points} 200,60`} fill="url(#vg)" />
          <polyline points={points} fill="none" stroke={`hsl(${accent})`} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px hsl(${accent} / 0.5))` }} />
        </svg>
        {settings.peak_tracker && <p className="text-[9px] text-white/30 mt-1">Peak: {peak}</p>}
      </div>
    );
  }

  if (mode === "badge") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div className="px-5 py-2.5 rounded-xl flex items-center gap-2.5" style={{
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)",
          border: `1px solid hsl(${accent} / 0.2)`, boxShadow: `0 0 15px hsl(${accent} / 0.1)`,
        }}>
          <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(${accent})` }}
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <motion.span className={`font-bold text-white ${fontClass}`} style={{ fontSize: 18 }} key={count}
            initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{count}</motion.span>
          <span className="text-[11px] text-white/50">{settings.label_text || "viewers"}</span>
        </motion.div>
      </div>
    );
  }

  if (mode === "pulse_dot") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div className="w-20 h-20 rounded-full flex items-center justify-center relative" style={{
          background: `radial-gradient(circle, hsl(${accent} / 0.15), transparent)`,
        }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="absolute rounded-full border" style={{ width: 80 + i * 20, height: 80 + i * 20, borderColor: `hsl(${accent} / ${0.15 - i * 0.04})` }}
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }} transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }} />
          ))}
          <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize: 24 }} key={count}
            initial={{ scale: 1.3 }} animate={{ scale: 1 }}>{count}</motion.span>
        </motion.div>
      </div>
    );
  }

  // live_number default
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <motion.div className="absolute rounded-full blur-2xl" style={{ width: 100, height: 100, background: `hsl(${accent} / 0.06)` }}
        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <div className="flex items-center gap-3">
        {settings.icon_visible !== false && (
          <motion.div className="w-3 h-3 rounded-full" style={{ background: `hsl(${accent})`, boxShadow: `0 0 10px hsl(${accent} / 0.5)` }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        )}
        <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize }} key={count}
          initial={settings.spike_animation ? { scale: 1.2, color: `hsl(${accent})` } : {}}
          animate={{ scale: 1, color: "white" }} transition={{ duration: 0.4 }}>
          {count.toLocaleString()}
        </motion.span>
      </div>
      <p className="text-[10px] text-white/40 mt-1">{settings.label_text || "viewers"}</p>
      {settings.peak_tracker && <p className="text-[9px] text-white/25 mt-0.5">Peak: {peak}</p>}
    </div>
  );
};

export default ViewerCountPreview;
