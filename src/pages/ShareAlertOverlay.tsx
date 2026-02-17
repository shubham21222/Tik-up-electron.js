import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultShareAlertSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import ShareAlertPreview from "@/components/overlays/previews/ShareAlertPreview";

const ShareAlertOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("share_alert");

  const handleCreate = () => createWidget("share_alert", `Share Alert ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Share2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Share Alerts</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(200 100% 55% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Share Alerts</h1>
            <p className="text-muted-foreground text-sm">Celebrate when viewers share your stream with animated alerts.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(220 100% 50%))", color: "white", boxShadow: "0 0 25px hsl(200 100% 55% / 0.25)" }}>
            <Plus size={16} /> New Share Alert
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Share2 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Share Alerts yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first share alert overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(220 100% 50%))", color: "white" }}>
              <Plus size={16} /> Create Share Alert
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultShareAlertSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultShareAlertSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {}}
                    previewSlot={<Suspense fallback={null}><ShareAlertPreview settings={s} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Animation Style" description="Visual effect when shares happen">
                          <SettingSelect value={s.animation_style} onChange={v => set("animation_style", v)} options={[
                            { value: "rocket_launch", label: "Rocket Launch" },
                            { value: "shockwave", label: "Shockwave" },
                            { value: "neon_burst", label: "Neon Burst" },
                            { value: "paper_plane", label: "Paper Plane" },
                            { value: "warp_speed", label: "Warp Speed" },
                            { value: "sonic_boom", label: "Sonic Boom" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Card Style">
                          <SettingSelect value={s.card_style} onChange={v => set("card_style", v)} options={[
                            { value: "cyber", label: "Cyber" },
                            { value: "glass", label: "Glass" },
                            { value: "minimal", label: "Minimal" },
                            { value: "gradient", label: "Gradient" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Alert Duration"><SettingSlider value={s.duration} onChange={v => set("duration", v)} min={2} max={12} suffix="s" /></SettingRow>
                        <SettingRow label="Icon Size"><SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={32} max={96} suffix="px" /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Show Share Count"><SettingToggle checked={s.show_share_count} onChange={v => set("show_share_count", v)} /></SettingRow>
                        <SettingRow label="Show Username"><SettingToggle checked={s.username_visible} onChange={v => set("username_visible", v)} /></SettingRow>
                        <SettingRow label="Batch Detection" description="Detect rapid shares"><SettingToggle checked={s.batch_detection} onChange={v => set("batch_detection", v)} /></SettingRow>
                        <SettingRow label="Batch Threshold"><SettingSlider value={s.batch_threshold} onChange={v => set("batch_threshold", v)} min={2} max={20} /></SettingRow>
                        <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Milestone Triggers"><SettingToggle checked={s.milestone_triggers} onChange={v => set("milestone_triggers", v)} /></SettingRow>
                        <SettingRow label="Milestone Interval"><SettingSlider value={s.milestone_interval} onChange={v => set("milestone_interval", v)} min={10} max={500} step={10} /></SettingRow>
                        <SettingRow label="Milestone Animation">
                          <SettingSelect value={s.milestone_animation} onChange={v => set("milestone_animation", v)} options={[
                            { value: "explosion", label: "Explosion" },
                            { value: "fireworks", label: "Fireworks" },
                            { value: "rainbow_wave", label: "Rainbow Wave" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Entry Animation">
                          <SettingSelect value={s.entry_animation} onChange={v => set("entry_animation", v)} options={[
                            { value: "burst", label: "Burst" },
                            { value: "slide", label: "Slide" },
                            { value: "zoom", label: "Zoom" },
                            { value: "spiral", label: "Spiral" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Queue System"><SettingToggle checked={s.queue_enabled} onChange={v => set("queue_enabled", v)} /></SettingRow>
                        <SettingRow label="Max on Screen"><SettingSlider value={s.max_on_screen} onChange={v => set("max_on_screen", v)} min={1} max={5} /></SettingRow>
                        <SettingRow label="Animation Speed"><SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.25} max={3} step={0.25} suffix="x" /></SettingRow>
                        <SettingRow label="Transparent BG"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                        <div>
                          <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                          <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                            className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" />
                        </div>
                      </div>
                    }
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ShareAlertOverlay;
