import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultCircularProfileWidgetSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import CircularProfileWidgetPreview from "@/components/overlays/previews/CircularProfileWidgetPreview";

const CircularProfileWidgetOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("circular_profile_widget");

  const handleCreate = async () => {
    await createWidget("circular_profile_widget", `Circular Profile Widget ${widgets.length + 1}`);
  };

  const updateSetting = useCallback((id: string, currentSettings: Record<string, any>, key: string, value: any) => {
    updateSettings(id, { ...currentSettings, [key]: value });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Circular Profile Widgets</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(45 100% 58% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Circular Profile Widget</h1>
            <p className="text-muted-foreground text-sm">Rotating circular widget showcasing your top gifters with animated rings and glow effects.</p>
          </div>
          <button onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(45 100% 58%), hsl(45 80% 48%))", color: "white", boxShadow: "0 0 25px hsl(45 100% 58% / 0.25)" }}>
            <Plus size={16} /> New Overlay
          </button>
        </motion.div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(45 40% 8% / 0.6), hsl(45 20% 6% / 0.4))" }}>
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid hsl(45 100% 58% / 0.2)" }}>
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: "1px dashed hsl(45 100% 58% / 0.4)" }}
                  animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
                <span className="text-4xl">👑</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-heading font-bold text-foreground">How Circular Profile Widget Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  ["1", "Create", "a Circular Profile Widget above"],
                  ["2", "Copy URL", "and add as OBS Browser Source"],
                  ["3", "Go live", "— top gifters rotate through the widget live"],
                ].map(([num, bold, rest]) => (
                  <div key={num} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "hsl(45 100% 58% / 0.15)", color: "hsl(45 100% 75%)" }}>{num}</span>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">{bold}</span> {rest}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Users size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Circular Profile Widgets yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first circular profile widget overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 58%), hsl(45 80% 48%))", color: "white" }}>
              <Plus size={16} /> Create Widget
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultCircularProfileWidgetSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell
                    key={widget.id}
                    widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultCircularProfileWidgetSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {
                      supabase.channel(`circular-profile-${widget.public_token}`)
                        .send({ type: "broadcast", event: "test_event", payload: {} });
                    }}
                    previewSlot={
                      <Suspense fallback={null}>
                        <CircularProfileWidgetPreview />
                      </Suspense>
                    }
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Accent Color" description="Ring and glow color">
                          <SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} />
                        </SettingRow>
                        <SettingRow label="Glow Intensity">
                          <SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                        <SettingRow label="Leaderboard Type" description="Which metric to rank viewers by">
                          <SettingSelect value={s.leaderboard_type} onChange={v => set("leaderboard_type", v)} options={[
                            { value: "gifters", label: "🎁 Top Gifters" },
                            { value: "likers", label: "❤️ Top Likers" },
                            { value: "fans", label: "⭐ Top Fans" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Max Profiles" description="How many top viewers to cycle through">
                          <SettingSlider value={s.max_profiles} onChange={v => set("max_profiles", v)} min={2} max={10} />
                        </SettingRow>
                        <SettingRow label="Rotation Speed" description="Seconds between profile switches">
                          <SettingSlider value={s.rotation_speed} onChange={v => set("rotation_speed", v)} min={1} max={10} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Wheel Segments">
                          <SettingSlider value={s.wheel_segments} onChange={v => set("wheel_segments", v)} min={4} max={12} />
                        </SettingRow>
                        <SettingRow label="Show Rank">
                          <SettingToggle checked={s.show_rank} onChange={v => set("show_rank", v)} />
                        </SettingRow>
                        <SettingRow label="Show Coin Count">
                          <SettingToggle checked={s.show_coins} onChange={v => set("show_coins", v)} />
                        </SettingRow>
                        <SettingRow label="Show Username">
                          <SettingToggle checked={s.show_username} onChange={v => set("show_username", v)} />
                        </SettingRow>
                        <SettingRow label="Transparent Background">
                          <SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} />
                        </SettingRow>
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

export default CircularProfileWidgetOverlay;
