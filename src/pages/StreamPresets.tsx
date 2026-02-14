import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Zap, Gamepad2, Camera, MessageCircle, Check, Sparkles, Copy } from "lucide-react";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import StreamBorderPreview from "@/components/overlays/previews/StreamBorderPreview";
import { getOverlayBaseUrl } from "@/lib/overlay-url";

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: typeof Zap;
  color: string;
  effects: string[];
}

const presets: Preset[] = [
  {
    id: "hype",
    name: "Hype Mode",
    description: "Max energy. Big gift reactions, loud sounds, combo counters, and fireworks for every major gift.",
    icon: Zap,
    color: "350 90% 55%",
    effects: ["Gift Fireworks", "Combo Counter", "Sound Alerts", "Like Burst", "Leaderboard"],
  },
  {
    id: "gaming",
    name: "Gaming Mode",
    description: "Clean, non-distracting alerts. Subtle follow notifications, corner gift alerts, and minimal viewer count.",
    icon: Gamepad2,
    color: "160 100% 45%",
    effects: ["Corner Alerts", "Viewer Count", "Stream Timer", "Chat Box", "Webcam Frame"],
  },
  {
    id: "irl",
    name: "IRL Mode",
    description: "Lightweight overlays for outdoor and IRL streams. Chat, timer, and follow goal only.",
    icon: Camera,
    color: "45 100% 55%",
    effects: ["Chat Box", "Stream Timer", "Follower Goal", "Social Rotator"],
  },
  {
    id: "talkshow",
    name: "Talk Show Mode",
    description: "Professional layout for interviews and conversations. TTS, leaderboard, and polls front and center.",
    icon: MessageCircle,
    color: "280 100% 65%",
    effects: ["Text-to-Speech", "Leaderboard", "Polls", "Like Counter", "Custom Text"],
  },
];

const gamingBorders = [
  {
    id: "cod_tactical",
    name: "COD Tactical",
    emoji: "🎮",
    description: "Military HUD with tactical scan lines, flickering grid edges, and killfeed-style flash triggers.",
    color: "120 60% 35%",
    palette: ["⚫ Black", "🟩 Army Green", "🔴 Red Pulse"],
    features: ["Scan line sweep", "Corner brackets", "Grid flicker"],
  },
  {
    id: "fortnite_victory",
    name: "Fortnite Victory",
    emoji: "🟠",
    description: "Bright neon shield bubble with bounce animations and victory royale zone-shift gradients.",
    color: "260 100% 65%",
    palette: ["🟦 Cyan", "🟪 Purple", "🟨 Yellow"],
    features: ["Shield glow", "Bounce sparks", "Color shift"],
  },
  {
    id: "arch_raider",
    name: "Arch Raider",
    emoji: "🏹",
    description: "Fantasy mystic frame with sweeping arrow trails, rune glow loops, and amber impact sparks.",
    color: "35 90% 55%",
    palette: ["🏹 Forest Green", "🔶 Amber", "✨ Mystic Teal"],
    features: ["Arrow sweep", "Rune glow", "Impact sparks"],
  },
  {
    id: "battle_royale_pro",
    name: "Battle Royale Pro",
    emoji: "🔥",
    description: "Esports competitive UI with adaptive color shifts, reactive glow pulsing, and clutch highlight flash.",
    color: "0 80% 50%",
    palette: ["🟥 Red", "⬛ Black", "🟦 Blue"],
    features: ["Adaptive pulse", "Color shift", "Clutch flash"],
  },
  {
    id: "space_fighter",
    name: "Space Fighter",
    emoji: "🚀",
    description: "Sci-fi deep space HUD with scanning grid, starfield micro-sparkles, and alert blast rings.",
    color: "220 80% 45%",
    palette: ["🌌 Deep Blue", "✨ Neon White", "🚀 Red Alert"],
    features: ["Scan grid", "Starfield", "Blast rings"],
  },
];

