import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Gift, ChevronDown, Check, Volume2, Sparkles, Play, Coins } from "lucide-react";
import { useGiftCatalog, useUserGiftTriggers, TikTokGift } from "@/hooks/use-gift-catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const ANIMATION_OPTIONS = [
  { value: "bounce", label: "Bounce" },
  { value: "slide", label: "Slide" },
  { value: "explosion", label: "Explosion" },
  { value: "flip_3d", label: "3D Flip" },
  { value: "glitch", label: "Glitch" },
  { value: "fireworks", label: "Fireworks" },
  { value: "confetti", label: "Confetti" },
  { value: "highlight", label: "Highlight" },
];

const CATEGORIES = [
  { value: "all", label: "All Gifts" },
  { value: "basic", label: "Basic (1-10)" },
  { value: "standard", label: "Standard (11-200)" },
  { value: "premium", label: "Premium (201-5000)" },
  { value: "luxury", label: "Luxury (5000+)" },
];

const SORT_OPTIONS = [
  { value: "value_asc", label: "Value: Low to High" },
  { value: "value_desc", label: "Value: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
  { value: "name_desc", label: "Name: Z-A" },
];

const GiftBrowser = () => {
  const { gifts, loading: giftsLoading } = useGiftCatalog();
  const { triggers, toggleTrigger, updateTrigger, bulkEnable } = useUserGiftTriggers();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("value_asc");
  const [selectedGift, setSelectedGift] = useState<TikTokGift | null>(null);
  const [bulkMinValue, setBulkMinValue] = useState<number | null>(null);

  const filteredGifts = useMemo(() => {
    let result = gifts.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.coin_value.toString().includes(search);
      const matchCategory = category === "all" || g.category === category;
      return matchSearch && matchCategory;
    });

    switch (sort) {
      case "value_desc": result.sort((a, b) => b.coin_value - a.coin_value); break;
      case "name_asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: result.sort((a, b) => a.coin_value - b.coin_value);
    }
    return result;
  }, [gifts, search, category, sort]);

  const getTrigger = (giftId: string) => triggers.find(t => t.gift_id === giftId);
  const enabledCount = triggers.filter(t => t.is_enabled).length;

  const handleBulkSelect = () => {
    if (bulkMinValue === null) return;
    const ids = gifts.filter(g => g.coin_value >= bulkMinValue).map(g => g.gift_id);
    bulkEnable(ids);
    setBulkMinValue(null);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={18} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Gift Browser</h1>
            <PageHelpButton featureKey="gift_browser" />
          </div>
          <p className="text-muted-foreground text-sm">
            Browse TikTok gifts, select which ones trigger alerts, and assign custom sounds & animations.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-4 mb-6 p-3 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-2 text-sm">
            <Coins size={14} className="text-primary" />
            <span className="text-muted-foreground">{gifts.length} gifts available</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-primary" />
            <span className="text-muted-foreground">{enabledCount} alerts configured</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search gifts by name or value..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-border/50"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
              <SlidersHorizontal size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
              <ChevronDown size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk select */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min coins"
              className="w-[100px] bg-card/50 border-border/50"
              value={bulkMinValue ?? ""}
              onChange={e => setBulkMinValue(e.target.value ? Number(e.target.value) : null)}
            />
            <Button size="sm" variant="outline" onClick={handleBulkSelect} disabled={bulkMinValue === null}>
              Bulk Enable
            </Button>
          </div>
        </motion.div>

        {/* Gift grid */}
        {giftsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-card/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredGifts.map((gift, i) => {
                const trigger = getTrigger(gift.gift_id);
                const isEnabled = trigger?.is_enabled ?? false;

                return (
                  <motion.div
                    key={gift.gift_id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className={`relative rounded-xl border transition-all duration-200 cursor-pointer group ${
                      isEnabled
                        ? "border-primary/30 bg-primary/5 shadow-[0_0_20px_hsl(160_100%_45%/0.06)]"
                        : "border-border/30 bg-card/40 hover:border-border/60"
                    }`}
                    onClick={() => setSelectedGift(gift)}
                  >
                    {/* Enable toggle */}
                    <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={v => toggleTrigger(gift.gift_id, v)}
                        className="scale-75"
                      />
                    </div>

                    {/* Gift image */}
                    <div className="flex items-center justify-center pt-4 pb-2 px-4">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden">
                        {gift.image_url ? (
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-12 h-12 object-contain"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Gift size={24} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-3 pb-3 text-center">
                      <p className="text-sm font-semibold text-foreground truncate">{gift.name}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Coins size={11} className="text-yellow-500" />
                        <span className="text-xs font-mono text-muted-foreground">
                          {gift.coin_value.toLocaleString()}
                        </span>
                      </div>
                      {trigger?.animation_effect && trigger.animation_effect !== "bounce" && (
                        <Badge variant="secondary" className="mt-1.5 text-[9px] px-1.5 py-0">
                          {trigger.animation_effect}
                        </Badge>
                      )}
                      {trigger?.alert_sound_url && (
                        <Volume2 size={10} className="text-primary mx-auto mt-1" />
                      )}
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ boxShadow: "inset 0 0 30px hsl(160 100% 45% / 0.04)" }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredGifts.length === 0 && !giftsLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <Gift size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No gifts match your search</p>
          </div>
        )}
      </div>

      {/* Gift config dialog */}
      <GiftConfigDialog
        gift={selectedGift}
        trigger={selectedGift ? getTrigger(selectedGift.gift_id) : undefined}
        onClose={() => setSelectedGift(null)}
        onToggle={toggleTrigger}
        onUpdate={updateTrigger}
      />
    </AppLayout>
  );
};

interface GiftConfigDialogProps {
  gift: TikTokGift | null;
  trigger?: ReturnType<typeof useUserGiftTriggers>["triggers"][0];
  onClose: () => void;
  onToggle: (giftId: string, enabled: boolean) => void;
  onUpdate: (giftId: string, updates: any) => void;
}

const GiftConfigDialog = ({ gift, trigger, onClose, onToggle, onUpdate }: GiftConfigDialogProps) => {
  const [animation, setAnimation] = useState(trigger?.animation_effect || "bounce");
  const [priority, setPriority] = useState(trigger?.priority || 0);
  const [comboThreshold, setComboThreshold] = useState(trigger?.combo_threshold || 3);
  const [soundUrl, setSoundUrl] = useState(trigger?.alert_sound_url || "");

  // Sync state when gift/trigger changes
  const currentGift = gift;
  if (!currentGift) return null;

  const isEnabled = trigger?.is_enabled ?? false;

  const handleSave = () => {
    onUpdate(currentGift.gift_id, {
      animation_effect: animation,
      priority,
      combo_threshold: comboThreshold,
      alert_sound_url: soundUrl || null,
      is_enabled: true,
    });
    onClose();
  };

  return (
    <Dialog open={!!gift} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden">
              {currentGift.image_url ? (
                <img src={currentGift.image_url} alt={currentGift.name} className="w-8 h-8 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Gift size={20} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold">{currentGift.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Coins size={10} className="text-yellow-500" />
                {currentGift.coin_value.toLocaleString()} coins
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Enable */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable alert for this gift</span>
            <Switch checked={isEnabled} onCheckedChange={v => onToggle(currentGift.gift_id, v)} />
          </div>

          {/* Animation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Animation Effect</label>
            <Select value={animation} onValueChange={setAnimation}>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <Sparkles size={14} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_OPTIONS.map(a => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sound URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Alert Sound URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/sound.mp3"
                value={soundUrl}
                onChange={e => setSoundUrl(e.target.value)}
                className="bg-muted/30 border-border/50"
              />
              {soundUrl && (
                <Button size="icon" variant="ghost" onClick={() => {
                  const audio = new Audio(soundUrl);
                  audio.volume = 0.5;
                  audio.play().catch(() => {});
                }}>
                  <Play size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Priority (higher = shown first)</label>
            <Slider value={[priority]} onValueChange={v => setPriority(v[0])} min={0} max={10} step={1} />
            <span className="text-xs text-muted-foreground">{priority}</span>
          </div>

          {/* Combo threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Combo threshold (special effect if X in a row)</label>
            <Slider value={[comboThreshold]} onValueChange={v => setComboThreshold(v[0])} min={2} max={20} step={1} />
            <span className="text-xs text-muted-foreground">{comboThreshold}x combo</span>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Check size={14} className="mr-2" /> Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftBrowser;
