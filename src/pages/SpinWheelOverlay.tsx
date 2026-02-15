import AppLayout from "@/components/AppLayout";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SpinWheelPreview from "@/components/overlays/previews/SpinWheelPreview";
import ProGate from "@/components/ProGate";

const SEGMENT_COLORS = [
  "350 80% 50%", "45 100% 50%", "160 80% 40%", "200 80% 50%",
  "280 70% 55%", "15 90% 50%", "320 80% 50%", "180 70% 45%",
  "100 60% 45%", "250 70% 55%", "30 90% 55%", "190 80% 45%",
];

const defaultSpinWheelSettings = {
  segments: [
    { label: "10x Push-ups", color: "350 80% 50%" },
    { label: "15x Planks", color: "45 100% 50%" },
    { label: "Nothing!", color: "160 80% 40%" },
    { label: "5x Squats", color: "200 80% 50%" },
    { label: "Dance!", color: "280 70% 55%" },
    { label: "Shoutout", color: "15 90% 50%" },
  ],
  spin_duration: 4,
  auto_spin: false,
  trigger_mode: "gift",
  show_winner: true,
  winner_duration: 5,
  glow_intensity: 50,
  wheel_size: 400,
  transparent_bg: true,
  custom_css: "",
};

const SpinWheelOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("spin_wheel");

  const handleCreate = async () => { await createWidget("spin_wheel", `Spin Wheel ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Disc3 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Spin Wheels</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Spin Wheel">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.04), transparent 70%)" }} />
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Spin Wheel</h1>
              <p className="text-muted-foreground text-sm">Viewers trigger spins with gifts — land on custom actions, dares, or prizes.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 45%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}>
              <Plus size={16} /> New Wheel
            </button>
          </motion.div>
          {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Disc3 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Spin Wheels yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a wheel and link it to gift triggers!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 45%))", color: "black" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...defaultSpinWheelSettings, ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              const segments = s.segments || defaultSpinWheelSettings.segments;

              const updateSegment = (idx: number, field: string, value: string) => {
                const updated = [...segments];
                updated[idx] = { ...updated[idx], [field]: value };
                set("segments", updated);
              };
              const addSegment = () => {
                if (segments.length >= 12) return;
                set("segments", [...segments, { label: `Option ${segments.length + 1}`, color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length] }]);
              };
              const removeSegment = (idx: number) => {
                if (segments.length <= 2) return;
                set("segments", segments.filter((_: any, i: number) => i !== idx));
              };

              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultSpinWheelSettings)}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<div className="w-full h-full"><SpinWheelPreview /></div>}
                  settingsSlot={<div className="space-y-4">
                    {/* Segment editor */}
                    <div>
                      <p className="text-[12px] font-medium text-foreground mb-2">Wheel Segments</p>
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {segments.map((seg: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: `hsl(${seg.color})` }} />
                            <input
                              value={seg.label}
                              onChange={e => updateSegment(idx, "label", e.target.value)}
                              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground focus:outline-none focus:border-primary/30"
                              maxLength={30}
                            />
                            <button onClick={() => removeSegment(idx)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              disabled={segments.length <= 2}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {segments.length < 12 && (
                        <button onClick={addSegment}
                          className="mt-2 text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                          <Plus size={12} /> Add Segment
                        </button>
                      )}
                    </div>
                    <SettingRow label="Trigger Mode"><SettingSelect value={s.trigger_mode} onChange={v => set("trigger_mode", v)} options={[
                      { value: "gift", label: "Any Gift" }, { value: "specific_gift", label: "Specific Gift" },
                      { value: "chat_command", label: "Chat Command" }, { value: "manual", label: "Manual Only" }]} /></SettingRow>
                    <SettingRow label="Spin Duration"><SettingSlider value={s.spin_duration} onChange={v => set("spin_duration", v)} min={2} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Show Winner"><SettingToggle checked={s.show_winner} onChange={v => set("show_winner", v)} /></SettingRow>
                    <SettingRow label="Winner Display Time"><SettingSlider value={s.winner_duration} onChange={v => set("winner_duration", v)} min={2} max={15} suffix="s" /></SettingRow>
                    <SettingRow label="Wheel Glow"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Wheel Size"><SettingSlider value={s.wheel_size} onChange={v => set("wheel_size", v)} min={200} max={600} suffix="px" /></SettingRow>
                    <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                    <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                      <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
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

export default SpinWheelOverlay;
