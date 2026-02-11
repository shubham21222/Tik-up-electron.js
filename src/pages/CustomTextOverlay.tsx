import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultCustomTextSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import CustomTextPreview from "@/components/overlays/previews/CustomTextPreview";

const CustomTextOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("custom_text");
  const handleCreate = () => createWidget("custom_text", `Custom Text ${widgets.length + 1}`);
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Type size={48} className="text-muted-foreground/30" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Custom Text</h1><p className="text-muted-foreground text-sm">Dynamic text overlay with variable binding and animated gradients.</p></div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(320 80% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}><Plus size={16} /> New Text</button>
        </motion.div>
        {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
        : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Type size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Custom Texts yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Variables: {"{viewer_count}"} {"{likes}"} {"{followers}"} {"{top_gifter}"} {"{streamer}"}</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(320 80% 55%))", color: "white" }}><Plus size={16} /> Create Text</button>
          </motion.div>
        ) : (
          <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
            const s = { ...defaultCustomTextSettings, ...widget.settings };
            const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
            return (
              <OverlaySettingsShell key={widget.id} widget={widget} onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultCustomTextSettings)} onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                previewSlot={<Suspense fallback={null}><CustomTextPreview settings={s} /></Suspense>}
                settingsSlot={<div className="space-y-4">
                  <div><p className="text-[12px] font-medium text-foreground mb-1.5">Text Content</p>
                    <textarea value={s.text_content} onChange={e => set("text_content", e.target.value)} placeholder="Welcome to {streamer}'s stream!" className="w-full h-20 text-[11px] p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none" />
                    <p className="text-[9px] text-muted-foreground/60 mt-1">Variables: {"{viewer_count}"} {"{likes}"} {"{followers}"} {"{top_gifter}"} {"{streamer}"}</p>
                  </div>
                  <SettingRow label="Font"><SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[{ value: "heading", label: "Heading" }, { value: "sans", label: "Sans" }, { value: "mono", label: "Monospace" }]} /></SettingRow>
                  <SettingRow label="Font Size"><SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={12} max={72} suffix="px" /></SettingRow>
                  <SettingRow label="Font Weight"><SettingSelect value={s.font_weight} onChange={v => set("font_weight", v)} options={[{ value: "normal", label: "Normal" }, { value: "bold", label: "Bold" }, { value: "black", label: "Black" }]} /></SettingRow>
                  <SettingRow label="Align"><SettingSelect value={s.text_align} onChange={v => set("text_align", v)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} /></SettingRow>
                  <SettingRow label="Animated Gradient"><SettingToggle checked={s.animated_gradient} onChange={v => set("animated_gradient", v)} /></SettingRow>
                  <SettingRow label="Gradient Speed"><SettingSlider value={s.gradient_speed} onChange={v => set("gradient_speed", v)} min={1} max={10} suffix="s" /></SettingRow>
                </div>}
                advancedSlot={<div className="space-y-4">
                  <SettingRow label="Text Shadow"><SettingToggle checked={s.text_shadow} onChange={v => set("text_shadow", v)} /></SettingRow>
                  <SettingRow label="Shadow Blur"><SettingSlider value={s.shadow_blur} onChange={v => set("shadow_blur", v)} min={0} max={30} suffix="px" /></SettingRow>
                  <SettingRow label="BG Blur"><SettingSlider value={s.background_blur} onChange={v => set("background_blur", v)} min={0} max={30} suffix="px" /></SettingRow>
                  <SettingRow label="BG Opacity"><SettingSlider value={s.background_opacity} onChange={v => set("background_opacity", v)} min={0} max={100} suffix="%" /></SettingRow>
                  <SettingRow label="Scroll Mode"><SettingSelect value={s.scroll_mode} onChange={v => set("scroll_mode", v)} options={[{ value: "none", label: "None" }, { value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }]} /></SettingRow>
                  <SettingRow label="Variable Binding"><SettingToggle checked={s.variable_binding} onChange={v => set("variable_binding", v)} /></SettingRow>
                  <SettingRow label="Refresh Interval"><SettingSlider value={s.refresh_interval} onChange={v => set("refresh_interval", v)} min={1} max={60} suffix="s" /></SettingRow>
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

export default CustomTextOverlay;
