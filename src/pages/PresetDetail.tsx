import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Zap, Gamepad2, Camera, MessageCircle, Check, Copy, ArrowLeft, ExternalLink, Power } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";

interface PresetFeature {
  name: string;
  description: string;
  overlayPath: string;
  settingsPath: string;
  enabled: boolean;
}

interface PresetConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Zap;
  color: string;
  features: PresetFeature[];
}

const presetConfigs: Record<string, PresetConfig> = {
  hype: {
    id: "hype",
    name: "Hype Mode",
    tagline: "Maximum energy for high-gift streams",
    description: "Everything turned up. Big reactions, fireworks, sound alerts, and a live leaderboard to keep your top supporters visible.",
    icon: Zap,
    color: "350 90% 55%",
    features: [
      { name: "Gift Fireworks", description: "Explosive particle effects when big gifts land", overlayPath: "gift-firework", settingsPath: "/gift-firework", enabled: false },
      { name: "Gift Combo Counter", description: "Stacking combo counter for rapid gift chains", overlayPath: "gift-combo", settingsPath: "/gift-combo", enabled: false },
      { name: "Sound Alerts", description: "Custom sound effects triggered by gifts and follows", overlayPath: "tts", settingsPath: "/sounds", enabled: false },
      { name: "Like Burst Animation", description: "Heart explosion on like milestones", overlayPath: "like-alert", settingsPath: "/like-alerts", enabled: false },
      { name: "Top Supporters Board", description: "Live leaderboard of biggest gifters", overlayPath: "leaderboard", settingsPath: "/leaderboard", enabled: false },
      { name: "Gift Alert Banner", description: "Animated banner for every gift received", overlayPath: "gift-alert", settingsPath: "/actions", enabled: false },
    ],
  },
  gaming: {
    id: "gaming",
    name: "Gaming Mode",
    tagline: "Clean & minimal — no distractions",
    description: "Subtle alerts tucked into corners. Viewer count, timer, and chat overlay that stays out of the way while you play.",
    icon: Gamepad2,
    color: "160 100% 45%",
    features: [
      { name: "Corner Gift Alerts", description: "Compact gift notifications in the corner", overlayPath: "gift-alert", settingsPath: "/actions", enabled: false },
      { name: "Viewer Count", description: "Live viewer number in a minimal badge", overlayPath: "viewer-count", settingsPath: "/viewer-count", enabled: false },
      { name: "Stream Timer", description: "Elapsed time counter for your session", overlayPath: "stream-timer", settingsPath: "/stream-timer", enabled: false },
      { name: "Chat Box", description: "Floating chat overlay on screen", overlayPath: "chat-box", settingsPath: "/chat-overlay", enabled: false },
      { name: "Webcam Frame", description: "Animated frame around your camera feed", overlayPath: "webcam-frame", settingsPath: "/webcam-frame", enabled: false },
      { name: "Stream Border", description: "Themed animated border around your stream", overlayPath: "stream-border", settingsPath: "/stream-border", enabled: false },
    ],
  },
  irl: {
    id: "irl",
    name: "IRL Mode",
    tagline: "Lightweight for outdoor & mobile streams",
    description: "Only the essentials. Chat, timer, and follow goal — nothing heavy that kills mobile battery or clutters your view.",
    icon: Camera,
    color: "45 100% 55%",
    features: [
      { name: "Chat Box", description: "Floating chat overlay on screen", overlayPath: "chat-box", settingsPath: "/chat-overlay", enabled: false },
      { name: "Stream Timer", description: "How long you've been live", overlayPath: "stream-timer", settingsPath: "/stream-timer", enabled: false },
      { name: "Follower Goal", description: "Visual progress bar toward follower target", overlayPath: "follower-goal", settingsPath: "/goal-overlays", enabled: false },
      { name: "Social Rotator", description: "Rotating social media handles on screen", overlayPath: "social-rotator", settingsPath: "/social-rotator", enabled: false },
      { name: "Follow Alert", description: "Subtle pop when someone follows", overlayPath: "follow-alert", settingsPath: "/follow-alerts", enabled: false },
    ],
  },
  talkshow: {
    id: "talkshow",
    name: "Talk Show Mode",
    tagline: "Professional layout for interviews & chats",
    description: "Text-to-speech, polls, and a leaderboard front and center. Perfect for Q&A sessions, interviews, and audience-driven content.",
    icon: MessageCircle,
    color: "280 100% 65%",
    features: [
      { name: "Text-to-Speech", description: "Viewers' messages read aloud on stream", overlayPath: "tts", settingsPath: "/tts", enabled: false },
      { name: "Top Supporters Board", description: "Live leaderboard of your biggest fans", overlayPath: "leaderboard", settingsPath: "/leaderboard", enabled: false },
      { name: "Like Counter", description: "Big animated like counter on screen", overlayPath: "like-counter", settingsPath: "/like-counter", enabled: false },
      { name: "Custom Text", description: "Custom text banners and tickers", overlayPath: "custom-text", settingsPath: "/custom-text", enabled: false },
      { name: "Promo Overlay", description: "Branded promo card shown on schedule", overlayPath: "promo", settingsPath: "/promo-overlay", enabled: false },
      { name: "Ticker", description: "Scrolling news-style text bar", overlayPath: "ticker", settingsPath: "/ticker", enabled: false },
    ],
  },
};

