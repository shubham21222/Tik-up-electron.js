import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import ProgressRacePreview from "@/components/overlays/previews/ProgressRacePreview";
import ProGate from "@/components/ProGate";

const ProgressRaceOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("progress_race");
  const handleCreate = async () => { await createWidget("progress_race", `Progress Race ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Flag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Progress Races</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Progress Race">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Progress Race</h1>
              <p className="text-muted-foreground text-sm">Teams race to the finish powered by viewer gifts and likes.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 80% 55%))", color: "black", boxShadow: "0 0 25px hsl(160 100% 45% / 0.25)" }}>
              <Plus size={16} /> New Race
            </button>
          </motion.div>
          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Flag size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Races yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a race and let teams compete!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 80% 55%))", color: "black" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<ProgressRacePreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Number of Teams"><SettingSlider value={s.team_count || 3} onChange={v => set("team_count", v)} min={2} max={5} /></SettingRow>
                    <SettingRow label="Target Score"><SettingSlider value={s.target || 100} onChange={v => set("target", v)} min={50} max={1000} /></SettingRow>
                    <SettingRow label="Score Source"><SettingSelect value={s.score_source || "gifts"} onChange={v => set("score_source", v)} options={[
                      { value: "gifts", label: "Gifts (coins)" }, { value: "likes", label: "Likes" }, { value: "comments", label: "Chat Keywords" }]} /></SettingRow>
                    <SettingRow label="Show Percentages"><SettingToggle checked={s.show_pct ?? true} onChange={v => set("show_pct", v)} /></SettingRow>
                    <SettingRow label="Auto Reset on Win"><SettingToggle checked={s.auto_reset ?? true} onChange={v => set("auto_reset", v)} /></SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} /></SettingRow>
                    <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                      <textarea value={s.custom_css || ""} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                        className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" /></div>
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

export default ProgressRaceOverlay;
