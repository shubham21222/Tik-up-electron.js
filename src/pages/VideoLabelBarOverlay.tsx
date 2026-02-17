import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { defaultVideoLabelBarSettings } from "@/hooks/overlay-defaults";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import VideoLabelBarPreview from "@/components/overlays/previews/VideoLabelBarPreview";

const VideoLabelBarOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("video_label_bar");

  const handleCreate = () => createWidget("video_label_bar", `Label Bar ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Tag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Label Bars</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Label Bar Overlay</h1>
            <p className="text-muted-foreground text-sm">Animated video label bar for your stream. Transparent WebM loop for OBS & TikTok LIVE Studio.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}>
            <Plus size={16} /> New Label Bar
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Tag size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Label Bars yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first animated label bar overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 55%))", color: "white" }}>
              <Plus size={16} /> Create Label Bar
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultVideoLabelBarSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell key={widget.id} widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultVideoLabelBarSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {}}
                    previewSlot={<Suspense fallback={null}><VideoLabelBarPreview settings={s} /></Suspense>}
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Label Color">
                          <SettingColorPicker value={s.label_color} onChange={v => set("label_color", v)} />
                        </SettingRow>
                        <SettingRow label="Position">
                          <SettingSelect value={s.position} onChange={v => set("position", v)} options={[
                            { value: "top", label: "Top" },
                            { value: "bottom", label: "Bottom" },
                            { value: "center", label: "Center" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Scale"><SettingSlider value={s.scale} onChange={v => set("scale", v)} min={50} max={200} suffix="%" /></SettingRow>
                        <SettingRow label="Opacity"><SettingSlider value={s.opacity} onChange={v => set("opacity", v)} min={10} max={100} suffix="%" /></SettingRow>
                        <SettingRow label="Playback Speed"><SettingSlider value={s.playback_speed} onChange={v => set("playback_speed", v)} min={0.25} max={3} step={0.25} suffix="x" /></SettingRow>
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

export default VideoLabelBarOverlay;
