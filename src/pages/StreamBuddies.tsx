import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Copy, ExternalLink, Settings, Eye, Gamepad2,
  Sparkles, MessageSquare, Shield, Crown, Zap
} from "lucide-react";
import { useOverlayWidgets, type OverlayWidget } from "@/hooks/use-overlay-widgets";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import ProGate from "@/components/ProGate";

const THEMES = [
  { id: "pixel", label: "Pixel Heroes", emoji: "⚔️", desc: "Classic retro pixel-art characters" },
  { id: "chibi", label: "Chibi Cuties", emoji: "🎀", desc: "Adorable chibi-style characters" },
  { id: "cyber", label: "Cyber Bots", emoji: "🤖", desc: "Futuristic robot companions" },
  { id: "fantasy", label: "Fantasy Beasts", emoji: "🐉", desc: "Mythical creatures & heroes" },
];

const TIER_INFO = [
  { tier: "Common", range: "1–49 coins", color: "160 100% 45%", img: "/buddies/common.png" },
  { tier: "Rare", range: "50–499 coins", color: "200 100% 55%", img: "/buddies/rare.png" },
  { tier: "Epic", range: "500–4999 coins", color: "280 100% 65%", img: "/buddies/epic.png" },
  { tier: "Legendary", range: "5000+ coins", color: "45 100% 55%", img: "/buddies/legendary.png" },
];

