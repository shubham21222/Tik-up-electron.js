import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Gift, Search, Volume2, Sparkles, Play, X, Check,
  ChevronDown, Coins, Eye, EyeOff
} from "lucide-react";
import { useGiftCatalog, useUserGiftTriggers } from "@/hooks/use-gift-catalog";
import { toast } from "sonner";

const animationOptions = [
  { value: "bounce", label: "Bounce In" },
  { value: "slide", label: "Slide Up" },
  { value: "explosion", label: "Explosion" },
  { value: "3d_flip", label: "3D Flip" },
  { value: "glitch", label: "Glitch" },
  { value: "firework", label: "Firework" },
];

const Actions = () => {
  const { gifts, loading: giftsLoading } = useGiftCatalog();
  const { triggers, toggleTrigger, updateTrigger } = useUserGiftTriggers();
  const [search, setSearch] = useState("");
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = gifts;
    if (search) result = result.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
    if (filterValue === "enabled") result = result.filter(g => triggers.find(t => t.gift_id === g.gift_id)?.is_enabled);
    if (filterValue === "1") result = result.filter(g => g.coin_value <= 5);
    if (filterValue === "10") result = result.filter(g => g.coin_value >= 10 && g.coin_value <= 50);
    if (filterValue === "100") result = result.filter(g => g.coin_value >= 100);
    return result;
  }, [gifts, search, filterValue, triggers]);

  const selectedGiftData = gifts.find(g => g.gift_id === selectedGift);
  const selectedTrigger = triggers.find(t => t.gift_id === selectedGift);

  const getImageUrl = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("/")) return url;
    return url;
  };

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={18} className="text-secondary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Gift Alerts</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            When someone sends a gift → choose what happens on your stream. Tap any gift to set it up.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gifts..."
              className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30">
            {[
              { value: "all", label: "All" },
              { value: "enabled", label: "Active" },
              { value: "1", label: "1-5 🪙" },
              { value: "10", label: "10-50 🪙" },
              { value: "100", label: "100+ 🪙" },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterValue(f.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${filterValue === f.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Gift Grid - 3 cols */}
          <div className="lg:col-span-3">
            {giftsLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading gifts...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filtered.map((gift, i) => {
                  const isEnabled = triggers.find(t => t.gift_id === gift.gift_id)?.is_enabled;
                  const isSelected = selectedGift === gift.gift_id;
                  return (
                    <motion.button
                      key={gift.gift_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.015 }}
                      onClick={() => setSelectedGift(gift.gift_id)}
                      className={`relative rounded-2xl p-[1px] group transition-all duration-200 hover:-translate-y-1`}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, hsl(280 100% 65% / 0.4), hsl(280 100% 65% / 0.1))"
                          : isEnabled
                          ? "linear-gradient(135deg, hsl(160 100% 45% / 0.2), hsl(160 100% 45% / 0.05))"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      }}
                    >
                      <div className="rounded-2xl p-3 flex flex-col items-center gap-2 relative"
                        style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(16px)" }}>
                        {/* Enabled indicator */}
                        {isEnabled && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <img
                          src={getImageUrl(gift.image_url)}
                          alt={gift.name}
                          className="w-12 h-12 object-contain drop-shadow-lg"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                        <span className="text-[11px] font-medium text-foreground text-center leading-tight line-clamp-1">
                          {gift.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Coins size={9} /> {gift.coin_value}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Configuration Panel - 2 cols */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedGiftData ? (
                <motion.div
                  key={selectedGiftData.gift_id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="sticky top-20 rounded-2xl p-[1px]"
                  style={{ background: "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 65% / 0.03))" }}
                >
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,10,20,0.9)", backdropFilter: "blur(24px)" }}>
                    {/* Preview */}
                    <div className="relative h-[200px] flex items-center justify-center overflow-hidden"
                      style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.06), hsl(0 0% 2%))" }}>
                      <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "24px 24px"
                      }} />
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="flex flex-col items-center gap-3 relative z-10"
                      >
                        <img
                          src={getImageUrl(selectedGiftData.image_url)}
                          alt={selectedGiftData.name}
                          className="w-20 h-20 object-contain drop-shadow-[0_0_20px_hsl(280,100%,65%,0.3)]"
                        />
                        <div className="text-center">
                          <h3 className="text-lg font-heading font-bold text-foreground">{selectedGiftData.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                            <Coins size={11} /> {selectedGiftData.coin_value} coins
                          </p>
                        </div>
                      </motion.div>
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-[9px] text-white/40 font-mono">PREVIEW</span>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="px-5 py-4 border-b border-white/[0.04]">
                      <button
                        onClick={() => toggleTrigger(selectedGiftData.gift_id, !selectedTrigger?.is_enabled)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                        style={{
                          background: selectedTrigger?.is_enabled ? "hsl(160 100% 45% / 0.08)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selectedTrigger?.is_enabled ? "hsl(160 100% 45% / 0.15)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {selectedTrigger?.is_enabled ? (
                            <Eye size={16} className="text-primary" />
                          ) : (
                            <EyeOff size={16} className="text-muted-foreground" />
                          )}
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              {selectedTrigger?.is_enabled ? "Alert is ON" : "Alert is OFF"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {selectedTrigger?.is_enabled
                                ? "Viewers will see an effect when this gift is sent"
                                : "Tap to enable — viewers will see effects for this gift"}
                            </p>
                          </div>
                        </div>
                        <div className={`w-10 h-[22px] rounded-full relative transition-colors ${selectedTrigger?.is_enabled ? "bg-primary/30" : "bg-muted/60"}`}>
                          <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${selectedTrigger?.is_enabled ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                        </div>
                      </button>
                    </div>

                    {/* Settings */}
                    <div className="px-5 py-4 space-y-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                        When this gift is sent…
                      </p>

                      {/* Animation Style */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-2 block">Animation Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {animationOptions.map(opt => {
                            const isActive = (selectedTrigger?.animation_effect || "bounce") === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => updateTrigger(selectedGiftData.gift_id, { animation_effect: opt.value })}
                                className={`px-2.5 py-2 rounded-xl text-[11px] font-medium transition-all ${
                                  isActive ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border/50"
                                }`}
                              >
                                {opt.label}
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
                            {selectedTrigger?.alert_sound_url ? "Custom sound" : "Default chime"}
                          </span>
                          <ChevronDown size={12} className="text-muted-foreground" />
                        </button>
                      </div>

                      {/* Test Button */}
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-sm font-semibold hover:bg-secondary/15 transition-colors hover:-translate-y-0.5">
                        <Play size={14} /> Preview This Alert
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="sticky top-20 rounded-2xl p-[1px]"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div className="rounded-2xl px-8 py-16 flex flex-col items-center justify-center text-center"
                    style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                      <Gift size={28} className="text-secondary/50" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-foreground mb-2">Select a Gift</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      Tap any gift from the grid to set up what happens when viewers send it.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Actions;
