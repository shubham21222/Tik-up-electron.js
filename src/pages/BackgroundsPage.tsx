import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Lock, Star, Copy, Play, Check,
  Sparkles, Monitor, Type, Sliders, Zap, ChevronRight, ExternalLink, Sun, Eye
} from "lucide-react";
import ProGate from "@/components/ProGate";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PageHelpButton from "@/components/PageHelpButton";
import { getOverlayBaseUrl } from "@/lib/overlay-url";

/* ─── Room Background Definitions ─── */
interface RoomBackground {
  id: string;
  title: string;
  category: string;
  description: string;
  gradientColors: string[];
  accentColor: string;
  ledFonts: string[];
  ledAnimations: string[];
  envFx: string[];
  sofaStyle: string;
  lightingMood: string;
  free?: boolean;
}

const backgrounds: RoomBackground[] = [
  {
    id: "neon-cyberroom",
    title: "Neon Cyberroom",
    category: "Cyber",
    description: "Futuristic hacker room with flickering neon tubes, a sleek modern sofa, and soft rotating ambient lights.",
    gradientColors: ["hsl(280 100% 25%)", "hsl(200 100% 15%)", "hsl(320 80% 20%)"],
    accentColor: "280 100% 65%",
    ledFonts: ["Neon", "Cyber", "Digital", "Minimal"],
    ledAnimations: ["static", "pulse", "rainbow", "flicker", "sparkle"],
    envFx: ["Particle motion", "Ambient glow", "Blur depth"],
    sofaStyle: "Modern",
    lightingMood: "Purple",
    free: true,
  },
  {
    id: "gaming-lair",
    title: "Gaming Lair",
    category: "Gamer",
    description: "Pro gamer room with RGB desk lights cycling, a modular gaming sofa, and monitor screen flicker.",
    gradientColors: ["hsl(160 100% 20%)", "hsl(200 100% 18%)", "hsl(280 80% 25%)"],
    accentColor: "160 100% 45%",
    ledFonts: ["Arcade", "Neon", "Futuristic", "Minimal"],
    ledAnimations: ["static", "pulse", "flicker", "sparkle", "rainbow"],
    envFx: ["RGB animation", "Keyboard glow", "Ambient wrap"],
    sofaStyle: "Modular",
    lightingMood: "RGB Cycle",
    free: true,
  },
  {
    id: "arcade-retro",
    title: "Arcade Retro Room",
    category: "Cyber",
    description: "Retro arcade with machine lights, scanlines, a leather lounge chair, and glitch effects.",
    gradientColors: ["hsl(340 80% 22%)", "hsl(45 100% 18%)", "hsl(200 80% 20%)"],
    accentColor: "340 80% 55%",
    ledFonts: ["Arcade", "Digital", "Neon"],
    ledAnimations: ["static", "pulse", "rainbow"],
    envFx: ["Scanlines", "Glitch flicker", "Particle hex"],
    sofaStyle: "Leather",
    lightingMood: "Red",
  },
  {
    id: "space-command",
    title: "Space Command Deck",
    category: "Cyber",
    description: "Futuristic space station with starfield motion, a minimal command chair, and animated UI displays.",
    gradientColors: ["hsl(220 60% 12%)", "hsl(240 50% 18%)", "hsl(200 80% 22%)"],
    accentColor: "220 80% 60%",
    ledFonts: ["Futuristic", "Cyber", "Digital"],
    ledAnimations: ["static", "pulse", "sparkle", "rainbow"],
    envFx: ["Starfield", "Console blink", "Parallax depth"],
    sofaStyle: "Minimal",
    lightingMood: "Blue",
  },
  {
    id: "mystic-chill",
    title: "Mystic Chill Room",
    category: "Cozy",
    description: "Cozy fantasy stream room with magic runes, a plush fabric sofa, and warm lantern glows.",
    gradientColors: ["hsl(30 60% 15%)", "hsl(260 40% 18%)", "hsl(180 30% 16%)"],
    accentColor: "30 80% 55%",
    ledFonts: ["Script", "Neon", "Arcade"],
    ledAnimations: ["static", "pulse", "flicker"],
    envFx: ["Rune float", "Lantern glow", "Dust motes"],
    sofaStyle: "Cozy Fabric",
    lightingMood: "Warm Amber",
  },
  {
    id: "luxury-lounge",
    title: "Luxury Lounge",
    category: "Luxury",
    description: "Premium velvet sofa in a dimly lit luxury lounge with gold accents and bokeh particles.",
    gradientColors: ["hsl(35 50% 12%)", "hsl(25 40% 8%)", "hsl(45 60% 15%)"],
    accentColor: "40 95% 55%",
    ledFonts: ["Script", "Minimal", "Neon"],
    ledAnimations: ["static", "pulse", "sparkle"],
    envFx: ["Gold bokeh", "Warm glow", "Light rays"],
    sofaStyle: "Luxury Velvet",
    lightingMood: "Gold",
  },
  {
    id: "pastel-creator",
    title: "Pastel Creator Room",
    category: "Minimal",
    description: "Light, airy creator studio with a minimal white sofa, pastel gradients, and soft floating particles.",
    gradientColors: ["hsl(300 50% 25%)", "hsl(200 50% 22%)", "hsl(340 40% 28%)"],
    accentColor: "330 85% 60%",
    ledFonts: ["Minimal", "Script", "Neon"],
    ledAnimations: ["static", "pulse", "sparkle"],
    envFx: ["Soft bokeh", "Light dust", "Gentle glow"],
    sofaStyle: "Minimal White",
    lightingMood: "Pink",
  },
  {
    id: "nightclub-vibe",
    title: "Night Club Vibe",
    category: "Cyber",
    description: "Dark nightclub atmosphere with a leather VIP sofa, laser beams, and pulsing bass-reactive lights.",
    gradientColors: ["hsl(280 80% 12%)", "hsl(320 90% 15%)", "hsl(260 70% 10%)"],
    accentColor: "320 90% 60%",
    ledFonts: ["Neon", "Cyber", "Digital", "Arcade"],
    ledAnimations: ["static", "pulse", "rainbow", "flicker", "sparkle"],
    envFx: ["Laser sweep", "Strobe flash", "Bass pulse"],
    sofaStyle: "Leather VIP",
    lightingMood: "Purple",
  },
  {
    id: "podcast-chill",
    title: "Chill Podcast Room",
    category: "Cozy",
    description: "Warm podcast studio with a deep cozy sofa, warm backlighting, and soft ambient dust motes.",
    gradientColors: ["hsl(20 40% 14%)", "hsl(30 50% 10%)", "hsl(15 35% 12%)"],
    accentColor: "25 80% 55%",
    ledFonts: ["Minimal", "Script", "Neon"],
    ledAnimations: ["static", "pulse"],
    envFx: ["Warm backlight", "Dust motes", "Soft vignette"],
    sofaStyle: "Deep Cozy",
    lightingMood: "Warm Amber",
  },
  {
    id: "cinematic-studio",
    title: "Cinematic Studio",
    category: "Luxury",
    description: "Film-grade studio with a modern director's sofa, dramatic teal-orange lighting, and light rays.",
    gradientColors: ["hsl(190 60% 12%)", "hsl(30 60% 15%)", "hsl(200 50% 10%)"],
    accentColor: "180 100% 50%",
    ledFonts: ["Futuristic", "Minimal", "Cyber"],
    ledAnimations: ["static", "pulse", "sparkle"],
    envFx: ["Cinematic rays", "Teal-orange grade", "Depth blur"],
    sofaStyle: "Modern Director",
    lightingMood: "Teal",
  },
];

