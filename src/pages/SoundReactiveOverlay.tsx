import AppLayout from "@/components/AppLayout";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioLines, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultSoundReactiveSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";

const SoundReactiveOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("sound_reactive");

  const handleCreate = async () => { await createWidget("sound_reactive", `Audio Visualizer ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><AudioLines size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Audio Visualizers</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(200 100% 55% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Sound-Reactive Visuals</h1>
            <p className="text-muted-foreground text-sm">Audio peak meters and waveform backgrounds synced to stream audio.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(280 100% 65%))", color: "white", boxShadow: "0 0 25px hsl(200 100% 55% / 0.25)" }}>
            <Plus size={16} /> New Visualizer
          </button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <AudioLines size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Visualizers yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(280 100% 65%))", color: "white" }}><Plus size={16} /> Create</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultSoundReactiveSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget}
                onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultSoundReactiveSettings)}
                onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<div className="w-full h-full flex items-end justify-center bg-black/50 rounded-xl overflow-hidden p-4 gap-1">
                  {Array.from({ length: 16 }, (_, i) => (
                    <motion.div key={i} className="rounded-full" style={{ width: 4, background: `hsl(${200 + i * 5} 100% 60%)` }}
                      animate={{ height: [10 + Math.random() * 20, 30 + Math.random() * 40, 10 + Math.random() * 20] }}
                      transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity }} />
                  ))}</div>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Display Mode"><SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[
                    { value: "bars", label: "Bars" }, { value: "waveform", label: "Waveform" },
                    { value: "circle", label: "Circle" }, { value: "spectrum", label: "Spectrum" }]} /></SettingRow>
                  <SettingRow label="Bar Count"><SettingSlider value={s.bar_count} onChange={v => set("bar_count", v)} min={8} max={128} /></SettingRow>
                  <SettingRow label="Bar Width"><SettingSlider value={s.bar_width} onChange={v => set("bar_width", v)} min={1} max={16} suffix="px" /></SettingRow>
                  <SettingRow label="Sensitivity"><SettingSlider value={s.sensitivity} onChange={v => set("sensitivity", v)} min={10} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Smoothing"><SettingSlider value={s.smoothing * 100} onChange={v => set("smoothing", v / 100)} min={0} max={99} suffix="%" /></SettingRow>
                  <SettingRow label="Mirror"><SettingToggle checked={s.mirror} onChange={v => set("mirror", v)} /></SettingRow>
                  <SettingRow label="Color Mode"><SettingSelect value={s.color_mode} onChange={v => set("color_mode", v)} options={[
                    { value: "solid", label: "Solid" }, { value: "gradient", label: "Gradient" },
                    { value: "rainbow", label: "Rainbow" }, { value: "reactive", label: "Reactive" }]} /></SettingRow>
                  <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Position"><SettingSelect value={s.position} onChange={v => set("position", v)} options={[
                    { value: "bottom", label: "Bottom" }, { value: "top", label: "Top" },
                    { value: "center", label: "Center" }, { value: "full", label: "Full" }]} /></SettingRow>
                  <SettingRow label="Height"><SettingSlider value={s.height_percent} onChange={v => set("height_percent", v)} min={10} max={100} suffix="%" /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Bar Gap"><SettingSlider value={s.bar_gap} onChange={v => set("bar_gap", v)} min={0} max={8} suffix="px" /></SettingRow>
                  <SettingRow label="Bar Radius"><SettingSlider value={s.bar_radius} onChange={v => set("bar_radius", v)} min={0} max={8} suffix="px" /></SettingRow>
                  <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                  <SettingRow label="FPS Limit"><SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[
                    { value: "30", label: "30 FPS" }, { value: "60", label: "60 FPS" }]} /></SettingRow>
                  <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                    <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                      className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" /></div>
                </div>}
              />
            );
          })}</AnimatePresence></div>
        )}
      </div>
    </AppLayout>
  );
};

export default SoundReactiveOverlay;
