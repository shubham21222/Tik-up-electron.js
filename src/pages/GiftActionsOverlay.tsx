import AppLayout from "@/components/AppLayout";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Trash2, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { useGiftCatalog } from "@/hooks/use-gift-catalog";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import GiftActionsPreview from "@/components/overlays/previews/GiftActionsPreview";
import ProGate from "@/components/ProGate";

const defaultGiftActionsSettings = {
  items: [
    { img: "/gifts/rose.png", label: "Jump" },
    { img: "/gifts/flame_heart.png", label: "Dance" },
    { img: "/gifts/fluffy_heart.png", label: "Emote" },
    { img: "/gifts/morning_bloom.png", label: "Spin" },
  ],
  scroll_speed: 30,
  icon_size: 64,
  label_size: 16,
  spacing: 24,
  show_labels: true,
  auto_scroll: true,
  transparent_bg: true,
  label_style: "bold" as "bold" | "outline" | "glow",
  custom_css: "",
};

/* ── Gift Image Picker (popover grid) ── */
const GiftImagePicker = ({
  value,
  onChange,
  gifts,
}: {
  value: string;
  onChange: (img: string) => void;
  gifts: { image_url: string | null; name: string; coin_value: number }[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-10 flex items-center justify-center gap-0.5 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-colors"
      >
        <img src={value} alt="" className="w-7 h-7 object-contain" draggable={false} />
        <ChevronDown size={10} className="text-muted-foreground/50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[280px] max-h-[240px] overflow-y-auto rounded-xl border border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-2xl p-2">
          <div className="grid grid-cols-6 gap-1">
            {gifts.map((gift) =>
              gift.image_url ? (
                <button
                  key={gift.image_url}
                  type="button"
                  onClick={() => { onChange(gift.image_url!); setOpen(false); }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.08] ${
                    value === gift.image_url ? "bg-primary/20 ring-1 ring-primary/40" : ""
                  }`}
                  title={`${gift.name} (${gift.coin_value} coins)`}
                >
                  <img src={gift.image_url} alt={gift.name} className="w-7 h-7 object-contain" draggable={false} />
                </button>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GiftActionsOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("gift_actions");
  const { gifts: catalogGifts } = useGiftCatalog();

  const handleCreate = async () => { await createWidget("gift_actions", `Gift Actions ${widgets.length + 1}`); };
  const updateSetting = useCallback((id: string, cur: Record<string, any>, key: string, val: any) => {
    updateSettings(id, { ...cur, [key]: val });
  }, [updateSettings]);

  if (!user) return (
    <AppLayout><div className="flex items-center justify-center h-[60vh]">
      <div className="text-center"><Sparkles size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Gift Action Sliders</h2></div>
    </div></AppLayout>
  );

  return (
    <AppLayout>
      <ProGate feature="Gift Actions Slider">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-heading font-bold text-foreground mb-1">Gift Actions Slider</h1>
              <p className="text-muted-foreground text-sm">Show viewers what actions each gift triggers — scrolling carousel for OBS.</p></div>
            <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(320 80% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}>
              <Plus size={16} /> New Slider
            </button>
          </motion.div>
          {loading ? <div className="space-y-6">{[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}</div>
          : widgets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Sparkles size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Gift Action Sliders yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Show your viewers which gifts trigger which actions!</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(320 80% 55%))", color: "white" }}><Plus size={16} /> Create</button>
            </motion.div>
          ) : (
            <div className="space-y-6"><AnimatePresence>{widgets.map(widget => {
              const s = { ...defaultGiftActionsSettings, ...widget.settings };
              const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
              const items = s.items || defaultGiftActionsSettings.items;

              const updateItem = (idx: number, field: string, value: string) => {
                const updated = [...items];
                updated[idx] = { ...updated[idx], [field]: value };
                set("items", updated);
              };
              const addItem = () => {
                if (items.length >= 12) return;
                // Pick a random gift from catalog or fallback
                const randomGift = catalogGifts.length > 0
                  ? catalogGifts[Math.floor(Math.random() * catalogGifts.length)]
                  : null;
                const img = randomGift?.image_url || "/gifts/rose.png";
                set("items", [...items, { img, label: `Action ${items.length + 1}` }]);
              };
              const removeItem = (idx: number) => {
                if (items.length <= 1) return;
                set("items", items.filter((_: any, i: number) => i !== idx));
              };

              return (
                <OverlaySettingsShell key={widget.id} widget={widget}
                  onDelete={() => deleteWidget(widget.id)} onReset={() => updateSettings(widget.id, defaultGiftActionsSettings)}
                  onToggleActive={() => toggleActive(widget.id)} onTest={() => {}}
                  previewSlot={<div className="w-full h-full"><GiftActionsPreview items={items} /></div>}
                  settingsSlot={<div className="space-y-4">
                    {/* Items editor */}
                    <div>
                      <p className="text-[12px] font-medium text-foreground mb-2">Gift → Action Items</p>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <GiftImagePicker
                              value={item.img}
                              onChange={(img) => updateItem(idx, "img", img)}
                              gifts={catalogGifts}
                            />
                            <input
                              value={item.label}
                              onChange={e => updateItem(idx, "label", e.target.value)}
                              placeholder="Action text..."
                              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground focus:outline-none focus:border-primary/30"
                              maxLength={20}
                            />
                            <button onClick={() => removeItem(idx)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              disabled={items.length <= 1}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {items.length < 12 && (
                        <button onClick={addItem}
                          className="mt-2 text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                          <Plus size={12} /> Add Item
                        </button>
                      )}
                    </div>
                    <SettingRow label="Auto Scroll"><SettingToggle checked={s.auto_scroll} onChange={v => set("auto_scroll", v)} /></SettingRow>
                    <SettingRow label="Scroll Speed"><SettingSlider value={s.scroll_speed} onChange={v => set("scroll_speed", v)} min={10} max={80} suffix="px/s" /></SettingRow>
                    <SettingRow label="Icon Size"><SettingSlider value={s.icon_size} onChange={v => set("icon_size", v)} min={32} max={128} suffix="px" /></SettingRow>
                    <SettingRow label="Label Size"><SettingSlider value={s.label_size} onChange={v => set("label_size", v)} min={10} max={32} suffix="px" /></SettingRow>
                    <SettingRow label="Show Labels"><SettingToggle checked={s.show_labels} onChange={v => set("show_labels", v)} /></SettingRow>
                    <SettingRow label="Label Style"><SettingSelect value={s.label_style} onChange={v => set("label_style", v)} options={[
                      { value: "bold", label: "Bold" }, { value: "outline", label: "Outline" }, { value: "glow", label: "Glow" }]} /></SettingRow>
                  </div>}
                  advancedSlot={<div className="space-y-4">
                    <SettingRow label="Spacing"><SettingSlider value={s.spacing} onChange={v => set("spacing", v)} min={8} max={64} suffix="px" /></SettingRow>
                    <SettingRow label="Transparent Background"><SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} /></SettingRow>
                    <div><p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                      <textarea value={s.custom_css} onChange={e => set("custom_css", e.target.value)} placeholder="/* Custom CSS */"
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

export default GiftActionsOverlay;
