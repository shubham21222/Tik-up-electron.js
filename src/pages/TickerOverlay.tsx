import AppLayout from "@/components/AppLayout";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TicketSlash, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultTickerSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";

const TickerOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("ticker");

  const handleCreate = async () => { await createWidget("ticker", `Ticker ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><TicketSlash size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Ticker</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(200 100% 55% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Notifications Ticker</h1>
            <p className="text-muted-foreground text-sm">Scrolling event ticker bar for your stream.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(160 100% 45%))", color: "white", boxShadow: "0 0 25px hsl(200 100% 55% / 0.25)" }}>
            <Plus size={16} /> New Ticker
          </button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <TicketSlash size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Tickers yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(200 100% 55%), hsl(160 100% 45%))", color: "white" }}><Plus size={16} /> Create</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultTickerSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget}
                onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultTickerSettings)}
                onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<div className="w-full h-full flex items-end bg-black/50 rounded-xl overflow-hidden">
                  <div className="w-full h-10 bg-black/60 backdrop-blur-sm border-t border-white/10 flex items-center px-4 gap-4 text-xs text-white/70">
                    <span>👤 <b>User1</b> followed</span><span className="text-white/20">•</span>
                    <span>❤️ <b>User2</b> liked</span><span className="text-white/20">•</span>
                    <span>🎁 <b>User3</b> sent a gift</span></div></div>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Scroll Speed"><SettingSlider value={s.scroll_speed} onChange={v => set("scroll_speed", v)} min={10} max={100} /></SettingRow>
                  <SettingRow label="Direction"><SettingSelect value={s.direction} onChange={v => set("direction", v)} options={[
                    { value: "left", label: "Left" }, { value: "right", label: "Right" }]} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={10} max={24} suffix="px" /></SettingRow>
                  <SettingRow label="Bar Height"><SettingSlider value={s.bar_height} onChange={v => set("bar_height", v)} min={24} max={60} suffix="px" /></SettingRow>
                  <SettingRow label="Position"><SettingSelect value={s.bar_position} onChange={v => set("bar_position", v)} options={[
                    { value: "bottom", label: "Bottom" }, { value: "top", label: "Top" }]} /></SettingRow>
                  <SettingRow label="Show Icons"><SettingToggle checked={s.show_icons} onChange={v => set("show_icons", v)} /></SettingRow>
                  <SettingRow label="Background Blur"><SettingToggle checked={s.background_blur} onChange={v => set("background_blur", v)} /></SettingRow>
                  <SettingRow label="Separator"><SettingSelect value={s.separator_style} onChange={v => set("separator_style", v)} options={[
                    { value: "dot", label: "Dot •" }, { value: "pipe", label: "Pipe |" }, { value: "diamond", label: "Diamond ◆" }, { value: "star", label: "Star ★" }]} /></SettingRow>
                  <SettingRow label="Accent Color"><SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Max Items"><SettingSlider value={s.max_items} onChange={v => set("max_items", v)} min={5} max={50} /></SettingRow>
                  <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                  <SettingRow label="Glow"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
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

export default TickerOverlay;
