import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultLikeAlertSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import LikeAlertPreview from "@/components/overlays/previews/LikeAlertPreview";

const LikeAlertOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("like_alert");
  const [testTrigger, setTestTrigger] = useState(0);

  const handleCreate = () => createWidget("like_alert", `Like Alert ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Heart size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Like Alerts</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(350 90% 55% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Like Alerts</h1>
            <p className="text-muted-foreground text-sm">Animated heart notifications when viewers like your stream.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(350 90% 55%), hsl(330 80% 50%))", color: "white", boxShadow: "0 0 25px hsl(350 90% 55% / 0.25)" }}>
            <Plus size={16} /> New Like Alert
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Heart size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Like Alerts yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first like alert overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(350 90% 55%), hsl(330 80% 50%))", color: "white" }}>
              <Plus size={16} /> Create Like Alert
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultLikeAlertSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultLikeAlertSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {
                      setTestTrigger(prev => prev + 1);
                      // Also broadcast to the live overlay channel
                      const ch = supabase.channel(`like-alert-${widget.public_token}`);
                      ch.send({ type: "broadcast", event: "like_alert", payload: { username: "TestUser", likeCount: 5, count: 5 } });
                      ch.send({ type: "broadcast", event: "test_alert", payload: {} });
                      setTimeout(() => supabase.removeChannel(ch), 2000);
                    }}
                    previewSlot={<Suspense fallback={null}><LikeAlertPreview settings={s} testTrigger={testTrigger} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Animation Style" description="Visual effect when likes appear">
                          <SettingSelect value={s.animation_style} onChange={v => set("animation_style", v)} options={[
                            { value: "hearts_rise", label: "Hearts Rise" },
                            { value: "pulse_burst", label: "Pulse Burst" },
                            { value: "neon_wave", label: "Neon Wave" },
                            { value: "sparkle_trail", label: "Sparkle Trail" },
                            { value: "vortex", label: "Vortex Spin" },
                            { value: "ripple_glow", label: "Ripple Glow" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Color Mode">
                          <SettingSelect value={s.color_mode} onChange={v => set("color_mode", v)} options={[
                            { value: "warm", label: "Warm Reds" },
                            { value: "cool", label: "Cool Blues" },
                            { value: "rainbow", label: "Rainbow" },
                            { value: "mono", label: "Monochrome" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Alert Duration"><SettingSlider value={s.duration} onChange={v => set("duration", v)} min={1} max={10} suffix="s" /></SettingRow>
                        <SettingRow label="Icon Size"><SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={24} max={96} suffix="px" /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Particle Count"><SettingSlider value={s.particle_count} onChange={v => set("particle_count", v)} min={0} max={30} /></SettingRow>
                        <SettingRow label="Show Like Count"><SettingToggle checked={s.show_count} onChange={v => set("show_count", v)} /></SettingRow>
                        <SettingRow label="Count Style">
                          <SettingSelect value={s.count_style} onChange={v => set("count_style", v)} options={[
                            { value: "animated", label: "Animated Pop" },
                            { value: "static", label: "Static" },
                            { value: "milestone", label: "Milestone Only" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Show Username"><SettingToggle checked={s.username_visible} onChange={v => set("username_visible", v)} /></SettingRow>
                        <SettingRow label="Combo Detection"><SettingToggle checked={s.combo_detection} onChange={v => set("combo_detection", v)} /></SettingRow>
                        <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Milestone Interval"><SettingSlider value={s.milestone_interval} onChange={v => set("milestone_interval", v)} min={10} max={1000} step={10} /></SettingRow>
                        <SettingRow label="Milestone Animation">
                          <SettingSelect value={s.milestone_animation} onChange={v => set("milestone_animation", v)} options={[
                            { value: "confetti", label: "Confetti" },
                            { value: "flash", label: "Screen Flash" },
                            { value: "shake", label: "Shake" },
                            { value: "explode", label: "Explode" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Entry Animation">
                          <SettingSelect value={s.entry_animation} onChange={v => set("entry_animation", v)} options={[
                            { value: "float_up", label: "Float Up" },
                            { value: "slide_in", label: "Slide In" },
                            { value: "scale_pop", label: "Scale Pop" },
                            { value: "spiral", label: "Spiral" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Queue System"><SettingToggle checked={s.queue_enabled} onChange={v => set("queue_enabled", v)} /></SettingRow>
                        <SettingRow label="Max on Screen"><SettingSlider value={s.max_on_screen} onChange={v => set("max_on_screen", v)} min={1} max={10} /></SettingRow>
                        <SettingRow label="Animation Speed"><SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.25} max={3} step={0.25} suffix="x" /></SettingRow>
                        <SettingRow label="Transparent BG"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                        <SettingRow label="FPS Limit">
                          <SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[{ value: "30", label: "30 FPS" }, { value: "60", label: "60 FPS" }]} />
                        </SettingRow>
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

export default LikeAlertOverlay;
