import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import PacManPreview from "@/components/overlays/previews/PacManPreview";
import ProGate from "@/components/ProGate";

const PacManOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("pacman");
  const handleCreate = async () => { await createWidget("pacman", `Pac-Man ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Gamepad2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Pac-Man games</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Pac-Man LIVE">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Pac-Man LIVE</h1>
              <p className="text-muted-foreground text-sm">Viewers control Pac-Man via chat. Gifts trigger chaos effects!</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 100% 55%))", color: "white", boxShadow: "0 0 25px hsl(160 100% 45% / 0.25)" }}>
              <Plus size={16} /> New Game
            </button>
          </motion.div>

          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Gamepad2 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Games yet</h2>
              <p className="text-sm text-muted-foreground mb-6">Create a Pac-Man overlay and let your viewers play!</p>

              <div className="max-w-lg mx-auto mb-6 text-left">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
                  <h3 className="text-sm font-heading font-bold text-foreground">How it works</h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>🎮 <span className="text-foreground font-medium">Chat Controls</span> — Viewers type <code className="px-1 py-0.5 rounded bg-white/5 text-primary">left</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">right</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">up</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">down</code> to vote on movement direction</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <div className="space-y-1.5">
                      <p className="text-foreground font-semibold text-[11px] mb-1">😈 Chaos Effects</p>
                      <p>🐌 <span className="text-foreground">Small Gift</span> → Slow Pac-Man</p>
                      <p>🧊 <span className="text-foreground">Rose</span> → Freeze Pac-Man</p>
                      <p>💨 <span className="text-foreground">Medium Gift</span> → Speed up ghosts</p>
                      <p>🔄 <span className="text-foreground">Premium Gift</span> → Reverse controls</p>
                      <p>👻 <span className="text-foreground">Legendary</span> → Ghost swarm!</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-foreground font-semibold text-[11px] mb-1">✨ Positive Effects</p>
                      <p>🛡️ <span className="text-foreground">Big Gift</span> → Shield Pac-Man</p>
                      <p>👻 <span className="text-foreground">Large Gift</span> → Power pellet mode</p>
                      <p>🌟 <span className="text-foreground">Mega Gift</span> → Teleport + slow ghosts</p>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 100% 55%))", color: "white" }}>
                <Plus size={16} /> Create Game
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, {})}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<PacManPreview />}
                  settingsSlot={<div className="space-y-4">
                    <SettingRow label="Theme" description="Visual style of the game"><SettingSelect value={s.theme || "tikup"} onChange={v => set("theme", v)} options={[
                      { value: "tikup", label: "TikUp Neon" },
                      { value: "classic", label: "Classic Arcade" },
                      { value: "cyberpunk", label: "Cyberpunk" },
                    ]} /></SettingRow>
                    <SettingRow label="Ghost Count" description="Base number of ghosts"><SettingSlider value={s.ghost_count || 4} onChange={v => set("ghost_count", v)} min={1} max={4} /></SettingRow>
                    <SettingRow label="Vote Interval" description="Seconds between movement votes"><SettingSlider value={s.vote_interval || 1.5} onChange={v => set("vote_interval", v)} min={0.5} max={5} step={0.5} suffix="s" /></SettingRow>
                    <SettingRow label="Chaos Mode" description="Enable sabotage gifts (freeze, slow, reverse, swarm)"><SettingToggle checked={s.chaos_mode ?? true} onChange={v => set("chaos_mode", v)} /></SettingRow>

                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-3">✨ Positive Effect Durations</p>
                    </div>
                    <SettingRow label="Speed Boost"><SettingSlider value={s.speed_boost_duration || 3} onChange={v => set("speed_boost_duration", v)} min={1} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Shield"><SettingSlider value={s.shield_duration || 5} onChange={v => set("shield_duration", v)} min={2} max={15} suffix="s" /></SettingRow>
                    <SettingRow label="Power Pellet"><SettingSlider value={s.power_duration || 7} onChange={v => set("power_duration", v)} min={3} max={15} suffix="s" /></SettingRow>
                    <SettingRow label="Slow Ghosts"><SettingSlider value={s.slow_ghost_duration || 4} onChange={v => set("slow_ghost_duration", v)} min={2} max={10} suffix="s" /></SettingRow>

                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-3">😈 Chaos Effect Durations</p>
                    </div>
                    <SettingRow label="Freeze Pac-Man"><SettingSlider value={s.freeze_duration || 1.5} onChange={v => set("freeze_duration", v)} min={0.5} max={5} step={0.5} suffix="s" /></SettingRow>
                    <SettingRow label="Slow Pac-Man"><SettingSlider value={s.slow_pac_duration || 3} onChange={v => set("slow_pac_duration", v)} min={1} max={8} suffix="s" /></SettingRow>
                    <SettingRow label="Reverse Controls"><SettingSlider value={s.reverse_duration || 4} onChange={v => set("reverse_duration", v)} min={2} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Ghost Speed Boost"><SettingSlider value={s.ghost_speed_duration || 5} onChange={v => set("ghost_speed_duration", v)} min={2} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Ghost Swarm"><SettingSlider value={s.swarm_duration || 8} onChange={v => set("swarm_duration", v)} min={3} max={15} suffix="s" /></SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} /></SettingRow>
                    <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                      <textarea value={s.custom_css || ""} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
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

export default PacManOverlay;