const categories = ["All", "Cyber", "Gamer", "Cozy", "Luxury", "Minimal"];

const sizePresets = [
  { label: "16:9 Landscape", value: "1920x1080" },
  { label: "9:16 Portrait", value: "1080x1920" },
  { label: "1:1 Square", value: "1080x1080" },
];

/* ─── Animated Room Preview ─── */
const RoomPreview = ({ bg, selected, onClick, isPro }: { bg: RoomBackground; selected: boolean; onClick: () => void; isPro: boolean }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={`relative w-full rounded-2xl border overflow-hidden text-left transition-all duration-300 group ${
      selected ? "border-primary/30 ring-1 ring-primary/20" : "border-border/15 hover:border-border/30"
    }`}
    style={{
      background: selected
        ? `linear-gradient(160deg, hsl(${bg.accentColor} / 0.08), rgba(12,14,20,0.9))`
        : "rgba(12,14,20,0.85)",
    }}
  >
    {/* Animated Preview Thumbnail */}
    <div className="relative h-36 overflow-hidden rounded-t-2xl">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `linear-gradient(0deg, ${bg.gradientColors[0]}, ${bg.gradientColors[1]})`,
            `linear-gradient(120deg, ${bg.gradientColors[1]}, ${bg.gradientColors[2]})`,
            `linear-gradient(240deg, ${bg.gradientColors[2]}, ${bg.gradientColors[0]})`,
            `linear-gradient(360deg, ${bg.gradientColors[0]}, ${bg.gradientColors[1]})`,
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      {/* Simulated particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            background: `hsl(${bg.accentColor} / ${0.3 + Math.random() * 0.4})`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      {/* LED sign simulation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <motion.div
          className="px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-widest"
          style={{
            background: `hsl(${bg.accentColor} / 0.15)`,
            color: `hsl(${bg.accentColor})`,
            border: `1px solid hsl(${bg.accentColor} / 0.3)`,
            textShadow: `0 0 8px hsl(${bg.accentColor} / 0.5)`,
          }}
          animate={{
            textShadow: [
              `0 0 8px hsl(${bg.accentColor} / 0.3)`,
              `0 0 16px hsl(${bg.accentColor} / 0.6)`,
              `0 0 8px hsl(${bg.accentColor} / 0.3)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          YOUR TEXT
        </motion.div>
      </div>
      {/* Badge */}
      <div
        className="absolute top-2.5 right-2.5 text-[8px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1"
        style={bg.free ? {
          background: "hsl(160 100% 45% / 0.15)",
          color: "hsl(160 100% 55%)",
          border: "1px solid hsl(160 100% 45% / 0.25)",
        } : {
          background: "linear-gradient(135deg, hsl(280 100% 65% / 0.2), hsl(280 100% 55% / 0.1))",
          color: "hsl(280 100% 70%)",
          border: "1px solid hsl(280 100% 65% / 0.25)",
        }}
      >
        {bg.free ? "FREE" : <><Star size={7} /> PRO</>}
      </div>
    </div>

    {/* Info */}
    <div className="p-3.5">
      <h3 className="text-[13px] font-heading font-bold text-foreground mb-1">{bg.title}</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
          style={{
            background: `hsl(${bg.accentColor} / 0.1)`,
            color: `hsl(${bg.accentColor})`,
          }}
        >
          {bg.category}
        </span>
        <span className="text-[9px] text-muted-foreground/60">{bg.sofaStyle}</span>
      </div>
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-2xl">
      <span
        className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
        style={{
          background: `hsl(${bg.accentColor} / 0.2)`,
          color: `hsl(${bg.accentColor})`,
          border: `1px solid hsl(${bg.accentColor} / 0.3)`,
        }}
      >
        {selected ? "Selected" : !bg.free && !isPro ? "🔒 Pro Only" : "Select"}
      </span>
    </div>
  </motion.button>
);

