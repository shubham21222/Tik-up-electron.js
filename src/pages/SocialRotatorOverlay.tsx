import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Plus, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultSocialRotatorSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import SocialPlatformIcon from "@/components/overlays/SocialPlatformIcon";
import { toast } from "sonner";

const platforms = [
  { id: "tiktok", name: "TikTok", color: "350 90% 55%" },
  { id: "instagram", name: "Instagram", color: "320 80% 55%" },
  { id: "twitter", name: "Twitter/X", color: "200 90% 55%" },
  { id: "youtube", name: "YouTube", color: "0 80% 50%" },
  { id: "twitch", name: "Twitch", color: "260 80% 60%" },
  { id: "discord", name: "Discord", color: "235 86% 65%" },
  { id: "kick", name: "Kick", color: "160 100% 45%" },
];

const SocialRotatorOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("social_rotator");
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCreate = async () => { await createWidget("social_rotator", `Social Rotator ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  const getHandle = (settings: any, platformId: string) => {
    const links: any[] = settings.social_links || [];
    const found = links.find((l: any) => l.id === platformId);
    return found?.handle || "";
  };

  const saveHandle = (widgetId: string, settings: any, platformId: string, handle: string) => {
    const links: any[] = [...(settings.social_links || [])];
    const idx = links.findIndex((l: any) => l.id === platformId);
    const platform = platforms.find(p => p.id === platformId)!;
    const entry = { id: platformId, label: platform.name, handle, color: platform.color, icon: platformId };
    if (idx >= 0) links[idx] = entry; else links.push(entry);
    updateSettings(widgetId, { ...settings, social_links: links });
    setEditingPlatform(null);
    toast.success("Handle saved");
  };

  const removeHandle = (widgetId: string, settings: any, platformId: string) => {
    const links: any[] = [...(settings.social_links || [])].filter((l: any) => l.id !== platformId);
    updateSettings(widgetId, { ...settings, social_links: links });
    toast.success("Handle removed");
  };

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
            <p className="text-muted-foreground text-sm">Showcase your socials on stream with a rotating overlay</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> New Rotator
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
              const activeSocials = (s.social_links || []).filter((l: any) => l.handle);
              const previewSocial = activeSocials[0];
              return (
                <motion.div key={widget.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <OverlaySettingsShell widget={widget}
                    onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultSocialRotatorSettings)}
                    onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                    previewSlot={
                      <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl overflow-hidden">
                        {previewSocial ? (
                          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08]"
                            style={{ boxShadow: `0 0 30px hsl(${previewSocial.color} / 0.15)` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: `hsl(${previewSocial.color} / 0.15)`, color: `hsl(${previewSocial.color})` }}>
                              <SocialPlatformIcon platform={previewSocial.id || previewSocial.icon} size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{previewSocial.label}</p>
                              <p className="text-[10px] font-semibold" style={{ color: `hsl(${previewSocial.color})` }}>{previewSocial.handle}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/50">Add handles below to preview</p>
                        )}
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
                        <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                        <SettingRow label="FPS Limit"><SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[
                          { value: "30", label: "30 FPS" }, { value: "60", label: "60 FPS" }]} /></SettingRow>
                      </div>
                    }
                  />

                  {/* Your Profiles Section */}
                  <div className="mt-4 rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}>
                    <div className="rounded-2xl p-6" style={{ background: "rgba(12,14,20,0.85)", backdropFilter: "blur(24px)" }}>
                      <h3 className="text-sm font-heading font-bold text-foreground mb-5 tracking-wide uppercase">Your Profiles</h3>
                      <div className="space-y-1">
                        {platforms.map(platform => {
                          const handle = getHandle(widget.settings, platform.id);
                          const isEditing = editingPlatform === `${widget.id}-${platform.id}`;
                          const editKey = `${widget.id}-${platform.id}`;
                          return (
                            <div key={platform.id}
                              className="flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                                  style={{
                                    background: `hsl(${platform.color} / 0.12)`,
                                    color: `hsl(${platform.color})`,
                                    boxShadow: handle ? `0 0 20px hsl(${platform.color} / 0.15)` : "none",
                                  }}>
                                  <SocialPlatformIcon platform={platform.id} size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-heading font-bold text-foreground tracking-wide">{platform.name}</p>
                                  {isEditing ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      <input
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter" && editValue.trim()) saveHandle(widget.id, widget.settings, platform.id, editValue.trim()); if (e.key === "Escape") setEditingPlatform(null); }}
                                        placeholder="@yourhandle"
                                        className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 w-44 font-medium"
                                      />
                                      <button onClick={() => { if (editValue.trim()) saveHandle(widget.id, widget.settings, platform.id, editValue.trim()); }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                                        <Check size={13} />
                                      </button>
                                      <button onClick={() => setEditingPlatform(null)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] transition-colors">
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ) : handle ? (
                                    <p className="text-xs font-semibold mt-0.5" style={{ color: `hsl(${platform.color})` }}>{handle}</p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground/40 mt-0.5">Not connected</p>
                                  )}
                                </div>
                              </div>
                              {!isEditing && (
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => { setEditingPlatform(editKey); setEditValue(handle); }}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                                    style={{ background: `hsl(${platform.color} / 0.12)`, color: `hsl(${platform.color})` }}
                                  >
                                    {handle ? "Edit" : "Add"}
                                  </button>
                                  {handle && (
                                    <button
                                      onClick={() => removeHandle(widget.id, widget.settings, platform.id)}
                                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
