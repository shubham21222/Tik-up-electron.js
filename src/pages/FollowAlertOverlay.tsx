import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultFollowAlertSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import FollowAlertPreview from "@/components/overlays/previews/FollowAlertPreview";

const FollowAlertOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("follow_alert");
  const [testTrigger, setTestTrigger] = useState(0);

  const handleCreate = () => createWidget("follow_alert", `Follow Alert ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <UserPlus size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Follow Alerts</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Follow Alerts</h1>
            <p className="text-muted-foreground text-sm">Welcome new followers with animated notifications on stream.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(180 100% 40%))", color: "black", boxShadow: "0 0 25px hsl(160 100% 45% / 0.25)" }}>
            <Plus size={16} /> New Follow Alert
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <UserPlus size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Follow Alerts yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first follow alert overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(180 100% 40%))", color: "black" }}>
              <Plus size={16} /> Create Follow Alert
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultFollowAlertSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultFollowAlertSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => setTestTrigger(prev => prev + 1)}
                    previewSlot={<Suspense fallback={null}><FollowAlertPreview settings={s} testTrigger={testTrigger} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Animation Style">
                          <SettingSelect value={s.animation_style} onChange={v => set("animation_style", v)} options={[
                            { value: "spotlight", label: "Spotlight" },
                            { value: "badge_drop", label: "Badge Drop" },
                            { value: "neon_slide", label: "Neon Slide" },
                            { value: "hologram", label: "Hologram" },
                            { value: "portal", label: "Portal" },
                            { value: "glitch_in", label: "Glitch In" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Card Style">
                          <SettingSelect value={s.card_style} onChange={v => set("card_style", v)} options={[
                            { value: "glass", label: "Glass" },
                            { value: "solid", label: "Solid Dark" },
                            { value: "neon_border", label: "Neon Border" },
                            { value: "gradient", label: "Gradient" },
                            { value: "minimal", label: "Minimal" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Alert Duration"><SettingSlider value={s.duration} onChange={v => set("duration", v)} min={2} max={12} suffix="s" /></SettingRow>
                        <SettingRow label="Avatar Size"><SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={32} max={96} suffix="px" /></SettingRow>
                        <SettingRow label="Avatar Shape">
                          <SettingSelect value={s.avatar_style} onChange={v => set("avatar_style", v)} options={[
                            { value: "circle", label: "Circle" },
                            { value: "hexagon", label: "Hexagon" },
                            { value: "rounded_square", label: "Rounded Square" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Show Avatar"><SettingToggle checked={s.show_avatar} onChange={v => set("show_avatar", v)} /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Welcome Text">
                          <input value={s.welcome_text} onChange={e => set("welcome_text", e.target.value)}
                            className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 w-[160px]" />
                        </SettingRow>
                        <SettingRow label="Username Font">
                          <SettingSelect value={s.username_font} onChange={v => set("username_font", v)} options={[
                            { value: "heading", label: "Heading" },
                            { value: "sans", label: "Sans" },
                            { value: "mono", label: "Monospace" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Follow Counter"><SettingToggle checked={s.counter_visible} onChange={v => set("counter_visible", v)} /></SettingRow>
                        <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Streak Detection"><SettingToggle checked={s.streak_detection} onChange={v => set("streak_detection", v)} /></SettingRow>
                        <SettingRow label="Streak Threshold"><SettingSlider value={s.streak_threshold} onChange={v => set("streak_threshold", v)} min={2} max={10} /></SettingRow>
                        <SettingRow label="Streak Animation">
                          <SettingSelect value={s.streak_animation} onChange={v => set("streak_animation", v)} options={[
                            { value: "rainbow", label: "Rainbow" },
                            { value: "shake", label: "Shake" },
                            { value: "grow", label: "Grow" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Entry Animation">
                          <SettingSelect value={s.entry_animation} onChange={v => set("entry_animation", v)} options={[
                            { value: "drop_bounce", label: "Drop Bounce" },
                            { value: "slide_right", label: "Slide Right" },
                            { value: "zoom_in", label: "Zoom In" },
                            { value: "typewriter", label: "Typewriter" },
                            { value: "flip", label: "Flip" },
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

export default FollowAlertOverlay;
