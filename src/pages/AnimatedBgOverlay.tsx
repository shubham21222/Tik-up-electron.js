import AppLayout from "@/components/AppLayout";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultAnimatedBgSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";

const AnimatedBgOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("animated_bg");

  const handleCreate = async () => { await createWidget("animated_bg", `Background ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Palette size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Backgrounds</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Animated Backgrounds</h1>
            <p className="text-muted-foreground text-sm">Looping animated backgrounds for your stream.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}>
            <Plus size={16} /> New Background
          </button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Palette size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Backgrounds yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 55%))", color: "white" }}><Plus size={16} /> Create</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultAnimatedBgSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget}
                onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultAnimatedBgSettings)}
                onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<div className="w-full h-full rounded-xl overflow-hidden relative">
                  <motion.div className="absolute inset-0" animate={{ background: [
                    "linear-gradient(0deg, hsl(280 100% 65% / 0.4), hsl(200 100% 55% / 0.2))",
                    "linear-gradient(180deg, hsl(200 100% 55% / 0.4), hsl(160 100% 45% / 0.2))",
                    "linear-gradient(360deg, hsl(280 100% 65% / 0.4), hsl(200 100% 55% / 0.2))",
                  ]}} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /></div>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Background Type"><SettingSelect value={s.bg_type} onChange={v => set("bg_type", v)} options={[
                    { value: "gradient", label: "Moving Gradient" }, { value: "particles", label: "Particle Sky" },
                    { value: "grid", label: "Digital Grid" }, { value: "aurora", label: "Aurora Borealis" },
                    { value: "waves", label: "Wave Lines" }]} /></SettingRow>
                  <SettingRow label="Animation Speed"><SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.1} max={3} step={0.1} suffix="x" /></SettingRow>
                  <SettingRow label="Opacity"><SettingSlider value={s.opacity * 100} onChange={v => set("opacity", v / 100)} min={10} max={100} suffix="%" /></SettingRow>
                  {s.bg_type === "particles" && <>
                    <SettingRow label="Particle Count"><SettingSlider value={s.particle_count} onChange={v => set("particle_count", v)} min={10} max={200} /></SettingRow>
                    <SettingRow label="Particle Size"><SettingSlider value={s.particle_size} onChange={v => set("particle_size", v)} min={1} max={10} suffix="px" /></SettingRow>
                  </>}
                  {s.bg_type === "grid" && <SettingRow label="Grid Size"><SettingSlider value={s.grid_size} onChange={v => set("grid_size", v)} min={20} max={80} suffix="px" /></SettingRow>}
                  {s.bg_type === "waves" && <SettingRow label="Wave Amplitude"><SettingSlider value={s.wave_amplitude} onChange={v => set("wave_amplitude", v)} min={5} max={60} suffix="px" /></SettingRow>}
                  <SettingRow label="Blur Amount"><SettingSlider value={s.blur_amount} onChange={v => set("blur_amount", v)} min={0} max={30} suffix="px" /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Dark Background"><SettingToggle checked={s.dark_bg} onChange={v => set("dark_bg", v)} /></SettingRow>
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

export default AnimatedBgOverlay;
