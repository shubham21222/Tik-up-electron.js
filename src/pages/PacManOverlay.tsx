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
              <p className="text-muted-foreground text-sm">Viewers control Pac-Man via chat commands. Gifts trigger power-ups!</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 100% 55%))", color: "white", boxShadow: "0 0 25px hsl(160 100% 45% / 0.25)" }}>
              <Plus size={16} /> New Game
            </button>
          </motion.div>

          {loading ? <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Gamepad2 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Games yet</h2>
              <p className="text-sm text-muted-foreground mb-6">Create a Pac-Man game overlay and let your viewers play!</p>

              {/* How it works */}
              <div className="max-w-lg mx-auto mb-6 text-left">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
                  <h3 className="text-sm font-heading font-bold text-foreground">How it works</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>🎮 <span className="text-foreground font-medium">Chat Controls</span> — Viewers type <code className="px-1 py-0.5 rounded bg-white/5 text-primary">left</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">right</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">up</code> <code className="px-1 py-0.5 rounded bg-white/5 text-primary">down</code> to vote on movement</p>
                    <p>🌹 <span className="text-foreground font-medium">Small Gift</span> → ⚡ Speed Boost (2s)</p>
                    <p>🎁 <span className="text-foreground font-medium">Medium Gift</span> → 🛡️ Shield (ghosts can't kill)</p>
                    <p>💎 <span className="text-foreground font-medium">Big Gift</span> → 👻 Power Pellet (eat ghosts!)</p>
                    <p>🏆 <span className="text-foreground font-medium">Mega Gift</span> → 🌟 Teleport + Slow Ghosts</p>
                  </div>
                </div>
              </div>

              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(200 100% 55%))", color: "white" }}><Plus size={16} /> Create Game</button>
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
                      { value: "tikup", label: "TikUp Branded" },
                      { value: "classic", label: "Classic Pac-Man" },
                      { value: "cyberpunk", label: "Cyberpunk" },
                    ]} /></SettingRow>
                    <SettingRow label="Ghost Count" description="Number of ghosts"><SettingSlider value={s.ghost_count || 4} onChange={v => set("ghost_count", v)} min={1} max={4} /></SettingRow>
                    <SettingRow label="Vote Interval" description="Seconds between movement votes"><SettingSlider value={s.vote_interval || 1.5} onChange={v => set("vote_interval", v)} min={0.5} max={5} step={0.5} suffix="s" /></SettingRow>
                    <SettingRow label="Speed Boost Duration"><SettingSlider value={s.speed_boost_duration || 2} onChange={v => set("speed_boost_duration", v)} min={1} max={10} suffix="s" /></SettingRow>
                    <SettingRow label="Shield Duration"><SettingSlider value={s.shield_duration || 5} onChange={v => set("shield_duration", v)} min={2} max={15} suffix="s" /></SettingRow>
                    <SettingRow label="Power Pellet Duration"><SettingSlider value={s.power_duration || 7} onChange={v => set("power_duration", v)} min={3} max={15} suffix="s" /></SettingRow>
                    <SettingRow label="Slow Ghosts Duration"><SettingSlider value={s.slow_duration || 4} onChange={v => set("slow_duration", v)} min={2} max={10} suffix="s" /></SettingRow>
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
