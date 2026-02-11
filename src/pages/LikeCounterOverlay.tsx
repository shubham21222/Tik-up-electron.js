import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultLikeCounterSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import LikeCounterPreview from "@/components/overlays/previews/LikeCounterPreview";

const LikeCounterOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("like_counter");
  const handleCreate = () => createWidget("like_counter", `Like Counter ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Heart size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Like Counter</h1><p className="text-muted-foreground text-sm">Animated live like counter for your stream.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(300 80% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}><Plus size={16} /> New Counter</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Heart size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Like Counters yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(300 80% 55%))", color: "white" }}><Plus size={16} /> Create Counter</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultLikeCounterSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultLikeCounterSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><LikeCounterPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Display Mode"><SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[{ value: "numeric", label: "Numeric" }, { value: "milestone", label: "Milestone" }, { value: "progress_ring", label: "Progress Ring" }, { value: "horizontal_bar", label: "Progress Bar" }, { value: "neon_counter", label: "Neon Counter" }]} /></SettingRow>
                  <SettingRow label="Font"><SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[{ value: "heading", label: "Heading" }, { value: "mono", label: "Monospace" }, { value: "sans", label: "Sans" }]} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={16} max={96} suffix="px" /></SettingRow>
                  <SettingRow label="Glow Strength"><SettingSlider value={s.glow_strength} onChange={v => set("glow_strength", v)} min={0} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Animated Increment"><SettingToggle checked={s.animated_increment} onChange={v => set("animated_increment", v)} /></SettingRow>
                  <SettingRow label="Rolling Numbers"><SettingToggle checked={s.rolling_number} onChange={v => set("rolling_number", v)} /></SettingRow>
                  <SettingRow label="Smoothing"><SettingToggle checked={s.smoothing_effect} onChange={v => set("smoothing_effect", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Milestone Interval"><SettingSlider value={s.milestone_interval} onChange={v => set("milestone_interval", v)} min={100} max={10000} step={100} /></SettingRow>
                  <SettingRow label="Milestone Animation"><SettingSelect value={s.milestone_animation} onChange={v => set("milestone_animation", v)} options={[{ value: "confetti", label: "Confetti" }, { value: "flash", label: "Flash" }, { value: "shake", label: "Shake" }, { value: "explode", label: "Explode" }]} /></SettingRow>
                  <SettingRow label="Confetti on Milestone"><SettingToggle checked={s.confetti_on_milestone} onChange={v => set("confetti_on_milestone", v)} /></SettingRow>
                  <SettingRow label="Sound on Milestone"><SettingToggle checked={s.sound_on_milestone} onChange={v => set("sound_on_milestone", v)} /></SettingRow>
                  <SettingRow label="Reset Daily"><SettingToggle checked={s.reset_daily} onChange={v => set("reset_daily", v)} /></SettingRow>
                  <SettingRow label="Transparent BG"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                  <SettingRow label="FPS Limit"><SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[{ value: "30", label: "30 FPS" }, { value: "60", label: "60 FPS" }]} /></SettingRow>
                  <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p><textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */" className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" /></div>
                </div>} />
            );
          })}</AnimatePresence></div>
        )}
      </div>
    </AppLayout>
  );
};

export default LikeCounterOverlay;
