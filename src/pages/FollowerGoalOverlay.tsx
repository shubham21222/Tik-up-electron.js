import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultFollowerGoalSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import FollowerGoalPreview from "@/components/overlays/previews/FollowerGoalPreview";

const FollowerGoalOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("follower_goal");
  const handleCreate = () => createWidget("follower_goal", `Follower Goal ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Target size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Follower Goal</h1><p className="text-muted-foreground text-sm">Animated progress bar tracking your follower goals.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(180 100% 40%))", color: "black", boxShadow: "0 0 25px hsl(160 100% 45% / 0.25)" }}><Plus size={16} /> New Goal</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Target size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Follower Goals yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(180 100% 40%))", color: "black" }}><Plus size={16} /> Create Goal</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultFollowerGoalSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultFollowerGoalSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><FollowerGoalPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Display Style"><SettingSelect value={s.display_style} onChange={v => set("display_style", v)} options={[{ value: "glass_bar", label: "Glass Bar" }, { value: "neon_gradient", label: "Neon Gradient" }, { value: "circular", label: "Circular" }, { value: "minimal", label: "Minimal" }, { value: "liquid_fill", label: "Liquid Fill" }]} /></SettingRow>
                  <SettingRow label="Target Value"><SettingSlider value={s.target_value} onChange={v => set("target_value", v)} min={100} max={100000} step={100} /></SettingRow>
                  <SettingRow label="Bar Height"><SettingSlider value={s.bar_height} onChange={v => set("bar_height", v)} min={12} max={64} suffix="px" /></SettingRow>
                  <SettingRow label="Show Percentage"><SettingToggle checked={s.show_percentage} onChange={v => set("show_percentage", v)} /></SettingRow>
                  <SettingRow label="Text Position"><SettingSelect value={s.text_position} onChange={v => set("text_position", v)} options={[{ value: "inside", label: "Inside Bar" }, { value: "above", label: "Above" }, { value: "below", label: "Below" }, { value: "hidden", label: "Hidden" }]} /></SettingRow>
                  <SettingRow label="Title"><input value={s.title_text} onChange={e => set("title_text", e.target.value)} className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 w-[160px]" /></SettingRow>
                  <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Auto Hide at 100%"><SettingToggle checked={s.auto_hide_complete} onChange={v => set("auto_hide_complete", v)} /></SettingRow>
                  <SettingRow label="Completion Animation"><SettingSelect value={s.completion_animation} onChange={v => set("completion_animation", v)} options={[{ value: "confetti", label: "Confetti" }, { value: "flash", label: "Flash" }, { value: "fireworks", label: "Fireworks" }, { value: "none", label: "None" }]} /></SettingRow>
                  <SettingRow label="Milestone Alerts"><SettingToggle checked={s.milestone_alerts} onChange={v => set("milestone_alerts", v)} /></SettingRow>
                  <SettingRow label="Auto Reset on Stream"><SettingToggle checked={s.auto_reset_stream} onChange={v => set("auto_reset_stream", v)} /></SettingRow>
                  <SettingRow label="Transparent BG"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                  <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p><textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */" className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" /></div>
                </div>} />
            );
          })}</AnimatePresence></div>
        )}
      </div>
    </AppLayout>
  );
};

export default FollowerGoalOverlay;
