import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultGiftFireworkSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";

const GiftFireworkOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("gift_firework");

  const handleCreate = async () => { await createWidget("gift_firework", `Gift Firework ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Sparkles size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Gift Fireworks</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Gift Firework Animation</h1>
            <p className="text-muted-foreground text-sm">Cinematic firework bursts triggered by viewer gifts.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(350 90% 55%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}>
            <Plus size={16} /> New Firework
          </button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Sparkles size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Gift Fireworks yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(350 90% 55%))", color: "black" }}><Plus size={16} /> Create</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultGiftFireworkSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget}
                onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultGiftFireworkSettings)}
                onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<div className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl">
                  <div className="text-center"><span className="text-4xl">🎆</span>
                    <p className="text-sm font-bold text-white mt-2">✨ GiftKing99</p></div></div>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Duration"><SettingSlider value={s.duration} onChange={v => set("duration", v)} min={1} max={8} suffix="s" /></SettingRow>
                  <SettingRow label="Particle Count"><SettingSlider value={s.particle_count} onChange={v => set("particle_count", v)} min={8} max={50} /></SettingRow>
                  <SettingRow label="Explosion Radius"><SettingSlider value={s.explosion_radius} onChange={v => set("explosion_radius", v)} min={40} max={200} suffix="px" /></SettingRow>
                  <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Show Username"><SettingToggle checked={s.show_username} onChange={v => set("show_username", v)} /></SettingRow>
                  <SettingRow label="Gravity Effect"><SettingToggle checked={s.gravity} onChange={v => set("gravity", v)} /></SettingRow>
                  <SettingRow label="Multi Burst"><SettingToggle checked={s.multi_burst} onChange={v => set("multi_burst", v)} /></SettingRow>
                  <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
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

export default GiftFireworkOverlay;
