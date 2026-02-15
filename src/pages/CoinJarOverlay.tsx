import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import CoinJarPreview from "@/components/overlays/previews/CoinJarPreview";
import ProGate from "@/components/ProGate";

const defaultCoinJarSettings = {
  jar_style: "glass",
  target_coins: 5000,
  fill_animation: "bounce",
  show_gift_icons: true,
  show_sender: true,
  show_total: true,
  glow_intensity: 50,
  completion_effect: "confetti",
  transparent_bg: true,
  custom_css: "",
};

const CoinJarOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("coin_jar");

  const handleCreate = async () => { await createWidget("coin_jar", `Coin Jar ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Coins size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Coin Jars</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Coin Jar">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.04), transparent 70%)" }} />
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Coin Jar</h1>
              <p className="text-muted-foreground text-sm">Watch the jar fill up with gifts from your viewers.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}>
              <Plus size={16} /> New Jar
            </button>
          </motion.div>
          {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Coins size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Coin Jars yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create a jar and watch it fill with gifts!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...defaultCoinJarSettings, ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultCoinJarSettings)}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<div className="w-full h-full"><CoinJarPreview /></div>}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Jar Style"><SettingSelect value={s.jar_style} onChange={v => set("jar_style", v)} options={[
                      { value: "glass", label: "Glass" }, { value: "crystal", label: "Crystal" },
                      { value: "neon", label: "Neon Glow" }, { value: "gold", label: "Gold Luxe" }]} /></SettingRow>
                    <SettingRow label="Target Coins"><SettingSlider value={s.target_coins} onChange={v => set("target_coins", v)} min={100} max={100000} /></SettingRow>
                    <SettingRow label="Fill Animation"><SettingSelect value={s.fill_animation} onChange={v => set("fill_animation", v)} options={[
                      { value: "bounce", label: "Bounce Drop" }, { value: "float", label: "Float Down" },
                      { value: "pop", label: "Pop In" }, { value: "spiral", label: "Spiral" }]} /></SettingRow>
                    <SettingRow label="Show Gift Icons"><SettingToggle checked={s.show_gift_icons} onChange={v => set("show_gift_icons", v)} /></SettingRow>
                    <SettingRow label="Show Sender Name"><SettingToggle checked={s.show_sender} onChange={v => set("show_sender", v)} /></SettingRow>
                    <SettingRow label="Show Coin Total"><SettingToggle checked={s.show_total} onChange={v => set("show_total", v)} /></SettingRow>
                    <SettingRow label="Liquid Glow"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} /></SettingRow>
                    <SettingRow label="Completion Effect"><SettingSelect value={s.completion_effect} onChange={v => set("completion_effect", v)} options={[
                      { value: "confetti", label: "Confetti" }, { value: "fireworks", label: "Fireworks" },
                      { value: "glow_burst", label: "Glow Burst" }, { value: "none", label: "None" }]} /></SettingRow>
                    <div className="pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={async () => {
                          await supabase.channel(`coin-jar-${widget.public_token}`).send({ type: "broadcast", event: "reset_jar", payload: {} });
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "hsl(45 100% 65%)" }}
                      >
                        <RotateCcw size={13} /> Reset Jar
                      </button>
                      <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center">Empties the jar and resets the coin counter to zero</p>
                    </div>
                  </div>}
                  advancedSlot={<div className="space-y-4">
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

export default CoinJarOverlay;
