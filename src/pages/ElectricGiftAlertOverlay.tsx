import AppLayout from "@/components/AppLayout";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import ElectricGiftAlertPreview from "@/components/overlays/previews/ElectricGiftAlertPreview";
import ProGate from "@/components/ProGate";

const ElectricGiftAlertOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } =
    useOverlayWidgets("electric_gift_alert");
  const handleCreate = async () => { await createWidget("electric_gift_alert", `Electric Gift Alert ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Zap size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Electric Gift Alerts</h2>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Electric Gift Alert">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-heading font-bold text-foreground">Electric Gift Alert</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: "hsl(180 100% 55%)", borderColor: "hsl(180 100% 55% / 0.3)", background: "hsl(180 100% 55% / 0.08)" }}>
                  ⚡ AAA
                </span>
              </div>
              <p className="text-muted-foreground text-sm">Cinematic electric ring + particle burst alerts. The most premium gift animation on TikTok LIVE.</p>
            </div>
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, hsl(180 100% 45%), hsl(200 100% 50%))",
                color: "black",
                boxShadow: "0 0 30px hsl(180 100% 45% / 0.35)",
              }}>
              <Plus size={16} /> New Alert
            </button>
          </motion.div>

          {loading ? (
            <div className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
          ) : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Zap size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Electric Gift Alerts yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create AAA-quality gift alerts with electric ring animations.</p>
              <button onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(180 100% 45%), hsl(200 100% 50%))", color: "black" }}>
                <Plus size={16} /> Create
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {widgets.map(widget => {
                  const s = { ...widget.settings };
                  const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                  return (
                    <OverlaySettingsShell
                      key={widget.id} widget={widget}
                      onDelete={() => deleteWidget(widget.id)}
                      onReset={() => updateSettings(widget.id, {})}
                      onToggleActive={() => toggleActive(widget.id)}
                      onTest={() => {}}
                      previewSlot={<ElectricGiftAlertPreview />}
                      settingsSlot={
                        <div className="space-y-4">
                          <SettingRow label="Trigger">
                            <SettingSelect value={s.trigger || "any_gift"} onChange={v => set("trigger", v)} options={[
                              { value: "any_gift", label: "Any Gift" },
                              { value: "value_threshold", label: "Value Threshold" },
                              { value: "specific_gift", label: "Specific Gift" },
                            ]} />
                          </SettingRow>
                          <SettingRow label="Min Coin Value">
                            <SettingSlider value={s.min_coins || 1} onChange={v => set("min_coins", v)} min={1} max={5000} suffix=" 🪙" />
                          </SettingRow>
                          <SettingRow label="Display Duration">
                            <SettingSlider value={s.duration || 4} onChange={v => set("duration", v)} min={2} max={10} suffix="s" />
                          </SettingRow>
                          <SettingRow label="Ring Color">
                            <SettingColorPicker value={s.ring_color || "180 100% 50%"} onChange={v => set("ring_color", v)} />
                          </SettingRow>
                          <SettingRow label="Particle Burst">
                            <SettingToggle checked={s.particles ?? true} onChange={v => set("particles", v)} />
                          </SettingRow>
                          <SettingRow label="Electric Shards">
                            <SettingToggle checked={s.electric_shards ?? true} onChange={v => set("electric_shards", v)} />
                          </SettingRow>
                          <SettingRow label="Rotating Rings">
                            <SettingSelect value={s.ring_count || "3"} onChange={v => set("ring_count", v)} options={[
                              { value: "1", label: "1 Ring" },
                              { value: "2", label: "2 Rings" },
                              { value: "3", label: "3 Rings (Default)" },
                            ]} />
                          </SettingRow>
                          <SettingRow label="Sender Name Size">
                            <SettingSlider value={s.name_size || 26} onChange={v => set("name_size", v)} min={16} max={40} suffix="px" />
                          </SettingRow>
                          <SettingRow label="Show Tier Badge">
                            <SettingToggle checked={s.show_tier ?? true} onChange={v => set("show_tier", v)} />
                          </SettingRow>
                          <SettingRow label="Show Coin Value">
                            <SettingToggle checked={s.show_coins ?? true} onChange={v => set("show_coins", v)} />
                          </SettingRow>
                          <SettingRow label="Position">
                            <SettingSelect value={s.position || "center"} onChange={v => set("position", v)} options={[
                              { value: "center", label: "Center" },
                              { value: "top", label: "Top" },
                              { value: "bottom", label: "Bottom" },
                              { value: "bottom-left", label: "Bottom Left" },
                              { value: "bottom-right", label: "Bottom Right" },
                            ]} />
                          </SettingRow>
                          <SettingRow label="Queue Alerts">
                            <SettingToggle checked={s.queue ?? true} onChange={v => set("queue", v)} />
                          </SettingRow>
                        </div>
                      }
                      advancedSlot={
                        <div className="space-y-4">
                          <SettingRow label="Transparent Background">
                            <SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} />
                          </SettingRow>
                          <SettingRow label="Scan-line Effect">
                            <SettingToggle checked={s.scanlines ?? true} onChange={v => set("scanlines", v)} />
                          </SettingRow>
                          <SettingRow label="Corner Tech Accents">
                            <SettingToggle checked={s.corner_accents ?? true} onChange={v => set("corner_accents", v)} />
                          </SettingRow>
                          <SettingRow label="Animation Speed">
                            <SettingSlider value={s.anim_speed || 1} onChange={v => set("anim_speed", v)} min={0.5} max={2} suffix="x" />
                          </SettingRow>
                          <SettingRow label="Glow Intensity">
                            <SettingSlider value={s.glow_intensity || 80} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                          </SettingRow>
                          <div>
                            <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                            <textarea
                              value={s.custom_css || ""} onChange={e => set("custom_css", e.target.value)}
                              placeholder="/* Custom CSS */"
                              className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none"
                            />
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
      </ProGate>
    </AppLayout>
  );
};

export default ElectricGiftAlertOverlay;