const StreamPresets = () => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async (preset: Preset) => {
    setApplying(true);
    setActivePreset(preset.id);
    await new Promise(r => setTimeout(r, 1200));
    setApplying(false);
    toast.success(`${preset.name} activated! Your overlays are configured.`);
  };

  const copyUrl = (style: string) => {
    const url = `${getOverlayBaseUrl()}/overlay/stream-border/preview?style=${style}`;
    navigator.clipboard.writeText(url);
    toast.success("Border URL copied! Paste into OBS or TikTok LIVE Studio.");
  };

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }} />

      <div className="max-w-4xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Pick Your Vibe</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            One click. All your overlays, alerts, and sounds configured automatically. No setup required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {presets.map((preset, i) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl p-[1px] group cursor-pointer"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, hsl(${preset.color} / 0.3), hsl(${preset.color} / 0.05))`
                    : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                }}
                onClick={() => handleApply(preset)}
              >
                <div
                  className="rounded-2xl p-6 h-full relative overflow-hidden transition-shadow duration-300"
                  style={{
                    background: "rgba(20,25,35,0.75)",
                    backdropFilter: "blur(20px)",
                    boxShadow: isActive ? `0 0 30px hsl(${preset.color} / 0.1)` : undefined,
                  }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, hsl(${preset.color} / 0.06), transparent 70%)` }} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ background: `hsl(${preset.color} / 0.1)` }}>
                          <Icon size={22} style={{ color: `hsl(${preset.color})` }} />
                        </div>
                        <h3 className="text-base font-heading font-bold text-foreground">{preset.name}</h3>
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                          style={{ background: `hsl(${preset.color} / 0.1)`, color: `hsl(${preset.color})` }}>
                          <Check size={10} /> Active
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{preset.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preset.effects.map(effect => (
                        <span key={effect} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/30 text-muted-foreground">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Gaming Border Pack ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={18} className="text-primary" />
            <h2 className="text-2xl font-heading font-bold text-foreground">🎮 Gaming Border Pack</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Themed animated borders for top games. Copy the URL → paste into OBS / TikTok LIVE Studio as a Browser Source.
          </p>
        </motion.div>

        <div className="space-y-5">
          {gamingBorders.map((border, i) => (
            <motion.div
              key={border.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="rounded-2xl p-[1px] group"
              style={{ background: `linear-gradient(135deg, hsl(${border.color} / 0.2), hsl(${border.color} / 0.03))` }}
            >
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(20,25,35,0.85)", backdropFilter: "blur(20px)" }}>
                <div className="flex flex-col md:flex-row">
                  {/* Preview */}
                  <div className="w-full md:w-64 h-40 md:h-auto relative flex-shrink-0 overflow-hidden" style={{ background: "#0B0F14" }}>
                    <Suspense fallback={null}>
                      <StreamBorderPreview settings={{ border_style: border.id, border_thickness: 4, animation_speed: 1, glow_intensity: 60 }} />
                    </Suspense>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-heading font-bold text-foreground">
                        {border.emoji} {border.name}
                      </h3>
                      <button
                        onClick={() => copyUrl(border.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                        style={{ background: `hsl(${border.color} / 0.1)`, color: `hsl(${border.color})` }}
                      >
                        <Copy size={12} /> Copy URL
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{border.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {border.palette.map(c => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/20 text-muted-foreground">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {border.features.map(f => (
                        <span key={f} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/30 text-muted-foreground flex items-center gap-1">
                          <Check size={8} /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Earnings callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg, hsl(45 100% 55% / 0.15), hsl(45 100% 55% / 0.03))" }}
        >
          <div className="rounded-2xl px-6 py-4 flex items-center gap-4"
            style={{ background: "rgba(20,25,35,0.75)", backdropFilter: "blur(20px)" }}>
            <div className="text-2xl">💎</div>
            <div>
              <p className="text-sm font-heading font-bold text-foreground">Creators with interactive effects earn +18% more gifts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Viewers engage more when they see their actions on screen. TikUp makes that instant.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default StreamPresets;