/* ─── LED Preview Component ─── */
const LEDPreview = ({
  bg, text, color, animation, font, glowIntensity, speed, brightness, vignette, particles,
}: {
  bg: RoomBackground; text: string; color: string; animation: string; font: string;
  glowIntensity: number; speed: number; brightness: number; vignette: boolean; particles: boolean;
}) => {
  const glowPx = 4 + (glowIntensity / 100) * 20;

  const fontFamily = {
    Neon: "'Courier New', monospace",
    Cyber: "'Courier New', monospace",
    Arcade: "'Courier New', monospace",
    Futuristic: "system-ui, sans-serif",
    Digital: "'Courier New', monospace",
    Script: "Georgia, serif",
    Minimal: "system-ui, sans-serif",
  }[font] || "system-ui, sans-serif";

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ filter: `brightness(${brightness / 100})` }}>
      {/* Animated room background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `linear-gradient(0deg, ${bg.gradientColors[0]}, ${bg.gradientColors[1]})`,
            `linear-gradient(120deg, ${bg.gradientColors[1]}, ${bg.gradientColors[2]})`,
            `linear-gradient(240deg, ${bg.gradientColors[2]}, ${bg.gradientColors[0]})`,
            `linear-gradient(360deg, ${bg.gradientColors[0]}, ${bg.gradientColors[1]})`,
          ],
        }}
        transition={{ duration: 8 / speed, repeat: Infinity, ease: "linear" }}
      />

      {/* Ambient Particles */}
      {particles && [...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 1.5 + Math.random() * 3,
            height: 1.5 + Math.random() * 3,
            background: `hsl(${color} / ${0.2 + Math.random() * 0.4})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: (3 + Math.random() * 4) / speed,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* LED Sign */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="px-8 py-4 rounded-xl"
          style={{
            background: `hsl(${color} / 0.08)`,
            border: `2px solid hsl(${color} / 0.25)`,
            boxShadow: `0 0 ${glowPx}px hsl(${color} / 0.3), inset 0 0 ${glowPx / 2}px hsl(${color} / 0.1)`,
          }}
          animate={
            animation === "pulse"
              ? { boxShadow: [
                  `0 0 ${glowPx}px hsl(${color} / 0.2), inset 0 0 ${glowPx / 2}px hsl(${color} / 0.05)`,
                  `0 0 ${glowPx * 2}px hsl(${color} / 0.5), inset 0 0 ${glowPx}px hsl(${color} / 0.15)`,
                  `0 0 ${glowPx}px hsl(${color} / 0.2), inset 0 0 ${glowPx / 2}px hsl(${color} / 0.05)`,
                ]}
              : animation === "flicker"
              ? { opacity: [1, 0.7, 1, 0.9, 1, 0.6, 1] }
              : animation === "rainbow"
              ? { borderColor: [
                  `hsl(0 100% 60% / 0.3)`,
                  `hsl(60 100% 60% / 0.3)`,
                  `hsl(120 100% 60% / 0.3)`,
                  `hsl(180 100% 60% / 0.3)`,
                  `hsl(240 100% 60% / 0.3)`,
                  `hsl(300 100% 60% / 0.3)`,
                  `hsl(360 100% 60% / 0.3)`,
                ]}
              : {}
          }
          transition={{ duration: (animation === "rainbow" ? 4 : 2) / speed, repeat: Infinity }}
        >
          <motion.span
            className="text-2xl font-bold tracking-[0.15em]"
            style={{
              fontFamily,
              color: `hsl(${color})`,
              textShadow: `0 0 ${glowPx}px hsl(${color} / 0.6)`,
            }}
            animate={
              animation === "sparkle"
                ? { textShadow: [
                    `0 0 ${glowPx}px hsl(${color} / 0.4)`,
                    `0 0 ${glowPx * 3}px hsl(${color} / 0.9)`,
                    `0 0 ${glowPx}px hsl(${color} / 0.4)`,
                  ]}
                : {}
            }
            transition={{ duration: 1.5 / speed, repeat: Infinity }}
          >
            {text || "YOUR TEXT HERE"}
          </motion.span>
        </motion.div>
      </div>

      {/* Vignette overlay */}
      {vignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      )}

      {/* OBS Frame guide */}
      <div className="absolute inset-2 border border-dashed border-white/5 rounded-xl pointer-events-none" />
      <div className="absolute bottom-2 right-3 text-[9px] text-white/20 font-mono">1920×1080</div>
    </div>
  );
};

/* ─── Main Page ─── */
const BackgroundsPage = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  const [selectedBg, setSelectedBg] = useState<RoomBackground>(backgrounds[0]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [ledText, setLedText] = useState("LIVE NOW");
  const [ledColor, setLedColor] = useState("280 100% 65%");
  const [ledAnimation, setLedAnimation] = useState("pulse");
  const [ledFont, setLedFont] = useState("Neon");
  const [glowIntensity, setGlowIntensity] = useState(60);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [vignette, setVignette] = useState(false);
  const [ambientParticles, setAmbientParticles] = useState(true);
  const [sizePreset, setSizePreset] = useState("1920x1080");
  const [ledOpacity, setLedOpacity] = useState(100);

  const filtered = activeCategory === "All"
    ? backgrounds
    : backgrounds.filter(b => b.category === activeCategory);

  const buildUrl = (bgId: string, extra = "") => {
    const base = `${getOverlayBaseUrl()}/overlay/backgrounds/${bgId}`;
    const colorEncoded = ledColor.replace(/ /g, "_").replace(/%/g, "");
    const params = `led=${encodeURIComponent(ledText)}&color=${colorEncoded}&anim=${ledAnimation}&font=${ledFont.toLowerCase()}&speed=${animSpeed}&glow=${glowIntensity}&brightness=${brightness}&vignette=${vignette ? 1 : 0}&particles=${ambientParticles ? 1 : 0}&size=${sizePreset}&ledopacity=${ledOpacity}`;
    return `${base}?${params}${extra ? "&" + extra : ""}`;
  };

  const copyUrl = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopied(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const colorPresets = [
    { label: "Purple", value: "280 100% 65%" },
    { label: "Green", value: "160 100% 45%" },
    { label: "Cyan", value: "180 100% 50%" },
    { label: "Red", value: "350 90% 55%" },
    { label: "Blue", value: "220 80% 60%" },
    { label: "Gold", value: "40 95% 55%" },
    { label: "Pink", value: "330 85% 60%" },
    { label: "White", value: "0 0% 90%" },
    { label: "Teal", value: "180 70% 45%" },
    { label: "Amber", value: "30 90% 55%" },
  ];

  const canUseRoom = (bg: RoomBackground) => bg.free || isPro;

  return (
    <AppLayout>
      <ProGate feature="Backgrounds">
      {/* Ambient */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse, hsl(${selectedBg.accentColor} / 0.04), transparent 70%)` }}
      />

      <div className="max-w-6xl mx-auto relative z-10 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${selectedBg.accentColor} / 0.15), hsl(${selectedBg.accentColor} / 0.05))`,
                  border: `1px solid hsl(${selectedBg.accentColor} / 0.2)`,
                }}
              >
                <Palette size={20} style={{ color: `hsl(${selectedBg.accentColor})` }} />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  TikUp Studio Rooms
                  <span
                    className="text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 55% / 0.08))",
                      color: "hsl(280 100% 70%)",
                      border: "1px solid hsl(280 100% 65% / 0.2)",
                    }}
                  >
                    <Star size={8} /> 10 ROOMS
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Premium animated room backgrounds with customizable LED signs. 2 rooms free, 8 Pro-exclusive.
                </p>
              </div>
            </div>
          </div>
          <PageHelpButton featureKey="animated-backgrounds" title="Studio Backgrounds" />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                background: activeCategory === cat
                  ? `hsl(${selectedBg.accentColor} / 0.1)`
                  : "hsl(0 0% 100% / 0.03)",
                border: `1px solid ${
                  activeCategory === cat
                    ? `hsl(${selectedBg.accentColor} / 0.2)`
                    : "hsl(0 0% 100% / 0.06)"
                }`,
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Background Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(bg => (
              <motion.div
                key={bg.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <RoomPreview
                  bg={bg}
                  selected={selectedBg.id === bg.id}
                  isPro={isPro}
                  onClick={() => setSelectedBg(bg)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pro Lock for non-free rooms */}
        {!canUseRoom(selectedBg) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 rounded-2xl p-6 text-center border border-border/15"
            style={{ background: "rgba(12,14,20,0.8)", backdropFilter: "blur(12px)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock size={32} className="mx-auto mb-3" style={{ color: "hsl(280 100% 65%)" }} />
            </motion.div>
            <h2 className="text-lg font-heading font-bold text-foreground mb-1">
              "{selectedBg.title}" is a Pro room
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro to unlock all 10 studio rooms, full LED customization, and overlay URLs.
            </p>
            <Link
              to="/pro"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 55%))",
                color: "white",
                boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)",
              }}
            >
              <Star size={14} /> Upgrade to Pro
            </Link>
          </motion.div>
        )}

        {/* ─── Selected Background ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/20 overflow-hidden mb-6"
          style={{ background: "rgba(12,14,20,0.75)", backdropFilter: "blur(20px)" }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/10">
            <div className="flex items-center gap-3">
              <Monitor size={16} style={{ color: `hsl(${selectedBg.accentColor})` }} />
              <div>
                <h2 className="text-sm font-heading font-bold text-foreground">{selectedBg.title}</h2>
                <p className="text-[11px] text-muted-foreground">{selectedBg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground/50">{selectedBg.sofaStyle} · {selectedBg.lightingMood}</span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                style={{ background: `hsl(${selectedBg.accentColor} / 0.1)`, color: `hsl(${selectedBg.accentColor})` }}
              >
                {selectedBg.category}
              </span>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-5">
            <LEDPreview
              bg={selectedBg}
              text={ledText}
              color={ledColor}
              animation={ledAnimation}
              font={ledFont}
              glowIntensity={glowIntensity}
              speed={animSpeed}
              brightness={brightness}
              vignette={vignette}
              particles={ambientParticles}
            />
            <div className="flex items-center gap-2 mt-3 justify-end">
              <button
                onClick={() => {
                  if (!canUseRoom(selectedBg)) { toast.error("Upgrade to Pro"); return; }
                  window.open(buildUrl(selectedBg.id), "_blank");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: `hsl(${selectedBg.accentColor} / 0.1)`,
                  color: `hsl(${selectedBg.accentColor})`,
                  border: `1px solid hsl(${selectedBg.accentColor} / 0.2)`,
                }}
              >
                <Play size={12} /> Play Demo
              </button>
              <button
                onClick={() => {
                  if (!canUseRoom(selectedBg)) { toast.error("Upgrade to Pro"); return; }
                  window.open(buildUrl(selectedBg.id), "_blank");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all"
                style={{
                  background: "hsl(0 0% 100% / 0.03)",
                  border: "1px solid hsl(0 0% 100% / 0.06)",
                }}
              >
                <ExternalLink size={12} /> Open Full Screen
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Settings Panel ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* LED Sign Customization */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/20 p-5"
            style={{ background: "rgba(12,14,20,0.75)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Type size={14} style={{ color: `hsl(${selectedBg.accentColor})` }} />
              <h3 className="text-sm font-heading font-bold text-foreground">LED Sign Customization</h3>
            </div>

            <div className="space-y-4">
              {/* LED Text */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">LED Text</label>
                <input
                  type="text"
                  value={ledText}
                  onChange={e => setLedText(e.target.value)}
                  placeholder="Your custom text here..."
                  maxLength={30}
                  className="w-full bg-[hsl(0_0%_100%/0.03)] border border-border/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
                />
              </div>

              {/* Font Style */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Font Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBg.ledFonts.map(f => (
                    <button
                      key={f}
                      onClick={() => setLedFont(f)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        ledFont === f ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                      style={{
                        background: ledFont === f ? `hsl(${selectedBg.accentColor} / 0.12)` : "hsl(0 0% 100% / 0.03)",
                        border: `1px solid ${ledFont === f ? `hsl(${selectedBg.accentColor} / 0.25)` : "hsl(0 0% 100% / 0.06)"}`,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">LED Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {colorPresets.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setLedColor(c.value)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        ledColor === c.value ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ background: `hsl(${c.value})` }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Animation */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Animation</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBg.ledAnimations.map(a => (
                    <button
                      key={a}
                      onClick={() => setLedAnimation(a)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        ledAnimation === a ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                      style={{
                        background: ledAnimation === a ? `hsl(${selectedBg.accentColor} / 0.12)` : "hsl(0 0% 100% / 0.03)",
                        border: `1px solid ${ledAnimation === a ? `hsl(${selectedBg.accentColor} / 0.25)` : "hsl(0 0% 100% / 0.06)"}`,
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* LED Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-muted-foreground">LED Opacity</label>
                  <span className="text-[11px] font-bold text-foreground">{ledOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={ledOpacity}
                  onChange={e => setLedOpacity(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${selectedBg.accentColor}) ${ledOpacity}%, hsl(0 0% 100% / 0.08) ${ledOpacity}%)`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Visuals & Motion + Room Customisation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border/20 p-5"
            style={{ background: "rgba(12,14,20,0.75)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sliders size={14} style={{ color: `hsl(${selectedBg.accentColor})` }} />
              <h3 className="text-sm font-heading font-bold text-foreground">Room & Motion Controls</h3>
            </div>

            <div className="space-y-5">
              {/* Glow Intensity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-muted-foreground">Glow Intensity</label>
                  <span className="text-[11px] font-bold text-foreground">{glowIntensity}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={glowIntensity}
                  onChange={e => setGlowIntensity(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, hsl(${selectedBg.accentColor}) ${glowIntensity}%, hsl(0 0% 100% / 0.08) ${glowIntensity}%)` }}
                />
              </div>

              {/* Animation Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-muted-foreground">Animation Speed</label>
                  <span className="text-[11px] font-bold text-foreground">{animSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min={0.5} max={2} step={0.1} value={animSpeed}
                  onChange={e => setAnimSpeed(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, hsl(${selectedBg.accentColor}) ${((animSpeed - 0.5) / 1.5) * 100}%, hsl(0 0% 100% / 0.08) ${((animSpeed - 0.5) / 1.5) * 100}%)` }}
                />
              </div>

              {/* Brightness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sun size={10} /> Room Brightness
                  </label>
                  <span className="text-[11px] font-bold text-foreground">{brightness}%</span>
                </div>
                <input
                  type="range" min={30} max={150} value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, hsl(${selectedBg.accentColor}) ${((brightness - 30) / 120) * 100}%, hsl(0 0% 100% / 0.08) ${((brightness - 30) / 120) * 100}%)` }}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVignette(!vignette)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                    vignette ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                  style={{
                    background: vignette ? `hsl(${selectedBg.accentColor} / 0.12)` : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${vignette ? `hsl(${selectedBg.accentColor} / 0.25)` : "hsl(0 0% 100% / 0.06)"}`,
                  }}
                >
                  <Eye size={12} /> Cinematic Vignette
                </button>
                <button
                  onClick={() => setAmbientParticles(!ambientParticles)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                    ambientParticles ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                  style={{
                    background: ambientParticles ? `hsl(${selectedBg.accentColor} / 0.12)` : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${ambientParticles ? `hsl(${selectedBg.accentColor} / 0.25)` : "hsl(0 0% 100% / 0.06)"}`,
                  }}
                >
                  <Sparkles size={12} /> Ambient Particles
                </button>
              </div>

              {/* Size Preset */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Size Preset</label>
                <div className="flex flex-wrap gap-1.5">
                  {sizePresets.map(sp => (
                    <button
                      key={sp.value}
                      onClick={() => setSizePreset(sp.value)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        sizePreset === sp.value ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                      style={{
                        background: sizePreset === sp.value ? `hsl(${selectedBg.accentColor} / 0.12)` : "hsl(0 0% 100% / 0.03)",
                        border: `1px solid ${sizePreset === sp.value ? `hsl(${selectedBg.accentColor} / 0.25)` : "hsl(0 0% 100% / 0.06)"}`,
                      }}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Env FX */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Environment Effects</label>
                <div className="space-y-1.5">
                  {selectedBg.envFx.map(fx => (
                    <div
                      key={fx}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.05)" }}
                    >
                      <Sparkles size={12} style={{ color: `hsl(${selectedBg.accentColor})` }} />
                      <span className="text-[12px] text-foreground font-medium">{fx}</span>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended settings */}
              <div
                className="rounded-xl p-3"
                style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.05)" }}
              >
                <p className="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Recommended OBS Settings</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-muted-foreground">Width: <span className="text-foreground font-medium">{sizePreset.split("x")[0]}px</span></span>
                  <span className="text-muted-foreground">Height: <span className="text-foreground font-medium">{sizePreset.split("x")[1]}px</span></span>
                  <span className="text-muted-foreground">FPS: <span className="text-foreground font-medium">30</span></span>
                  <span className="text-muted-foreground">Opacity: <span className="text-foreground font-medium">100%</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Overlay URLs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/20 p-5"
          style={{ background: "rgba(12,14,20,0.75)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} style={{ color: `hsl(${selectedBg.accentColor})` }} />
            <h3 className="text-sm font-heading font-bold text-foreground">Overlay URLs</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: "Primary Background", extra: "" },
              { label: "Background Only (no LED)", extra: "mode=preview" },
              { label: "LED Only (transparent)", extra: "mode=led" },
            ].map(url => {
              const fullUrl = buildUrl(selectedBg.id, url.extra);
              const isCopied = copied === url.label;
              return (
                <div key={url.label} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">{url.label}</p>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.06)" }}
                    >
                      <code className="text-[11px] text-foreground/70 font-mono truncate flex-1">
                        {fullUrl}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!canUseRoom(selectedBg)) {
                        toast.error("Upgrade to Pro to copy overlay URLs");
                        return;
                      }
                      copyUrl(fullUrl, url.label);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:-translate-y-0.5 mt-4 ${
                      isCopied ? "text-primary" : "text-foreground"
                    }`}
                    style={{
                      background: isCopied
                        ? "hsl(160 100% 45% / 0.1)"
                        : `hsl(${selectedBg.accentColor} / 0.1)`,
                      border: `1px solid ${isCopied ? "hsl(160 100% 45% / 0.2)" : `hsl(${selectedBg.accentColor} / 0.2)`}`,
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Selling Copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] text-muted-foreground/50">
            🔥 10 professionally animated studio rooms · Fully customizable LED sign · Instant OBS/TikTok LIVE Studio URLs · 2 Free, 8 Pro-exclusive
          </p>
        </motion.div>
      </div>
      </ProGate>
    </AppLayout>
  );
};

export default BackgroundsPage;
