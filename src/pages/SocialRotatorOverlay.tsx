import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Plus, Pencil, EyeOff, Trash2, Copy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultSocialRotatorSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "sonner";

const platforms = [
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "350 90% 55%" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "320 80% 55%" },
  { id: "twitter", name: "Twitter/X", icon: "🐦", color: "200 90% 55%" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "0 80% 50%" },
  { id: "twitch", name: "Twitch", icon: "🎮", color: "260 80% 60%" },
  { id: "discord", name: "Discord", icon: "💬", color: "235 86% 65%" },
  { id: "kick", name: "Kick", icon: "🟢", color: "160 100% 45%" },
];

const SocialRotatorOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("social_rotator");

  const handleCreate = async () => { await createWidget("social_rotator", `Social Rotator ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Share2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Social Rotators</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Social Media Rotator</h1><PageHelpButton featureKey="social_rotator" /></div>
            <p className="text-muted-foreground text-sm">Manage your social media profiles for the overlay rotator</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> Add Profile
          </button>
        </motion.div>

        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Share2 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Social Rotators yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              <Plus size={16} /> Create
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>{widgets.map(widget => {
              const s = { ...defaultSocialRotatorSettings, ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              const overlayUrl = `${getOverlayBaseUrl()}/overlay/social-rotator/${widget.public_token}`;
              return (
                <motion.div key={widget.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <OverlaySettingsShell widget={widget}
                    onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultSocialRotatorSettings)}
                    onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                    previewSlot={
                      <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl">
                        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08]">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <p className="text-sm font-bold text-white">@streamer</p>
                            <p className="text-[10px] text-primary flex items-center gap-1">✅ Following</p>
                          </div>
                        </div>
                      </div>
                    }
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Rotation Speed"><SettingSlider value={s.rotation_speed} onChange={v => set("rotation_speed", v)} min={2} max={15} suffix="s" /></SettingRow>
                        <SettingRow label="Icon Size"><SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={32} max={80} suffix="px" /></SettingRow>
                        <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={12} max={32} suffix="px" /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Glass Background"><SettingToggle checked={s.glass_bg} onChange={v => set("glass_bg", v)} /></SettingRow>
                        <SettingRow label="Show Indicators"><SettingToggle checked={s.show_indicators} onChange={v => set("show_indicators", v)} /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                        <SettingRow label="FPS Limit"><SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[
                          { value: "30", label: "30 FPS" }, { value: "60", label: "60 FPS" }]} /></SettingRow>
                        <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                          <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                            className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" /></div>
                      </div>
                    }
                  />

                  {/* Your Profiles Section */}
                  <div className="mt-4 rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
                    <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                      <h3 className="text-sm font-heading font-bold text-foreground mb-4">Your Profiles</h3>
                      <div className="divide-y divide-border/30">
                        {platforms.map(platform => (
                          <div key={platform.id} className="flex items-center justify-between py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-xl w-8 text-center">{platform.icon}</span>
                              <div>
                                <p className="text-sm font-heading font-bold text-foreground">{platform.name}</p>
                                <p className="text-xs text-primary">@streamer</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: "hsl(200 80% 50% / 0.15)", color: "hsl(200 80% 55%)" }}>
                                <Pencil size={13} />
                              </button>
                              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: "hsl(45 90% 50% / 0.15)", color: "hsl(45 90% 55%)" }}>
                                <EyeOff size={13} />
                              </button>
                              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: "hsl(350 80% 50% / 0.15)", color: "hsl(350 80% 55%)" }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}</AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SocialRotatorOverlay;
