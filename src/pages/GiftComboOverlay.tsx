import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultGiftComboSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";

const GiftComboOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("gift_combo");

  const handleCreate = async () => { await createWidget("gift_combo", `Gift Combo ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Zap size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Gift Combos</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Super Gift Combo</h1>
            <p className="text-muted-foreground text-sm">Animated combo counter with escalating effects.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(350 90% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}>
            <Plus size={16} /> New Combo
          </button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Zap size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Gift Combos yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(350 90% 55%))", color: "white" }}><Plus size={16} /> Create</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultGiftComboSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget}
                onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultGiftComboSettings)}
                onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<div className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl">
                  <div className="text-center"><span className="text-4xl">🎁</span>
                    <p className="text-2xl font-black text-white mt-2">15 <span className="text-sm text-white/50">×COMBO</span></p>
                    <p className="text-xs text-white/40 mt-1">TestUser</p></div></div>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Combo Timeout"><SettingSlider value={s.combo_timeout} onChange={v => set("combo_timeout", v)} min={2} max={15} suffix="s" /></SettingRow>
                  <SettingRow label="Min Combo Count"><SettingSlider value={s.min_combo} onChange={v => set("min_combo", v)} min={2} max={10} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={24} max={120} suffix="px" /></SettingRow>
                  <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Show Multiplier"><SettingToggle checked={s.show_multiplier} onChange={v => set("show_multiplier", v)} /></SettingRow>
                  <SettingRow label="Show Gift Icon"><SettingToggle checked={s.show_gift_icon} onChange={v => set("show_gift_icon", v)} /></SettingRow>
                  <SettingRow label="Particle Burst"><SettingToggle checked={s.particle_burst} onChange={v => set("particle_burst", v)} /></SettingRow>
                  <SettingRow label="Screen Shake"><SettingToggle checked={s.screen_shake} onChange={v => set("screen_shake", v)} /></SettingRow>
                  <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                  <SettingRow label="Font"><SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[
                    { value: "heading", label: "Heading" }, { value: "sans", label: "Sans" }, { value: "mono", label: "Mono" }]} /></SettingRow>
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

export default GiftComboOverlay;
