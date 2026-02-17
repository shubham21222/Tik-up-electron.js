import AppLayout from "@/components/AppLayout";
import { useCallback, Suspense, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultGiftAlertSettings } from "@/hooks/use-overlay-widgets";
import { giftAlertPresets } from "@/hooks/overlay-defaults";
import { useGiftCatalog, useUserGiftTriggers } from "@/hooks/use-gift-catalog";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import GiftAlertPreview from "@/components/overlays/previews/GiftAlertPreview";
import { useNavigate } from "react-router-dom";

const GiftAlertOverlay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("gift_alert");
  const { gifts } = useGiftCatalog();
  const { triggers } = useUserGiftTriggers();
  const [testTrigger, setTestTrigger] = useState(0);

  const enabledTriggers = triggers.filter(t => t.is_enabled);
  const enabledGifts = gifts.filter(g => enabledTriggers.some(t => t.gift_id === g.gift_id));

  const handleCreate = async () => {
    await createWidget("gift_alert", `Gift Alert ${widgets.length + 1}`);
  };

  const updateSetting = useCallback((id: string, currentSettings: Record<string, any>, key: string, value: any) => {
    updateSettings(id, { ...currentSettings, [key]: value });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Gift size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Gift Alerts</h2>
            <p className="text-sm text-muted-foreground">Create animated gift alerts for your TikTok LIVE stream.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Purple ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Gift Alerts</h1>
            <p className="text-muted-foreground text-sm">Animated gift notifications for your TikTok LIVE stream.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(280 80% 55%))",
              color: "white",
              boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)",
            }}
          >
            <Plus size={16} /> New Alert
          </button>
        </motion.div>

        {/* How it works guide */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(280 40% 8% / 0.6), hsl(280 20% 6% / 0.4))" }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid hsl(280 100% 65% / 0.2)" }}>
                <span className="text-5xl">🌹</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid hsl(280 100% 65% / 0.15)" }}
                animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-heading font-bold text-foreground">How Gift Alerts Work</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "hsl(280 100% 65% / 0.15)", color: "hsl(280 100% 75%)" }}>1</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed"><span className="text-foreground font-medium">Create</span> a Gift Alert overlay above</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "hsl(280 100% 65% / 0.15)", color: "hsl(280 100% 75%)" }}>2</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed"><span className="text-foreground font-medium">Enable gifts</span> in the Gift Browser & copy the URL</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "hsl(280 100% 65% / 0.15)", color: "hsl(280 100% 75%)" }}>3</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed"><span className="text-foreground font-medium">Go live</span> — all enabled gifts trigger through one URL</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enabled Gifts Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-2xl border border-white/[0.08] p-4"
          style={{ background: "hsl(280 20% 6% / 0.4)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-purple-400" />
              <span className="text-sm font-heading font-bold text-foreground">Alerts Enabled</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: enabledGifts.length > 0 ? "hsl(280 100% 65% / 0.15)" : "hsl(0 0% 50% / 0.15)", color: enabledGifts.length > 0 ? "hsl(280 100% 75%)" : "hsl(0 0% 60%)" }}
              >
                {enabledGifts.length} gift{enabledGifts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => navigate("/gift-browser")}
              className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
              style={{ color: "hsl(280 100% 70%)" }}
            >
              Manage in Gift Browser <ExternalLink size={11} />
            </button>
          </div>

          {enabledGifts.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No gifts enabled yet. Go to the Gift Browser to enable gifts for alerts.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {enabledGifts.slice(0, 30).map(gift => (
                <div key={gift.gift_id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  title={`${gift.name} (${gift.coin_value} coins)`}
                >
                  {gift.image_url ? (
                    <img src={gift.image_url} alt={gift.name} className="w-4 h-4 rounded-sm object-contain" />
                  ) : (
                    <span className="text-xs">🎁</span>
                  )}
                  <span className="text-foreground/80 truncate max-w-[60px]">{gift.name}</span>
                </div>
              ))}
              {enabledGifts.length > 30 && (
                <span className="text-[11px] text-muted-foreground px-2 py-1">+{enabledGifts.length - 30} more</span>
              )}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}
          </div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Gift size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Gift Alerts yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first gift alert overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(280 80% 55%))", color: "white" }}>
              <Plus size={16} /> Create Gift Alert
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultGiftAlertSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell
                    key={widget.id}
                    widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultGiftAlertSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {
                      setTestTrigger(prev => prev + 1);
                      // Also broadcast test_alert to live renderer
                      supabase.channel(`gift-alert-${widget.public_token}`)
                        .send({ type: "broadcast", event: "test_alert", payload: {} });
                    }}
                    previewSlot={
                      <Suspense fallback={null}>
                        <GiftAlertPreview settings={s} testTrigger={testTrigger} />
                      </Suspense>
                    }
                    settingsSlot={
                      <div className="space-y-4">
                        {/* Style Presets */}
                        <SettingRow label="Style Preset" description="Quick-apply a complete look">
                          <SettingSelect value={s.style_preset || "custom"} onChange={v => {
                            if (v !== "custom" && giftAlertPresets[v]) {
                              updateSettings(widget.id, { ...widget.settings, ...giftAlertPresets[v], style_preset: v });
                            } else {
                              set("style_preset", v);
                            }
                          }} options={[
                            { value: "custom", label: "Custom" },
                            { value: "minimal", label: "✨ Minimal" },
                            { value: "neon", label: "💚 Neon" },
                            { value: "cyber", label: "🔷 Cyber" },
                            { value: "luxury", label: "👑 Luxury" },
                            { value: "fun", label: "🎉 Fun" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Background Style" description="Card background look">
                          <SettingSelect value={s.bg_style || "glass"} onChange={v => set("bg_style", v)} options={[
                            { value: "none", label: "None" },
                            { value: "glass", label: "Glass Pill" },
                            { value: "neon", label: "Neon Card" },
                            { value: "solid", label: "Solid" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="No Background" description="Remove alert card background">
                          <SettingToggle checked={s.no_background} onChange={v => set("no_background", v)} />
                        </SettingRow>
                        <SettingRow label="No Border" description="Remove alert card border">
                          <SettingToggle checked={s.no_border} onChange={v => set("no_border", v)} />
                        </SettingRow>
                        <SettingRow label="Alert Position" description="Where alerts appear on screen">
                          <SettingSelect value={s.alert_position || "center"} onChange={v => set("alert_position", v)} options={[
                            { value: "center", label: "Center" },
                            { value: "top", label: "Top" },
                            { value: "bottom", label: "Bottom" },
                            { value: "top-left", label: "Top Left" },
                            { value: "top-right", label: "Top Right" },
                            { value: "bottom-left", label: "Bottom Left" },
                            { value: "bottom-right", label: "Bottom Right" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Trigger Mode" description="When to show alerts">
                          <SettingSelect value={s.trigger_mode} onChange={v => set("trigger_mode", v)} options={[
                            { value: "any_gift", label: "Any Gift" },
                            { value: "specific_gift", label: "Specific Gift" },
                            { value: "value_threshold", label: "Value Threshold" },
                            { value: "combo", label: "Combo Streak" },
                            { value: "milestone", label: "Milestone" },
                          ]} />
                        </SettingRow>
                        {s.trigger_mode === "value_threshold" && (
                          <SettingRow label="Min Gift Value">
                            <SettingSlider value={s.value_threshold} onChange={v => set("value_threshold", v)} min={1} max={10000} step={10} />
                          </SettingRow>
                        )}
                        {s.trigger_mode === "combo" && (
                          <SettingRow label="Combo Threshold">
                            <SettingSlider value={s.combo_threshold} onChange={v => set("combo_threshold", v)} min={2} max={50} />
                          </SettingRow>
                        )}
                        <SettingRow label="Animation Style">
                          <SettingSelect value={s.animation_style} onChange={v => set("animation_style", v)} options={[
                            { value: "slide", label: "Slide In" },
                            { value: "bounce", label: "Pop + Bounce" },
                            { value: "explosion", label: "Explosion" },
                            { value: "flip_3d", label: "3D Flip" },
                            { value: "glitch", label: "Glitch Intro" },
                            { value: "flames_rising", label: "🔥 Flames Rising" },
                            { value: "icy_blast", label: "❄️ Icy Blast" },
                            { value: "christmas_spark", label: "🎄 Christmas Spark" },
                            { value: "snowfall", label: "🌨️ Snowfall" },
                            { value: "cyber_pulse", label: "⚡ Cyber Pulse" },
                            { value: "explosion_burst", label: "💥 Explosion Burst" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Alert Duration" description="How long alerts stay on screen">
                          <SettingSlider value={s.duration} onChange={v => set("duration", v)} min={1} max={15} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Font Family" description="Typography style">
                          <SettingSelect value={s.font_family || "default"} onChange={v => set("font_family", v)} options={[
                            { value: "default", label: "Default" },
                            { value: "inter", label: "Inter" },
                            { value: "space-grotesk", label: "Space Grotesk" },
                            { value: "orbitron", label: "Orbitron" },
                            { value: "bebas", label: "Bebas Neue" },
                            { value: "press-start", label: "Press Start 2P" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Font Size" description="Username text size">
                          <SettingSlider value={s.font_size || 24} onChange={v => set("font_size", v)} min={14} max={48} suffix="px" />
                        </SettingRow>
                        <SettingRow label="Font Weight">
                          <SettingSelect value={String(s.font_weight || 800)} onChange={v => set("font_weight", Number(v))} options={[
                            { value: "400", label: "Regular" },
                            { value: "600", label: "Semi Bold" },
                            { value: "700", label: "Bold" },
                            { value: "800", label: "Extra Bold" },
                            { value: "900", label: "Black" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Gift Image Size">
                          <SettingSlider value={s.gift_image_size} onChange={v => set("gift_image_size", v)} min={32} max={128} suffix="px" />
                        </SettingRow>
                        <SettingRow label="Glow Intensity">
                          <SettingSlider value={s.glow_intensity} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                        <SettingRow label="Shadow Depth">
                          <SettingSlider value={s.shadow_depth} onChange={v => set("shadow_depth", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                        <SettingRow label="Border Glow Pulse">
                          <SettingToggle checked={s.border_glow} onChange={v => set("border_glow", v)} />
                        </SettingRow>
                        <SettingRow label="Accent Color" description="Gift name & borders">
                          <SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} />
                        </SettingRow>
                        <SettingRow label="Glow Color" description="Ring & particle glow">
                          <SettingColorPicker value={s.glow_color || s.accent_color} onChange={v => set("glow_color", v)} />
                        </SettingRow>
                        <SettingRow label="Text Color" description="Username & subtitle">
                          <SettingColorPicker value={s.text_color || "0 0% 100%"} onChange={v => set("text_color", v)} />
                        </SettingRow>
                        <SettingRow label="Sound Volume">
                          <SettingSlider value={s.sound_volume} onChange={v => set("sound_volume", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Queue System" description="Stack alerts instead of replacing">
                          <SettingToggle checked={s.queue_enabled} onChange={v => set("queue_enabled", v)} />
                        </SettingRow>
                        <SettingRow label="Priority Alerts" description="High-value gifts skip queue">
                          <SettingToggle checked={s.priority_alerts} onChange={v => set("priority_alerts", v)} />
                        </SettingRow>
                        <SettingRow label="Max on Screen">
                          <SettingSlider value={s.max_on_screen} onChange={v => set("max_on_screen", v)} min={1} max={10} />
                        </SettingRow>
                        <SettingRow label="Anti-Spam Throttle" description="Min seconds between same-user alerts">
                          <SettingSlider value={s.anti_spam_throttle} onChange={v => set("anti_spam_throttle", v)} min={0} max={30} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Alert Cooldown">
                          <SettingSlider value={s.alert_cooldown} onChange={v => set("alert_cooldown", v)} min={0} max={10} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Animation Speed">
                          <SettingSlider value={s.animation_speed} onChange={v => set("animation_speed", v)} min={0.25} max={3} step={0.25} suffix="x" />
                        </SettingRow>
                        <SettingRow label="Transparent Background">
                          <SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} />
                        </SettingRow>
                        <SettingRow label="FPS Limit">
                          <SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[
                            { value: "30", label: "30 FPS" },
                            { value: "60", label: "60 FPS" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Username Font">
                          <SettingSelect value={s.username_font} onChange={v => set("username_font", v)} options={[
                            { value: "heading", label: "Heading" },
                            { value: "sans", label: "Sans Serif" },
                            { value: "mono", label: "Monospace" },
                          ]} />
                        </SettingRow>
                        <div>
                          <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                          <textarea
                            value={s.custom_css}
                            onChange={e => set("custom_css", e.target.value)}
                            placeholder="/* Custom CSS overrides */"
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
    </AppLayout>
  );
};

export default GiftAlertOverlay;
