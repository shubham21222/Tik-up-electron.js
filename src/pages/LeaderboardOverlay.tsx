import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultLeaderboardSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import LeaderboardPreview from "@/components/overlays/previews/LeaderboardPreview";

const LeaderboardOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("leaderboard");
  const handleCreate = () => createWidget("leaderboard", `Leaderboard ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Trophy size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Leaderboard</h1><p className="text-muted-foreground text-sm">Real-time leaderboard showing top gifters, likers, and fans.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black", boxShadow: "0 0 25px hsl(45 100% 55% / 0.25)" }}><Plus size={16} /> New Leaderboard</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Trophy size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Leaderboards yet</h2>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 100% 50%))", color: "black" }}><Plus size={16} /> Create Leaderboard</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultLeaderboardSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultLeaderboardSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><LeaderboardPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <SettingRow label="Type"><SettingSelect value={s.leaderboard_type} onChange={v => set("leaderboard_type", v)} options={[{ value: "gifters", label: "Top Gifters" }, { value: "likers", label: "Top Likers" }, { value: "fans", label: "Top Fans" }]} /></SettingRow>
                  <SettingRow label="Time Range"><SettingSelect value={s.time_range} onChange={v => set("time_range", v)} options={[{ value: "session", label: "Session" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "all_time", label: "All Time" }]} /></SettingRow>
                  <SettingRow label="Display Mode"><SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[{ value: "vertical", label: "Vertical List" }, { value: "ticker", label: "Horizontal Ticker" }, { value: "podium", label: "Podium Top 3" }, { value: "spotlight", label: "Rotating Spotlight" }]} /></SettingRow>
                  <SettingRow label="Max Entries"><SettingSlider value={s.max_entries} onChange={v => set("max_entries", v)} min={3} max={10} /></SettingRow>
                  <SettingRow label="Rank Badge"><SettingSelect value={s.rank_badge_style} onChange={v => set("rank_badge_style", v)} options={[{ value: "number", label: "Number" }, { value: "medal", label: "Medal" }, { value: "crown", label: "Crown" }, { value: "neon", label: "Neon" }]} /></SettingRow>
                  <SettingRow label="Crown for #1"><SettingToggle checked={s.crown_for_first} onChange={v => set("crown_for_first", v)} /></SettingRow>
                  <SettingRow label="Show Values"><SettingToggle checked={s.show_values} onChange={v => set("show_values", v)} /></SettingRow>
                  <SettingRow label="Show Avatars"><SettingToggle checked={s.show_avatars} onChange={v => set("show_avatars", v)} /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Glow per Rank"><SettingToggle checked={s.glow_per_rank} onChange={v => set("glow_per_rank", v)} /></SettingRow>
                  <SettingRow label="Animated Rank Change"><SettingToggle checked={s.animated_rank_change} onChange={v => set("animated_rank_change", v)} /></SettingRow>
                  <SettingRow label="Auto Refresh (s)"><SettingSlider value={s.auto_refresh} onChange={v => set("auto_refresh", v)} min={5} max={120} suffix="s" /></SettingRow>
                  <SettingRow label="Sliding Transitions"><SettingToggle checked={s.sliding_transitions} onChange={v => set("sliding_transitions", v)} /></SettingRow>
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

export default LeaderboardOverlay;
