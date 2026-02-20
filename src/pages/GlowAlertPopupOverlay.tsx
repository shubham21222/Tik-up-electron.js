import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultGlowAlertPopupSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import GlowAlertPopupPreview from "@/components/overlays/previews/GlowAlertPopupPreview";

const GlowAlertPopupOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("glow_alert_popup");

  const handleCreate = async () => {
    await createWidget("glow_alert_popup", `Glow Alert Popup ${widgets.length + 1}`);
  };

  const updateSetting = useCallback((id: string, currentSettings: Record<string, any>, key: string, value: any) => {
    updateSettings(id, { ...currentSettings, [key]: value });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Bell size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Glow Alert Popups</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(350 90% 60% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Glow Alert Popup</h1>
            <p className="text-muted-foreground text-sm">High-impact pop-in notification box with animated glow border and icon ring.</p>
          </div>
          <button onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(350 90% 60%), hsl(350 70% 50%))", color: "white", boxShadow: "0 0 25px hsl(350 90% 60% / 0.25)" }}>
            <Plus size={16} /> New Overlay
          </button>
        </motion.div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(350 40% 8% / 0.6), hsl(350 20% 6% / 0.4))" }}>
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-sm flex items-center justify-center relative overflow-hidden"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid hsl(350 90% 60% / 0.2)" }}>
                <div className="absolute top-0 left-0 w-3 h-0.5" style={{ background: "hsl(350 90% 60%)" }} />
                <div className="absolute top-0 left-0 w-0.5 h-3" style={{ background: "hsl(350 90% 60%)" }} />
                <div className="absolute bottom-0 right-0 w-3 h-0.5" style={{ background: "hsl(350 90% 60%)" }} />
                <div className="absolute bottom-0 right-0 w-0.5 h-3" style={{ background: "hsl(350 90% 60%)" }} />
                <motion.span className="text-4xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>🔔</motion.span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-heading font-bold text-foreground">How Glow Alert Popup Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  ["1", "Create", "a Glow Alert Popup above"],
                  ["2", "Copy URL", "and paste into OBS as Browser Source"],
                  ["3", "Go live", "— gifts and follows trigger the pop-in alert"],
                ].map(([num, bold, rest]) => (
                  <div key={num} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "hsl(350 90% 60% / 0.15)", color: "hsl(350 90% 75%)" }}>{num}</span>
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
            <Bell size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Glow Alert Popups yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first glow alert popup overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(350 90% 60%), hsl(350 70% 50%))", color: "white" }}>
              <Plus size={16} /> Create Glow Alert Popup
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultGlowAlertPopupSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell
                    key={widget.id}
                    widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultGlowAlertPopupSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {
                      supabase.channel(`glow-alert-popup-${widget.public_token}`)
                        .send({ type: "broadcast", event: "test_alert", payload: {} });
                    }}
                    previewSlot={
                      <Suspense fallback={null}>
                        <GlowAlertPopupPreview />
                      </Suspense>
                    }
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Accent Color" description="Glow border and label color">
                          <SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} />
                        </SettingRow>
                        <SettingRow label="Glow Intensity" description="Border and background glow strength">
                          <SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                        <SettingRow label="Alert Duration" description="How long the popup stays visible">
                          <SettingSlider value={s.duration} onChange={v => set("duration", v)} min={1} max={15} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Entry Animation">
                          <SettingSelect value={s.entry_animation} onChange={v => set("entry_animation", v)} options={[
                            { value: "pop", label: "💥 Pop In" },
                            { value: "slide_down", label: "⬇ Slide Down" },
                            { value: "fade", label: "✨ Fade In" },
                            { value: "bounce", label: "🎯 Bounce" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Corner Style">
                          <SettingSelect value={s.corner_style} onChange={v => set("corner_style", v)} options={[
                            { value: "tech", label: "⚡ Tech Corners" },
                            { value: "rounded", label: "🔵 Rounded" },
                            { value: "sharp", label: "🔷 Sharp" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Icon Size">
                          <SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={24} max={80} suffix="px" />
                        </SettingRow>
                        <SettingRow label="Show Icon">
                          <SettingToggle checked={s.show_icon} onChange={v => set("show_icon", v)} />
                        </SettingRow>
                        <SettingRow label="Show Label Bar">
                          <SettingToggle checked={s.show_label} onChange={v => set("show_label", v)} />
                        </SettingRow>
                        <SettingRow label="Scan Line Effect">
                          <SettingToggle checked={s.scan_line} onChange={v => set("scan_line", v)} />
                        </SettingRow>
                        <SettingRow label="Rotating Ring">
                          <SettingToggle checked={s.ring_animation} onChange={v => set("ring_animation", v)} />
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

export default GlowAlertPopupOverlay;
