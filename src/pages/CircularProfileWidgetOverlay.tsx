import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDot, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import CircularProfileWidgetPreview from "@/components/overlays/previews/CircularProfileWidgetPreview";
import ProGate from "@/components/ProGate";

const CircularProfileWidgetOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("circular_profile_widget");
  const handleCreate = async () => { await createWidget("circular_profile_widget", `Circular Profile Widget ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><CircleDot size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Circular Profile Widgets</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Circular Profile Widget">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Circular Profile Widget</h1>
              <p className="text-muted-foreground text-sm">Rotating circular widget showing top gifters with animated ring and segmented wheel.</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(30 100% 50%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.3)" }}>
              <Plus size={16} /> New Widget
            </button>
          </motion.div>

          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <CircleDot size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Circular Profile Widgets yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Showcase your top gifters in a premium rotating wheel.</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(30 100% 50%))", color: "black" }}>
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
                  previewSlot={<CircularProfileWidgetPreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Max Profiles">
                      <SettingSlider value={s.max_profiles || 5} onChange={v => set("max_profiles", v)} min={2} max={10} suffix=" users" />
                    </SettingRow>
                    <SettingRow label="Rank By">
                      <SettingSelect value={s.rank_by || "coins"} onChange={v => set("rank_by", v)} options={[
                        { value: "coins", label: "Coins Gifted" },
                        { value: "gifts", label: "Gift Count" },
                        { value: "likes", label: "Likes" },
                      ]} />
                    </SettingRow>
                    <SettingRow label="Rotation Speed">
                      <SettingSlider value={s.rotation_speed || 8} onChange={v => set("rotation_speed", v)} min={2} max={30} suffix="s/rev" />
                    </SettingRow>
                    <SettingRow label="Ring Color">
                      <SettingColorPicker value={s.ring_color || "45 100% 55%"} onChange={v => set("ring_color", v)} />
                    </SettingRow>
                    <SettingRow label="Show Username">
                      <SettingToggle checked={s.show_username ?? true} onChange={v => set("show_username", v)} />
                    </SettingRow>
                    <SettingRow label="Show Coin Count">
                      <SettingToggle checked={s.show_coins ?? true} onChange={v => set("show_coins", v)} />
                    </SettingRow>
                    <SettingRow label="Show Rank Badge">
                      <SettingToggle checked={s.show_rank ?? true} onChange={v => set("show_rank", v)} />
                    </SettingRow>
                    <SettingRow label="Glow Markers">
                      <SettingToggle checked={s.glow_markers ?? true} onChange={v => set("glow_markers", v)} />
                    </SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Transparent Background">
                      <SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} />
                    </SettingRow>
                    <SettingRow label="Segment Wheel">
                      <SettingToggle checked={s.show_segments ?? true} onChange={v => set("show_segments", v)} />
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

export default CircularProfileWidgetOverlay;
