import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultWebcamFrameSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import WebcamFramePreview from "@/components/overlays/previews/WebcamFramePreview";

const WebcamFrameOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("webcam_frame");

  const handleCreate = () => createWidget("webcam_frame", `Webcam Frame ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Monitor size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Webcam Frames</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(180 100% 50% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Webcam Frames</h1>
            <p className="text-muted-foreground text-sm">Premium animated transparent frames for your webcam. 10 unique styles for TikTok Live & OBS.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(180 100% 50%), hsl(200 100% 50%))", color: "black", boxShadow: "0 0 25px hsl(180 100% 50% / 0.25)" }}>
            <Plus size={16} /> New Webcam Frame
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Monitor size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Webcam Frames yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first animated webcam frame.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(180 100% 50%), hsl(200 100% 50%))", color: "black" }}>
              <Plus size={16} /> Create Webcam Frame
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultWebcamFrameSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultWebcamFrameSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {}}
                    previewSlot={<Suspense fallback={null}><WebcamFramePreview settings={s} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Frame Style">
                          <SettingSelect value={s.frame_style} onChange={v => set("frame_style", v)} options={[
                            { value: "neon_cyber", label: "Neon Cyber Rim" },
                            { value: "golden_luxe", label: "Golden Luxe" },
                            { value: "digital_pulse", label: "Digital Pulse" },
                            { value: "particle_aura", label: "Particle Aura" },
                            { value: "circuit_flow", label: "Circuit Flow" },
                            { value: "electro_corners", label: "Electro Corners" },
                            { value: "liquid_glow", label: "Liquid Glow" },
                            { value: "holographic_shift", label: "Holographic Shift" },
                            { value: "ember_flicker", label: "Ember Flicker" },
                            { value: "audio_reactive", label: "Audio Reactive" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Frame Size"><SettingSlider value={s.frame_size} onChange={v => set("frame_size", v)} min={150} max={500} suffix="px" /></SettingRow>
                        <SettingRow label="Frame Thickness"><SettingSlider value={s.frame_thickness} onChange={v => set("frame_thickness", v)} min={1} max={8} suffix="px" /></SettingRow>
                        <SettingRow label="Corner Radius"><SettingSlider value={s.corner_radius} onChange={v => set("corner_radius", v)} min={0} max={40} suffix="px" /></SettingRow>
                        <SettingRow label="Animation Speed"><SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.25} max={3} step={0.25} suffix="x" /></SettingRow>
                        <SettingRow label="Glow Intensity"><SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Color 1"><SettingColorPicker value={s.color_1} onChange={v => set("color_1", v)} /></SettingRow>
                        <SettingRow label="Color 2"><SettingColorPicker value={s.color_2} onChange={v => set("color_2", v)} /></SettingRow>
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

export default WebcamFrameOverlay;
