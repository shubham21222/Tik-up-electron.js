import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultStreamTimerSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import StreamTimerPreview from "@/components/overlays/previews/StreamTimerPreview";

const StreamTimerOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("stream_timer");
  const handleCreate = () => createWidget("stream_timer", `Stream Timer ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Timer size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(0 100% 60% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Stream Timer</h1><p className="text-muted-foreground text-sm">Live stream duration timer with milestone notifications.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(0 100% 60%), hsl(15 100% 55%))", color: "white", boxShadow: "0 0 25px hsl(0 100% 60% / 0.25)" }}><Plus size={16} /> New Timer</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Timer size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Stream Timers yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(0 100% 60%), hsl(15 100% 55%))", color: "white" }}><Plus size={16} /> Create Timer</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultStreamTimerSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultStreamTimerSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><StreamTimerPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Display Mode"><SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[{ value: "digital", label: "Clean Digital" }, { value: "neon_segmented", label: "Neon Segmented" }, { value: "minimal_dot", label: "Minimal Dot" }]} /></SettingRow>
                  <SettingRow label="Font"><SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[{ value: "mono", label: "Monospace" }, { value: "heading", label: "Heading" }, { value: "sans", label: "Sans" }]} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={18} max={72} suffix="px" /></SettingRow>
                  <SettingRow label="Show Hours"><SettingToggle checked={s.show_hours} onChange={v => set("show_hours", v)} /></SettingRow>
                  <SettingRow label="Show Seconds"><SettingToggle checked={s.show_seconds} onChange={v => set("show_seconds", v)} /></SettingRow>
                  <SettingRow label="Show Label"><SettingToggle checked={s.show_label} onChange={v => set("show_label", v)} /></SettingRow>
                  <SettingRow label="Label Text"><input value={s.label_text} onChange={e => set("label_text", e.target.value)} className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 w-[120px]" /></SettingRow>
                  <SettingRow label="Glow"><SettingToggle checked={s.glow_animation} onChange={v => set("glow_animation", v)} /></SettingRow>
                  <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Start on Connect"><SettingToggle checked={s.start_on_connect} onChange={v => set("start_on_connect", v)} /></SettingRow>
                  <SettingRow label="Milestone Notifications"><SettingToggle checked={s.milestone_notifications} onChange={v => set("milestone_notifications", v)} /></SettingRow>
                  <SettingRow label="Milestone Interval (min)"><SettingSlider value={s.milestone_interval} onChange={v => set("milestone_interval", v)} min={15} max={120} step={15} suffix="m" /></SettingRow>
                  <SettingRow label="Session Memory"><SettingToggle checked={s.session_memory} onChange={v => set("session_memory", v)} /></SettingRow>
                  <SettingRow label="Auto Hide Offline"><SettingToggle checked={s.auto_hide_offline} onChange={v => set("auto_hide_offline", v)} /></SettingRow>
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

export default StreamTimerOverlay;
