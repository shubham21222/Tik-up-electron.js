import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import {
  Gift, Search, Volume2, Play, X,
  ChevronDown, ChevronLeft, ChevronRight, Coins, Eye, EyeOff
} from "lucide-react";
import { useGiftCatalog, useUserGiftTriggers } from "@/hooks/use-gift-catalog";
import AnimationPreview from "@/components/actions/AnimationPreview";

const animationOptions = [
  { value: "bounce", label: "Bounce In", emoji: "🎯", premium: false },
  { value: "slide", label: "Slide Up", emoji: "⬆️", premium: false },
  { value: "explosion", label: "Explosion", emoji: "💥", premium: false },
  { value: "3d_flip", label: "3D Flip", emoji: "🔄", premium: true },
  { value: "glitch", label: "Glitch", emoji: "⚡", premium: true },
  { value: "firework", label: "Firework", emoji: "🎆", premium: true },
];

const filterOptions = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Active" },
  { value: "1", label: "1-5 🪙" },
  { value: "10", label: "10-50 🪙" },
  { value: "100", label: "100-999 🪙" },
  { value: "1000", label: "1,000+ 🪙" },
  { value: "5000", label: "5,000+ 🪙" },
  { value: "10000", label: "10,000+ 🪙" },
];

const Actions = () => {
  const { gifts, loading: giftsLoading } = useGiftCatalog();
  const { triggers, toggleTrigger, updateTrigger } = useUserGiftTriggers();
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterValue, setFilterValue] = useState<string>("all");
  const [fullPreview, setFullPreview] = useState(false);

  const filtered = useMemo(() => {
    let result = gifts;
    if (search) result = result.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
    if (filterValue === "enabled") result = result.filter(g => triggers.find(t => t.gift_id === g.gift_id)?.is_enabled);
    if (filterValue === "1") result = result.filter(g => g.coin_value <= 5);
    if (filterValue === "10") result = result.filter(g => g.coin_value >= 10 && g.coin_value <= 50);
    if (filterValue === "100") result = result.filter(g => g.coin_value >= 100 && g.coin_value < 1000);
    if (filterValue === "1000") result = result.filter(g => g.coin_value >= 1000);
    if (filterValue === "5000") result = result.filter(g => g.coin_value >= 5000);
    if (filterValue === "10000") result = result.filter(g => g.coin_value >= 10000);
    return result;
  }, [gifts, search, filterValue, triggers]);

  const currentGift = filtered[currentIndex];
  const currentTrigger = triggers.find(t => t.gift_id === currentGift?.gift_id);

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filtered.length);
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const getImageUrl = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    return url;
  };

  const thumbRange = 2;
  const thumbs = useMemo(() => {
    if (filtered.length === 0) return [];
    const items: { gift: typeof filtered[0]; idx: number }[] = [];
    for (let offset = -thumbRange; offset <= thumbRange; offset++) {
      const idx = (currentIndex + offset + filtered.length) % filtered.length;
      items.push({ gift: filtered[idx], idx });
    }
    return items;
  }, [filtered, currentIndex]);

  const currentAnimStyle = currentTrigger?.animation_effect || "bounce";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Gift Alerts</h1>
          <p className="text-muted-foreground text-sm">
            Pick a gift → choose what happens on your stream
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-col gap-3 mb-8">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentIndex(0); }}
              placeholder="Search gifts..."
              className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          {/* Scrollable filter box */}
          <div className="rounded-xl bg-muted/30 border border-border/30 p-1.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 min-w-max">
              {filterOptions.map(f => (
                <button key={f.value} onClick={() => { setFilterValue(f.value); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${filterValue === f.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {giftsLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading gifts...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gift size={32} className="text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No gifts found</p>
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={goPrev} className="w-10 h-10 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                <ChevronLeft size={20} />
              </button>

              <AnimatePresence mode="wait">
                {currentGift && (
                  <motion.div
                    key={currentGift.gift_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="rounded-3xl p-[1px] w-[280px]"
                    style={{ background: "linear-gradient(135deg, hsl(280 100% 65% / 0.25), hsl(280 100% 65% / 0.05))" }}
                  >
                    <div className="rounded-3xl p-8 flex flex-col items-center gap-4 relative"
                      style={{ background: "rgba(12,10,20,0.9)", backdropFilter: "blur(24px)" }}>
                      {currentTrigger?.is_enabled && (
                        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Active
                        </div>
                      )}
                      <img
                        src={getImageUrl(currentGift.image_url)}
                        alt={currentGift.name}
                        className="w-24 h-24 object-contain drop-shadow-[0_0_24px_hsl(280,100%,65%,0.25)]"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-heading font-bold text-foreground">{currentGift.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Coins size={13} /> {currentGift.coin_value} coins
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={goNext} className="w-10 h-10 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {thumbs.map(({ gift, idx }) => {
                const isActive = idx === currentIndex;
                const isEnabled = triggers.find(t => t.gift_id === gift.gift_id)?.is_enabled;
                return (
                  <button
                    key={`${gift.gift_id}-${idx}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-xl p-2 transition-all duration-200 ${isActive ? "ring-2 ring-primary/40 scale-110" : "opacity-50 hover:opacity-80"}`}
                    style={{ background: "rgba(20,25,35,0.7)" }}
                  >
                    <img
                      src={getImageUrl(gift.image_url)}
                      alt={gift.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    {isEnabled && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />}
                  </button>
                );
              })}
              <span className="text-[10px] text-muted-foreground/50 ml-2">
                {currentIndex + 1}/{filtered.length}
              </span>
            </div>

            {/* Config panel */}
            {currentGift && (
              <motion.div
                key={currentGift.gift_id + "-config"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-[1px]"
                style={{ background: "linear-gradient(135deg, hsl(280 100% 65% / 0.12), hsl(280 100% 65% / 0.02))" }}
              >
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,10,20,0.85)", backdropFilter: "blur(24px)" }}>
                  {/* Toggle */}
                  <div className="px-5 py-4 border-b border-white/[0.04]">
                    <button
                      onClick={() => toggleTrigger(currentGift.gift_id, !currentTrigger?.is_enabled)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                      style={{
                        background: currentTrigger?.is_enabled ? "hsl(160 100% 45% / 0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${currentTrigger?.is_enabled ? "hsl(160 100% 45% / 0.15)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {currentTrigger?.is_enabled ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{currentTrigger?.is_enabled ? "Alert is ON" : "Alert is OFF"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {currentTrigger?.is_enabled ? "Viewers will see an effect when this gift is sent" : "Tap to enable — viewers will see effects for this gift"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-10 h-[22px] rounded-full relative transition-colors ${currentTrigger?.is_enabled ? "bg-primary/30" : "bg-muted/60"}`}>
                        <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${currentTrigger?.is_enabled ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                      </div>
                    </button>
                  </div>

                  {/* Settings */}
                  <div className="px-5 py-4 space-y-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">When this gift is sent…</p>

                    {/* Animation Preview */}
                    <AnimationPreview
                      style={currentAnimStyle}
                      emoji="🌹"
                      giftName={currentGift.name}
                      giftImage={getImageUrl(currentGift.image_url)}
                      isPremium={["3d_flip", "glitch", "firework"].includes(currentAnimStyle)}
                    />

                    {/* Animation Style */}
                    <div>
                      <label className="text-xs font-medium text-foreground mb-2 block">Animation Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {animationOptions.map(opt => {
                          const isActive = currentAnimStyle === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => updateTrigger(currentGift.gift_id, { animation_effect: opt.value })}
                              className={`relative px-2.5 py-2.5 rounded-xl text-[11px] font-medium transition-all ${
                                isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_hsl(160,100%,45%,0.15)]" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border/50"
                              }`}
                            >
                              <span className="mr-1">{opt.emoji}</span> {opt.label}
                              {opt.premium && (
                                <span className="absolute -top-1 -right-1 text-[7px] px-1 py-px rounded-full font-bold"
                                  style={{ background: "linear-gradient(135deg, hsl(45 100% 50%), hsl(280 100% 60%))", color: "hsl(0 0% 0%)" }}>
                                  PRO
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sound */}
                    <div>
                      <label className="text-xs font-medium text-foreground mb-2 block">Alert Sound</label>
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/30 text-left hover:border-border/60 transition-colors">
                        <Volume2 size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground flex-1">
                          {currentTrigger?.alert_sound_url ? "Custom sound" : "Default chime"}
                        </span>
                        <ChevronDown size={12} className="text-muted-foreground" />
                      </button>
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={() => setFullPreview(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-sm font-semibold hover:bg-secondary/15 transition-colors hover:-translate-y-0.5"
                    >
                      <Play size={14} /> Preview This Alert
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Full-screen preview overlay */}
      <AnimatePresence>
        {fullPreview && currentGift && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullPreview(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={() => setFullPreview(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              <X size={18} />
            </button>

            {/* Label */}
            <div className="absolute top-6 left-6 z-10">
              <p className="text-white/40 text-xs font-medium">STREAM PREVIEW</p>
              <p className="text-white/70 text-sm mt-0.5">This is how viewers will see the alert</p>
            </div>

            {/* Large animation */}
            <div className="relative w-full max-w-lg aspect-video">
              <AnimationPreview
                style={currentAnimStyle}
                emoji="🌹"
                giftName={currentGift.name}
                giftImage={getImageUrl(currentGift.image_url)}
                isPremium={["3d_flip", "glitch", "firework"].includes(currentAnimStyle)}
              />
            </div>

            {/* Info bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full z-10"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
              <img
                src={getImageUrl(currentGift.image_url)}
                alt={currentGift.name}
                className="w-6 h-6 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
              />
              <span className="text-white/80 text-xs font-medium">{currentGift.name}</span>
              <span className="text-white/30 text-[10px]">•</span>
              <span className="text-white/50 text-[10px]">{animationOptions.find(a => a.value === currentAnimStyle)?.label}</span>
              <span className="text-white/30 text-[10px]">•</span>
              <span className="text-white/40 text-[10px]">Tap anywhere to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Actions;
