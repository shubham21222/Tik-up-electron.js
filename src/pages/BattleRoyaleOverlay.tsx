import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import BattleRoyalePreview from "@/components/overlays/previews/BattleRoyalePreview";
import ProGate from "@/components/ProGate";

const BattleRoyaleOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("battle_royale");
  const handleCreate = async () => { await createWidget("battle_royale", `Battle Royale ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Swords size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Battle Royales</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Battle Royale">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Battle Royale</h1>
              <p className="text-muted-foreground text-sm">Viewers enter by gifting — avatars fight on screen, last one standing wins!</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(15 90% 50%))", color: "white", boxShadow: "0 0 25px hsl(350 80% 55% / 0.25)" }}>
              <Plus size={16} /> New Battle
            </button>
          </motion.div>
          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Swords size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Battles yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a battle and let viewers fight for the win!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(15 90% 50%))", color: "white" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<BattleRoyalePreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Entry Trigger"><SettingSelect value={s.entry_trigger || "gift"} onChange={v => set("entry_trigger", v)} options={[
                      { value: "gift", label: "Any Gift" }, { value: "specific_gift", label: "Specific Gift" },
                      { value: "like", label: "Likes" }, { value: "follow", label: "Follow" }]} /></SettingRow>
                    <SettingRow label="Max Fighters"><SettingSlider value={s.max_fighters || 8} onChange={v => set("max_fighters", v)} min={4} max={16} /></SettingRow>
                    <SettingRow label="Round Speed"><SettingSlider value={s.round_speed || 3} onChange={v => set("round_speed", v)} min={1} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Show HP Bars"><SettingToggle checked={s.show_hp ?? true} onChange={v => set("show_hp", v)} /></SettingRow>
                    <SettingRow label="Winner Shoutout"><SettingToggle checked={s.winner_shoutout ?? true} onChange={v => set("winner_shoutout", v)} /></SettingRow>
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

export default BattleRoyaleOverlay;
