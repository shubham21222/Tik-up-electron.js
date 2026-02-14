import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Frame, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultStreamBorderSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import StreamBorderPreview from "@/components/overlays/previews/StreamBorderPreview";

const StreamBorderOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("stream_border");

  const handleCreate = () => createWidget("stream_border", `Stream Border ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Frame size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Stream Borders</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(210 100% 55% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Stream Borders</h1>
            <p className="text-muted-foreground text-sm">Premium animated transparent borders for your live stream. 10 unique styles.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(210 100% 55%), hsl(280 100% 60%))", color: "white", boxShadow: "0 0 25px hsl(210 100% 55% / 0.25)" }}>
            <Plus size={16} /> New Stream Border
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Frame size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Stream Borders yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first animated stream border.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(210 100% 55%), hsl(280 100% 60%))", color: "white" }}>
              <Plus size={16} /> Create Stream Border
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultStreamBorderSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultStreamBorderSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {}}
                    previewSlot={<Suspense fallback={null}><StreamBorderPreview settings={s} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Border Style">
                          <SettingSelect value={s.border_style} onChange={v => set("border_style", v)} options={[
                            { value: "neon_pulse", label: "Neon Pulse" },
                            { value: "gold_metallic", label: "Gold Metallic" },
                            { value: "glitch_digital", label: "Glitch Digital" },
                            { value: "electric_spark", label: "Electric Spark" },
                            { value: "liquid_flow", label: "Liquid Flow" },
                            { value: "holographic_grid", label: "Holographic Grid" },
                            { value: "particles_glow", label: "Particles Glow" },
                            { value: "retro_wave", label: "Retro Wave" },
                            { value: "firefly_trail", label: "Firefly Trail" },
                             { value: "pulse_circuit", label: "Pulse Circuit" },
                            { value: "cod_tactical", label: "🎮 COD Tactical" },
                            { value: "fortnite_victory", label: "🟠 Fortnite Victory" },
                            { value: "arch_raider", label: "🏹 Arch Raider" },
                            { value: "battle_royale_pro", label: "🔥 Battle Royale Pro" },
                            { value: "space_fighter", label: "🚀 Space Fighter" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Border Thickness"><SettingSlider value={s.border_thickness} onChange={v => set("border_thickness", v)} min={1} max={8} suffix="px" /></SettingRow>
                        <SettingRow label="Corner Radius"><SettingSlider value={s.corner_radius} onChange={v => set("corner_radius", v)} min={0} max={40} suffix="px" /></SettingRow>
                        <SettingRow label="Animation Speed"><SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.25} max={3} step={0.25} suffix="x" /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Transparent BG"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                        <div>
                          <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                          <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
                            className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" />
                        </div>
                      </div>
                    }
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StreamBorderOverlay;
