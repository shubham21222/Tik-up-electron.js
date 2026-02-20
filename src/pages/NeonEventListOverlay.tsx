import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import NeonEventListPreview from "@/components/overlays/previews/NeonEventListPreview";
import ProGate from "@/components/ProGate";

const NeonEventListOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("neon_event_list");
  const handleCreate = async () => { await createWidget("neon_event_list", `Neon Event List ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Zap size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Neon Event Lists</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Neon Event List">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Neon Event List</h1>
              <p className="text-muted-foreground text-sm">Real-time scrolling event feed with glowing tech-corner borders.</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(200 100% 50%), hsl(180 100% 45%))", color: "black", boxShadow: "0 0 25px hsl(200 100% 50% / 0.25)" }}>
              <Plus size={16} /> New List
            </button>
          </motion.div>

          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Zap size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Neon Event Lists yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Show gifts, follows, and likes in a stylish live feed.</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(200 100% 50%), hsl(180 100% 45%))", color: "black" }}>
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
                  previewSlot={<NeonEventListPreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Max Events">
                      <SettingSlider value={s.max_events || 6} onChange={v => set("max_events", v)} min={3} max={12} suffix=" rows" />
                    </SettingRow>
                    <SettingRow label="Show Gifts">
                      <SettingToggle checked={s.show_gifts ?? true} onChange={v => set("show_gifts", v)} />
                    </SettingRow>
                    <SettingRow label="Show Follows">
                      <SettingToggle checked={s.show_follows ?? true} onChange={v => set("show_follows", v)} />
                    </SettingRow>
                    <SettingRow label="Show Likes">
                      <SettingToggle checked={s.show_likes ?? true} onChange={v => set("show_likes", v)} />
                    </SettingRow>
                    <SettingRow label="Show Shares">
                      <SettingToggle checked={s.show_shares ?? false} onChange={v => set("show_shares", v)} />
                    </SettingRow>
                    <SettingRow label="Animation Style">
                      <SettingSelect value={s.animation_style || "slide"} onChange={v => set("animation_style", v)} options={[
                        { value: "slide", label: "Slide In" },
                        { value: "fade", label: "Fade" },
                        { value: "pop", label: "Pop" },
                      ]} />
                    </SettingRow>
                    <SettingRow label="Accent Color">
                      <SettingColorPicker value={s.accent_color || "200 100% 55%"} onChange={v => set("accent_color", v)} />
                    </SettingRow>
                    <SettingRow label="Auto Scroll Speed">
                      <SettingSlider value={s.scroll_speed || 3} onChange={v => set("scroll_speed", v)} min={1} max={10} suffix="x" />
                    </SettingRow>
                    <SettingRow label="Show Event Count">
                      <SettingToggle checked={s.show_count ?? true} onChange={v => set("show_count", v)} />
                    </SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Transparent Background">
                      <SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} />
                    </SettingRow>
                    <SettingRow label="Corner Glow Intensity">
                      <SettingSlider value={s.glow_intensity || 70} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
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

export default NeonEventListOverlay;
