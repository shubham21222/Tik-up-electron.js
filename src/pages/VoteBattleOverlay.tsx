import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import VoteBattlePreview from "@/components/overlays/previews/VoteBattlePreview";
import ProGate from "@/components/ProGate";

const VoteBattleOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("vote_battle");
  const handleCreate = async () => { await createWidget("vote_battle", `Vote Battle ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Scale size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Vote Battles</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Vote Battle">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Vote Battle</h1>
              <p className="text-muted-foreground text-sm">Two sides battle — viewers power their team with gifts and likes.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(200 80% 55%))", color: "white", boxShadow: "0 0 25px hsl(350 80% 55% / 0.2)" }}>
              <Plus size={16} /> New Battle
            </button>
          </motion.div>
          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Scale size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Vote Battles yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a tug-of-war battle for your viewers!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(200 80% 55%))", color: "white" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<VoteBattlePreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Team A Name"><input value={s.team_a_name || "Team A"} onChange={e => set("team_a_name", e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground focus:outline-none focus:border-primary/30 w-full" maxLength={20} /></SettingRow>
                    <SettingRow label="Team B Name"><input value={s.team_b_name || "Team B"} onChange={e => set("team_b_name", e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground focus:outline-none focus:border-primary/30 w-full" maxLength={20} /></SettingRow>
                    <SettingRow label="Vote Source"><SettingSelect value={s.vote_source || "gifts"} onChange={v => set("vote_source", v)} options={[
                      { value: "gifts", label: "Gifts (coin value)" }, { value: "likes", label: "Likes" }, { value: "comments", label: "Chat Keywords" }]} /></SettingRow>
                    <SettingRow label="Duration"><SettingSlider value={s.duration || 120} onChange={v => set("duration", v)} min={30} max={600} suffix="s" /></SettingRow>
                    <SettingRow label="Show Percentages"><SettingToggle checked={s.show_pct ?? true} onChange={v => set("show_pct", v)} /></SettingRow>
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

export default VoteBattleOverlay;
