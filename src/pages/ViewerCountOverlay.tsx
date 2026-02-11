import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultViewerCountSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import ViewerCountPreview from "@/components/overlays/previews/ViewerCountPreview";

const ViewerCountOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("viewer_count");
  const handleCreate = () => createWidget("viewer_count", `Viewer Count ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Users size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Viewer Count</h1><p className="text-muted-foreground text-sm">Live viewer count display with spike animations and peak tracking.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}><Plus size={16} /> New Widget</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Users size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Viewer Counts yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black" }}><Plus size={16} /> Create Widget</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultViewerCountSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultViewerCountSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><ViewerCountPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Display Mode"><SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[{ value: "live_number", label: "Live Number" }, { value: "mini_graph", label: "Mini Graph" }, { value: "badge", label: "Badge" }, { value: "pulse_dot", label: "Pulse Dot" }]} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={14} max={72} suffix="px" /></SettingRow>
                  <SettingRow label="Font"><SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[{ value: "heading", label: "Heading" }, { value: "mono", label: "Monospace" }, { value: "sans", label: "Sans" }]} /></SettingRow>
                  <SettingRow label="Spike Animation"><SettingToggle checked={s.spike_animation} onChange={v => set("spike_animation", v)} /></SettingRow>
                  <SettingRow label="Pulse on Increase"><SettingToggle checked={s.pulse_on_increase} onChange={v => set("pulse_on_increase", v)} /></SettingRow>
                  <SettingRow label="Show Icon"><SettingToggle checked={s.icon_visible} onChange={v => set("icon_visible", v)} /></SettingRow>
                  <SettingRow label="Label Text"><input value={s.label_text} onChange={e => set("label_text", e.target.value)} className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 w-[120px]" /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Peak Tracker"><SettingToggle checked={s.peak_tracker} onChange={v => set("peak_tracker", v)} /></SettingRow>
                  <SettingRow label="Session High"><SettingToggle checked={s.session_high_highlight} onChange={v => set("session_high_highlight", v)} /></SettingRow>
                  <SettingRow label="Show Average"><SettingToggle checked={s.show_average} onChange={v => set("show_average", v)} /></SettingRow>
                  <SettingRow label="Spike Threshold"><SettingSlider value={s.spike_threshold} onChange={v => set("spike_threshold", v)} min={10} max={200} /></SettingRow>
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

export default ViewerCountOverlay;
