import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SlotMachinePreview from "@/components/overlays/previews/SlotMachinePreview";
import ProGate from "@/components/ProGate";

const SlotMachineOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("slot_machine");
  const handleCreate = async () => { await createWidget("slot_machine", `Slot Machine ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Dices size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Slot Machines</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Slot Machine">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Slot Machine</h1>
              <p className="text-muted-foreground text-sm">Gift-triggered 3-reel slot machine with jackpot rewards.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 45%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}>
              <Plus size={16} /> New Slots
            </button>
          </motion.div>
          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Dices size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Slot Machines yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a slot machine triggered by gifts!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 45%))", color: "black" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<SlotMachinePreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Trigger"><SettingSelect value={s.trigger || "gift"} onChange={v => set("trigger", v)} options={[
                      { value: "gift", label: "Any Gift" }, { value: "specific_gift", label: "Specific Gift" },
                      { value: "chat_command", label: "Chat Command" }, { value: "manual", label: "Manual" }]} /></SettingRow>
                    <SettingRow label="Spin Duration"><SettingSlider value={s.spin_duration || 2} onChange={v => set("spin_duration", v)} min={1} max={5} suffix="s" /></SettingRow>
                    <SettingRow label="Win Chance"><SettingSlider value={s.win_chance || 20} onChange={v => set("win_chance", v)} min={5} max={50} suffix="%" /></SettingRow>
                    <SettingRow label="Jackpot Action"><SettingSelect value={s.jackpot_action || "shoutout"} onChange={v => set("jackpot_action", v)} options={[
                      { value: "shoutout", label: "Shoutout" }, { value: "custom_text", label: "Custom Text" }, { value: "none", label: "None" }]} /></SettingRow>
                    <SettingRow label="Show Jackpot Text"><SettingToggle checked={s.show_jackpot ?? true} onChange={v => set("show_jackpot", v)} /></SettingRow>
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

export default SlotMachineOverlay;
