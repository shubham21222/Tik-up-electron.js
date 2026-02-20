import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import GlowAlertPopupPreview from "@/components/overlays/previews/GlowAlertPopupPreview";
import ProGate from "@/components/ProGate";

const GlowAlertPopupOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("glow_alert_popup");
  const handleCreate = async () => { await createWidget("glow_alert_popup", `Glow Alert Popup ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Bell size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Glow Alert Popups</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Glow Alert Popup">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Glow Alert Popup</h1>
              <p className="text-muted-foreground text-sm">High-impact pop-in notification with animated glow border and scan-line effects.</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(350 90% 55%), hsl(320 90% 50%))", color: "white", boxShadow: "0 0 25px hsl(350 90% 55% / 0.3)" }}>
              <Plus size={16} /> New Popup
            </button>
          </motion.div>

          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Bell size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Glow Alert Popups yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Show high-impact alert popups for gifts and follows.</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(350 90% 55%), hsl(320 90% 50%))", color: "white" }}>
                <Plus size={16} /> Create
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<GlowAlertPopupPreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Alert Trigger">
                      <SettingSelect value={s.trigger || "gift"} onChange={v => set("trigger", v)} options={[
                        { value: "gift", label: "Any Gift" },
                        { value: "follow", label: "New Follow" },
                        { value: "like", label: "Like Milestone" },
                        { value: "share", label: "Share" },
                      ]} />
                    </SettingRow>
                    <SettingRow label="Display Duration">
                      <SettingSlider value={s.duration || 4} onChange={v => set("duration", v)} min={2} max={10} suffix="s" />
                    </SettingRow>
                    <SettingRow label="Glow Color">
                      <SettingColorPicker value={s.glow_color || "160 100% 50%"} onChange={v => set("glow_color", v)} />
                    </SettingRow>
                    <SettingRow label="Glow Intensity">
                      <SettingSlider value={s.glow_intensity || 80} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                    </SettingRow>
                    <SettingRow label="Show Scan-line Effect">
                      <SettingToggle checked={s.scanline_effect ?? true} onChange={v => set("scanline_effect", v)} />
                    </SettingRow>
                    <SettingRow label="Show Icon Ring">
                      <SettingToggle checked={s.show_icon_ring ?? true} onChange={v => set("show_icon_ring", v)} />
                    </SettingRow>
                    <SettingRow label="Position">
                      <SettingSelect value={s.position || "center"} onChange={v => set("position", v)} options={[
                        { value: "center", label: "Center" },
                        { value: "top", label: "Top" },
                        { value: "bottom", label: "Bottom" },
                        { value: "bottom-left", label: "Bottom Left" },
                        { value: "bottom-right", label: "Bottom Right" },
                      ]} />
                    </SettingRow>
                    <SettingRow label="Animation Style">
                      <SettingSelect value={s.animation || "pop"} onChange={v => set("animation", v)} options={[
                        { value: "pop", label: "Pop In" },
                        { value: "slide", label: "Slide Up" },
                        { value: "fade", label: "Fade In" },
                      ]} />
                    </SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Transparent Background">
                      <SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} />
                    </SettingRow>
                    <SettingRow label="Sound on Trigger">
                      <SettingToggle checked={s.sound_enabled ?? false} onChange={v => set("sound_enabled", v)} />
                    </SettingRow>
                    <div>
                      <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                      <textarea value={s.custom_css || ""} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                        className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" />
                    </div>
                  </div>}
                />
              );
            })}</AnimatePresence></div>
          )}
        </div>
      </ProGate>
    </AppLayout>
  );
};

export default GlowAlertPopupOverlay;