const PresetDetail = () => {
  const { presetId } = useParams<{ presetId: string }>();
  const navigate = useNavigate();
  const preset = presetConfigs[presetId || ""];
  const [features, setFeatures] = useState<PresetFeature[]>(preset?.features || []);
  const [activating, setActivating] = useState(false);

  if (!preset) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Theme not found.</p>
        </div>
      </AppLayout>
    );
  }

  const Icon = preset.icon;
  const enabledCount = features.filter(f => f.enabled).length;

  const toggleFeature = (idx: number) => {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, enabled: !f.enabled } : f));
  };

  const handleActivate = async () => {
    setActivating(true);
    await new Promise(r => setTimeout(r, 1500));
    setActivating(false);
    toast.success(`${preset.name} activated! ${enabledCount} overlays configured.`);
  };

  const copyUrl = (overlayPath: string) => {
    const url = `${getOverlayBaseUrl()}/overlay/${overlayPath}/YOUR_TOKEN`;
    copyToClipboard(url, "Overlay URL copied!");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12 relative z-10">
        {/* Ambient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: `radial-gradient(ellipse, hsl(${preset.color} / 0.06), transparent 70%)` }} />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/presets")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Themes
        </motion.button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-[1px] mb-8"
          style={{ background: `linear-gradient(135deg, hsl(${preset.color} / 0.3), hsl(${preset.color} / 0.05))` }}
        >
          <div className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background: "rgba(20,25,35,0.85)", backdropFilter: "blur(24px)" }}>
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, hsl(${preset.color} / 0.08), transparent 70%)` }} />
            <div className="relative z-10 flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `hsl(${preset.color} / 0.12)`, border: `1px solid hsl(${preset.color} / 0.2)` }}>
                <Icon size={30} style={{ color: `hsl(${preset.color})` }} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold text-foreground mb-1">{preset.name}</h1>
                <p className="text-sm font-medium mb-3" style={{ color: `hsl(${preset.color})` }}>{preset.tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{preset.description}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-foreground">Suggested Features</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `hsl(${preset.color} / 0.1)`, color: `hsl(${preset.color})` }}>
              {enabledCount}/{features.length} enabled
            </span>
          </div>

          <div className="space-y-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="rounded-xl p-[1px]"
                style={{
                  background: feature.enabled
                    ? `linear-gradient(135deg, hsl(${preset.color} / 0.15), hsl(${preset.color} / 0.03))`
                    : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                }}
              >
                <div className="rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(16px)" }}>
                  
                  {/* Toggle */}
                  <button
                    onClick={() => toggleFeature(i)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: feature.enabled ? `hsl(${preset.color} / 0.15)` : "hsl(var(--muted) / 0.3)",
                      border: `1px solid ${feature.enabled ? `hsl(${preset.color} / 0.3)` : "transparent"}`,
                    }}
                  >
                    {feature.enabled ? (
                      <Check size={16} style={{ color: `hsl(${preset.color})` }} />
                    ) : (
                      <Power size={14} className="text-muted-foreground" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold ${feature.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                      {feature.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={feature.settingsPath}
                      className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => copyUrl(feature.overlayPath)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                      style={{ background: `hsl(${preset.color} / 0.1)`, color: `hsl(${preset.color})` }}
                    >
                      <Copy size={10} /> URL
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Overlay URLs Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <h2 className="text-lg font-heading font-bold text-foreground mb-4">OBS / TikTok LIVE Studio URLs</h2>
          <div className="rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(16px)" }}>
              {features.filter(f => f.enabled).map(feature => {
                const url = `${getOverlayBaseUrl()}/overlay/${feature.overlayPath}/YOUR_TOKEN`;
                return (
                  <div key={feature.name} className="flex items-center gap-3">
                    <ExternalLink size={12} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{feature.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{url}</p>
                    </div>
                    <button
                      onClick={() => copyUrl(feature.overlayPath)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                );
              })}
              {features.filter(f => f.enabled).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Enable features above to see their overlay URLs</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activate Button */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <button
            onClick={handleActivate}
            disabled={activating || enabledCount === 0}
            className="w-full py-4 rounded-2xl text-sm font-bold transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, hsl(${preset.color}), hsl(${preset.color} / 0.7))`,
              color: "white",
              boxShadow: `0 8px 32px hsl(${preset.color} / 0.25)`,
            }}
          >
            {activating ? "Activating..." : `Activate ${preset.name} — ${enabledCount} Features`}
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default PresetDetail;