const StreamBuddiesPage = () => {
  const { user } = useAuth();
  const { widgets, createWidget, updateSettings, loading } = useOverlayWidgets("stream_buddies");
  const [widget, setWidget] = useState<OverlayWidget | null>(null);

  useEffect(() => {
    if (widgets.length > 0) setWidget(widgets[0]);
  }, [widgets]);

  const handleCreate = async () => {
    const w = await createWidget("stream_buddies", "Stream Buddies");
    if (w) setWidget(w);
  };

  const settings = widget?.settings || {};

  const updateSetting = (key: string, value: any) => {
    if (!widget) return;
    const newSettings = { ...settings, [key]: value };
    setWidget({ ...widget, settings: newSettings });
    updateSettings(widget.id, newSettings);
  };

  const overlayUrl = widget ? `https://tikup.xyz/overlay/stream-buddies/${widget.public_token}` : "";

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to use Stream Buddies</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProGate feature="Stream Buddies">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(280 100% 65% / 0.1)" }}>
                <Gamepad2 size={20} style={{ color: "hsl(280 100% 65%)" }} />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Stream Buddies</h1>
                <p className="text-sm text-muted-foreground">Animated avatars that run across your stream — powered by gifts.</p>
              </div>
            </div>
          </motion.div>

          {/* Tier Preview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <div className="rounded-2xl border border-white/[0.04] p-5" style={{ background: "linear-gradient(180deg, hsl(210 20% 8% / 0.85), hsl(210 15% 6% / 0.9))" }}>
              <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Crown size={12} /> Avatar Tiers
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {TIER_INFO.map((t, i) => (
                  <motion.div
                    key={t.tier}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-xl p-3 text-center border border-white/[0.04]"
                    style={{ background: `hsl(${t.color} / 0.05)` }}
                  >
                    <motion.img
                      src={t.img}
                      alt={t.tier}
                      className="w-14 h-14 mx-auto mb-2 object-contain"
                      style={{ imageRendering: "pixelated" }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                    <p className="text-xs font-bold" style={{ color: `hsl(${t.color})` }}>{t.tier}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.range}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {!widget && !loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "hsl(160 100% 45%)", color: "black" }}
              >
                Enable Stream Buddies
              </button>
            </motion.div>
          ) : widget ? (
            <div className="space-y-4">
              {/* OBS URL */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="rounded-2xl border border-white/[0.04] p-5" style={{ background: "linear-gradient(180deg, hsl(210 20% 8% / 0.85), hsl(210 15% 6% / 0.9))" }}>
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink size={12} /> OBS Browser Source URL
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] text-foreground/70 bg-black/30 rounded-lg px-3 py-2 truncate font-mono">
                      {overlayUrl}
                    </code>
                    <button
                      onClick={() => { copyToClipboard(overlayUrl); toast.success("Copied!"); }}
                      className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      style={{ background: "hsl(160 100% 45% / 0.1)", color: "hsl(160 100% 55%)" }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Width: 1920 · Height: 1080 · No custom CSS needed</p>
                </div>
              </motion.div>

              {/* Settings */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="rounded-2xl border border-white/[0.04] p-5 space-y-5" style={{ background: "linear-gradient(180deg, hsl(210 20% 8% / 0.85), hsl(210 15% 6% / 0.9))" }}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Settings size={12} /> Settings
                  </h3>

                  {/* Theme */}
                  <div>
                    <label className="text-xs font-semibold text-foreground/70 mb-2 block">Avatar Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => updateSetting("theme", t.id)}
                          className="rounded-xl p-3 text-left border transition-all"
                          style={{
                            background: (settings.theme || "pixel") === t.id ? "hsl(280 100% 65% / 0.1)" : "rgba(255,255,255,0.02)",
                            borderColor: (settings.theme || "pixel") === t.id ? "hsl(280 100% 65% / 0.3)" : "rgba(255,255,255,0.04)",
                          }}
                        >
                          <span className="text-lg mr-1">{t.emoji}</span>
                          <span className="text-xs font-bold text-foreground">{t.label}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Avatars */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground/70">Max Avatars on Screen</label>
                      <span className="text-xs font-bold text-primary">{settings.max_avatars || 15}</span>
                    </div>
                    <Slider
                      value={[settings.max_avatars || 15]}
                      min={3}
                      max={30}
                      step={1}
                      onValueChange={([v]) => updateSetting("max_avatars", v)}
                    />
                  </div>

                  {/* Min Gift Coins */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground/70">Min Gift to Spawn (coins)</label>
                      <span className="text-xs font-bold text-primary">{settings.min_gift_coins || 1}</span>
                    </div>
                    <Slider
                      value={[settings.min_gift_coins || 1]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateSetting("min_gift_coins", v)}
                    />
                  </div>

                  {/* Avatar Speed */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground/70">Avatar Speed</label>
                      <span className="text-xs font-bold text-primary">{(settings.avatar_speed || 1).toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[settings.avatar_speed || 1]}
                      min={0.3}
                      max={3}
                      step={0.1}
                      onValueChange={([v]) => updateSetting("avatar_speed", v)}
                    />
                  </div>

                  {/* Spawn Cooldown */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground/70">Spawn Cooldown</label>
                      <span className="text-xs font-bold text-primary">{settings.spawn_cooldown || 3}s</span>
                    </div>
                    <Slider
                      value={[settings.spawn_cooldown || 3]}
                      min={0}
                      max={15}
                      step={1}
                      onValueChange={([v]) => updateSetting("spawn_cooldown", v)}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground/70">Show Chat Bubbles</span>
                      </div>
                      <Switch
                        checked={settings.show_chat_bubbles !== false}
                        onCheckedChange={(v) => updateSetting("show_chat_bubbles", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground/70">Show Usernames</span>
                      </div>
                      <Switch
                        checked={settings.show_usernames !== false}
                        onCheckedChange={(v) => updateSetting("show_usernames", v)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="rounded-2xl border border-white/[0.04] p-5" style={{ background: "linear-gradient(180deg, hsl(210 20% 8% / 0.85), hsl(210 15% 6% / 0.9))" }}>
                  <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Zap, label: "Gift Reactions", desc: "Avatars jump & evolve on gifts" },
                      { icon: Crown, label: "King of Stream", desc: "Top gifter gets crown + title" },
                      { icon: MessageSquare, label: "Chat Bubbles", desc: "Messages appear above avatars" },
                      { icon: Sparkles, label: "Tier Evolution", desc: "Bigger gifts = rarer avatars" },
                      { icon: Shield, label: "Moderation", desc: "Profanity filtered on bubbles" },
                      { icon: Users, label: "Physics Engine", desc: "Walk, jump, and collide" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02]">
                        <f.icon size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{f.label}</p>
                          <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </ProGate>
    </AppLayout>
  );
};

export default StreamBuddiesPage;
