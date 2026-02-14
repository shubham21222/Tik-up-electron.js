import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, Lock, Volume2, Copy, Check, Play, Pause } from "lucide-react";
import AnimationPreview from "@/components/actions/AnimationPreview";

const alertStyles = [
  { id: "tikup_signature", name: "TikUp Signature", emoji: "✨", pro: false, desc: "Animated brand pop with glow burst", color: "160 100% 45%" },
  { id: "neon_pulse", name: "Neon Pulse", emoji: "💎", pro: true, desc: "Pulsing glowing outlines with electric energy", color: "180 100% 55%" },
  { id: "cosmic_burst", name: "Cosmic Burst", emoji: "🌌", pro: true, desc: "Starburst particle explosion with slow glow fade", color: "280 100% 65%" },
  { id: "3d_flip", name: "3D Rotator", emoji: "🎰", pro: true, desc: "Genuine 360° card-flip rotation on multiple axes", color: "220 100% 65%" },
  { id: "liquid_wave", name: "Liquid Wave", emoji: "🌊", pro: true, desc: "Wavy fluid background following the gift icon", color: "200 100% 60%" },
  { id: "firework", name: "Firework Explosion", emoji: "🎆", pro: true, desc: "Multi-color fireworks with shockwave rings & trails", color: "45 100% 55%" },
  { id: "glitch", name: "Digital Glitch", emoji: "⚡", pro: true, desc: "RGB channel splitting and digital scanline flickering", color: "0 100% 55%" },
  { id: "arc_reactor", name: "Arc Reactor", emoji: "🔮", pro: true, desc: "Rotating circular energy fields with radial bursts", color: "200 100% 70%" },
];

const AlertStylesTab = () => {
  const [selected, setSelected] = useState(alertStyles[0]);
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://tikup.xyz/overlay/gift_alert/demo?style=${selected.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key="styles"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-sm font-heading font-bold text-foreground flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-secondary" /> Alert Animation Styles
        </h2>
        <p className="text-xs text-muted-foreground">Pick a style to preview. Each style syncs with unique sound effects and visual animations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* ── LEFT: Style Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {alertStyles.map((style) => {
            const isActive = selected.id === style.id;
            return (
              <motion.button
                key={style.id}
                onClick={() => setSelected(style)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-2xl p-[1px] text-left transition-all duration-300 ${
                  isActive ? "ring-1 ring-primary/40" : ""
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, hsl(${style.color} / 0.15), hsl(${style.color} / 0.04))`
                    : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                }}
              >
                <div
                  className="rounded-2xl p-4 h-full"
                  style={{
                    background: isActive ? "rgba(20,25,35,0.8)" : "rgba(20,25,35,0.5)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* PRO badge */}
                  {style.pro && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/15 border border-secondary/20">
                      <Lock size={9} className="text-secondary" />
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">PRO</span>
                    </div>
                  )}

                  {/* Icon + Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{style.emoji}</span>
                    <span className={`text-xs font-heading font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {style.name}
                    </span>
                  </div>

                  {/* Mini preview */}
                  <div className="h-[90px] rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <AnimationPreview
                      style={style.id}
                      emoji={style.emoji}
                      giftName={style.name}
                      isPremium={style.pro}
                    />
                  </div>

                  {/* Free badge */}
                  {!style.pro && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 border border-primary/15">FREE</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── RIGHT: Live Preview Panel ── */}
        <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
            {/* Preview header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-heading font-bold text-foreground">Live Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {playing ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>

            {/* Big preview area */}
            <div className="h-[280px] relative">
              <AnimatePresence mode="wait">
                {playing && (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <AnimationPreview
                      style={selected.id}
                      emoji={selected.emoji}
                      giftName={selected.name}
                      isPremium={selected.pro}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Style info */}
            <div className="px-5 py-4 border-t border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selected.emoji}</span>
                <h3 className="text-sm font-heading font-bold text-foreground">{selected.name}</h3>
                {selected.pro && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary/15 border border-secondary/20 text-[9px] font-bold text-secondary uppercase tracking-wider">PRO</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">{selected.desc}</p>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Loop Speed</p>
                  <div className="flex gap-1">
                    {["1x", "1.5x", "2x"].map(s => (
                      <button key={s} className="px-2 py-1 rounded-md text-[10px] font-medium bg-muted/30 text-muted-foreground hover:text-foreground transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Background</p>
                  <div className="flex gap-1">
                    {["Dark", "Light", "Grad"].map(s => (
                      <button key={s} className="px-2 py-1 rounded-md text-[10px] font-medium bg-muted/30 text-muted-foreground hover:text-foreground transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Sound</p>
                  <div className="flex items-center gap-2">
                    <Volume2 size={12} className="text-muted-foreground" />
                    <div className="flex-1 h-1.5 rounded-full bg-muted/40">
                      <div className="h-full w-3/4 rounded-full bg-primary/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertStylesTab;
