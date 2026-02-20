import AppLayout from "@/components/AppLayout";
import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { useGiftCatalog } from "@/hooks/use-gift-catalog";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import ElectricGiftAlertPreview, { ElectricGiftAlertSettings } from "@/components/overlays/previews/ElectricGiftAlertPreview";
import ProGate from "@/components/ProGate";

// Map coin value → tier string
function coinToTier(coins: number): string {
  if (coins >= 10000) return "legendary";
  if (coins >= 1000)  return "epic";
  if (coins >= 100)   return "rare";
  return "common";
}

// HSL palette for gift_match color mode
const TIER_COLORS: Record<string, string> = {
  legendary: "45 100% 58%",
  epic:      "280 100% 70%",
  rare:      "200 100% 60%",
  common:    "180 100% 55%",
};

const ElectricGiftAlertOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } =
    useOverlayWidgets("electric_gift_alert");
  const { gifts } = useGiftCatalog();

  const handleCreate = async () => {
    await createWidget("electric_gift_alert", `Electric Gift Alert ${widgets.length + 1}`);
  };

  const updateSetting = useCallback(
    (id: string, cur: Record<string, any>, key: string, val: any) => {
      updateSettings(id, { ...cur, [key]: val });
    },
    [updateSettings]
  );

  // Build preview gift list from real TikTok catalog (top 5 by coin value)
  const previewGifts = useMemo(() => {
    if (!gifts.length) return undefined;
    const sorted = [...gifts]
      .sort((a, b) => b.coin_value - a.coin_value)
      .slice(0, 8);
    return sorted.map(g => ({
      user: "TikUp_User",
      gift: g.name,
      emoji: "🎁",
      img: g.image_url,
      coins: g.coin_value,
      tier: coinToTier(g.coin_value),
      color: TIER_COLORS[coinToTier(g.coin_value)],
    }));
  }, [gifts]);

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
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-heading font-bold text-foreground">Electric Gift Alert</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: "hsl(180 100% 55%)", borderColor: "hsl(180 100% 55% / 0.3)", background: "hsl(180 100% 55% / 0.08)" }}>
                  ⚡ AAA
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Cinematic electric ring + crystal shard blast alerts. The most premium gift animation on TikTok LIVE.
              </p>
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
                  const s: Record<string, any> = { ...widget.settings };
                  const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);

                  // Build settings object passed into preview
                  const previewSettings: ElectricGiftAlertSettings = {
                    ring_color:       s.ring_color       ?? "180 100% 55%",
                    color_mode:       s.color_mode       ?? "fixed",
                    particles:        s.particles        ?? true,
                    electric_shards:  s.electric_shards  ?? true,
                    animation_style:  s.animation_style  ?? "electric",
                    name_size:        s.name_size        ?? 26,
                    show_tier:        s.show_tier        ?? true,
                    show_coins:       s.show_coins       ?? true,
                    scanlines:        s.scanlines        ?? false,
                    glow_intensity:   s.glow_intensity   ?? 80,
                    ring_count:       s.ring_count       ?? "3",
                    previewGifts,
                  };

                  return (
                    <OverlaySettingsShell
                      key={widget.id}
                      widget={widget}
                      onDelete={() => deleteWidget(widget.id)}
                      onReset={() => updateSettings(widget.id, {})}
                      onToggleActive={() => toggleActive(widget.id)}
                      onTest={() => {}}
                      previewSlot={<ElectricGiftAlertPreview settings={previewSettings} />}
                      settingsSlot={
                        <div className="space-y-4">
                          {/* Trigger */}
                          <SettingRow label="Trigger">
                            <SettingSelect
                              value={s.trigger || "any_gift"}
                              onChange={v => set("trigger", v)}
                              options={[
                                { value: "any_gift",         label: "Any Gift" },
                                { value: "value_threshold",  label: "Value Threshold" },
                                { value: "specific_gift",    label: "Specific Gift" },
                              ]}
                            />
                          </SettingRow>

                          {s.trigger === "value_threshold" && (
                            <SettingRow label="Min Coin Value">
                              <SettingSlider value={s.min_coins || 1} onChange={v => set("min_coins", v)} min={1} max={29999} suffix=" 🪙" />
                            </SettingRow>
                          )}

                          {s.trigger === "specific_gift" && gifts.length > 0 && (
                            <SettingRow label="Gift">
                              <SettingSelect
                                value={s.specific_gift_id || gifts[0]?.gift_id}
                                onChange={v => set("specific_gift_id", v)}
                                options={gifts.map(g => ({ value: g.gift_id, label: `${g.name} (${g.coin_value}🪙)` }))}
                              />
                            </SettingRow>
                          )}

                          <SettingRow label="Display Duration">
                            <SettingSlider value={s.duration || 4} onChange={v => set("duration", v)} min={2} max={12} suffix="s" />
                          </SettingRow>

                          {/* Animation Style */}
                          <SettingRow label="Animation Style">
                            <SettingSelect
                              value={s.animation_style || "electric"}
                              onChange={v => set("animation_style", v)}
                              options={[
                                { value: "electric",  label: "⚡ Electric Burst (Default)" },
                                { value: "flip_3d",   label: "🔄 3D Flip & Rotate" },
                                { value: "bounce",    label: "💥 Impact Bounce" },
                                { value: "slide",     label: "➡️ Slide In" },
                              ]}
                            />
                          </SettingRow>

                          {/* Color Mode */}
                          <SettingRow label="Color Mode">
                            <SettingSelect
                              value={s.color_mode || "fixed"}
                              onChange={v => set("color_mode", v)}
                              options={[
                                { value: "fixed",      label: "Fixed Color" },
                                { value: "random",     label: "🎲 Random Each Gift" },
                                { value: "gift_match", label: "🎁 Match Gift Tier" },
                              ]}
                            />
                          </SettingRow>

                          {/* Ring Color — only shown in fixed mode */}
                          {(!s.color_mode || s.color_mode === "fixed") && (
                            <SettingRow label="Ring Color">
                              <SettingColorPicker
                                value={s.ring_color || "180 100% 55%"}
                                onChange={v => set("ring_color", v)}
                              />
                            </SettingRow>
                          )}

                          <SettingRow label="Particle Burst">
                            <SettingToggle checked={s.particles ?? true} onChange={v => set("particles", v)} />
                          </SettingRow>

                          <SettingRow label="Crystal Shards">
                            <SettingToggle checked={s.electric_shards ?? true} onChange={v => set("electric_shards", v)} />
                          </SettingRow>

                          <SettingRow label="Rotating Rings">
                            <SettingSelect
                              value={s.ring_count || "3"}
                              onChange={v => set("ring_count", v)}
                              options={[
                                { value: "1", label: "1 Ring" },
                                { value: "2", label: "2 Rings" },
                                { value: "3", label: "3 Rings (Default)" },
                              ]}
                            />
                          </SettingRow>

                          <SettingRow label="Glow Intensity">
                            <SettingSlider value={s.glow_intensity || 80} onChange={v => set("glow_intensity", v)} min={0} max={100} suffix="%" />
                          </SettingRow>

                          <SettingRow label="Sender Name Size">
                            <SettingSlider value={s.name_size || 26} onChange={v => set("name_size", v)} min={16} max={42} suffix="px" />
                          </SettingRow>

                          <SettingRow label="Show Tier Badge">
                            <SettingToggle checked={s.show_tier ?? true} onChange={v => set("show_tier", v)} />
                          </SettingRow>

                          <SettingRow label="Show Coin Value">
                            <SettingToggle checked={s.show_coins ?? true} onChange={v => set("show_coins", v)} />
                          </SettingRow>

                          <SettingRow label="Position">
                            <SettingSelect
                              value={s.position || "center"}
                              onChange={v => set("position", v)}
                              options={[
                                { value: "center",       label: "Center" },
                                { value: "top",          label: "Top" },
                                { value: "bottom",       label: "Bottom" },
                                { value: "bottom-left",  label: "Bottom Left" },
                                { value: "bottom-right", label: "Bottom Right" },
                              ]}
                            />
                          </SettingRow>

                          <SettingRow label="Queue Alerts">
                            <SettingToggle checked={s.queue ?? true} onChange={v => set("queue", v)} />
                          </SettingRow>
                        </div>
                      }
                      advancedSlot={
                        <div className="space-y-4">
                          <SettingRow label="Scan-line Effect">
                            <SettingToggle checked={s.scanlines ?? false} onChange={v => set("scanlines", v)} />
                          </SettingRow>
                          <SettingRow label="Transparent Background">
                            <SettingToggle checked={s.transparent_bg ?? true} onChange={v => set("transparent_bg", v)} />
                          </SettingRow>
                          <SettingRow label="Animation Speed">
                            <SettingSlider value={s.anim_speed || 1} onChange={v => set("anim_speed", v)} min={0.5} max={2} suffix="x" />
                          </SettingRow>
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
