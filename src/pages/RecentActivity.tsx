import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Gift, Heart, UserPlus, Share2, MessageCircle,
  Copy, Plus, Trash2, Settings as SettingsIcon,
  Play, Search, Volume2, Eye, Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { copyToClipboard } from "@/lib/clipboard";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

/* ─── Types ─── */
interface FeedPreset {
  id: string;
  name: string;
  eventTypes: string[];
  animationStyle: string;
  animationDuration: number;
  animationSpeed: number;
  soundEnabled: boolean;
  soundPack: string;
  order: "newest" | "oldest";
  theme: string;
}

interface MockEvent {
  type: string;
  user: string;
  detail: string;
  timestamp: number;
}

/* ─── Constants ─── */
const EVENT_TYPES = [
  { id: "followers", label: "Followers", emoji: "👤", color: "160 100% 45%" },
  { id: "gifts", label: "Gifts", emoji: "🎁", color: "280 100% 65%" },
  { id: "likes", label: "Likes", emoji: "❤️", color: "350 90% 55%" },
  { id: "shares", label: "Shares", emoji: "🔄", color: "200 100% 55%" },
  { id: "comments", label: "Comments", emoji: "💬", color: "45 100% 55%" },
  { id: "joins", label: "Joins", emoji: "👋", color: "160 100% 45%" },
];

const ANIMATION_STYLES = [
  { id: "slide_in", label: "Slide In" },
  { id: "fade_in", label: "Fade In" },
  { id: "pop_up", label: "Pop Up" },
  { id: "zoom", label: "Zoom" },
  { id: "bounce", label: "Bounce" },
];

const SOUND_PACKS = [
  { id: "default", label: "Default" },
  { id: "gamer_pulse", label: "Gamer Pulse" },
  { id: "victory", label: "Victory Fanfare" },
  { id: "echo_boom", label: "Echo Boom" },
  { id: "drop_bass", label: "Drop Bass" },
];

const THEMES = [
  { id: "default", label: "Default", color: "160 100% 45%" },
  { id: "neon_gamer", label: "Neon Gamer", color: "280 100% 65%" },
  { id: "space_hud", label: "Space HUD", color: "200 100% 55%" },
  { id: "fortnite", label: "Fortnite Frame", color: "120 80% 50%" },
  { id: "cod_tactical", label: "COD Tactical", color: "45 100% 55%" },
];

const eventTypeMap: Record<string, { icon: typeof Heart; emoji: string; color: string; filterKey: string }> = {
  like:    { icon: Heart, emoji: "❤️", color: "350 90% 55%", filterKey: "likes" },
  gift:    { icon: Gift, emoji: "🎁", color: "280 100% 65%", filterKey: "gifts" },
  follow:  { icon: UserPlus, emoji: "👤", color: "160 100% 45%", filterKey: "followers" },
  share:   { icon: Share2, emoji: "🔄", color: "200 100% 55%", filterKey: "shares" },
  comment: { icon: MessageCircle, emoji: "💬", color: "45 100% 55%", filterKey: "comments" },
  join:    { icon: Activity, emoji: "👋", color: "160 100% 45%", filterKey: "joins" },
};

const avatarColors = [
  "hsl(280 70% 50%)", "hsl(200 80% 50%)", "hsl(350 80% 55%)",
  "hsl(160 70% 40%)", "hsl(45 90% 50%)", "hsl(120 60% 40%)",
];

const sampleEvents: MockEvent[] = [
  { type: "like", user: "TikTokFan123", detail: "liked!", timestamp: Date.now() - 1000 },
  { type: "gift", user: "ShareQueen", detail: "sent Diamond!", timestamp: Date.now() - 2000 },
  { type: "join", user: "GiftGiver99", detail: "joined the stream!", timestamp: Date.now() - 3000 },
  { type: "follow", user: "NewViewer_23", detail: "started following", timestamp: Date.now() - 4000 },
  { type: "like", user: "HeartSpammer", detail: "sent 50 likes", timestamp: Date.now() - 5000 },
  { type: "share", user: "BestFriend_01", detail: "shared the stream!", timestamp: Date.now() - 6000 },
  { type: "comment", user: "ActiveChatter", detail: '"Love this stream!"', timestamp: Date.now() - 7000 },
  { type: "gift", user: "BigSpender", detail: "sent Lion (5,000 coins)", timestamp: Date.now() - 8000 },
  { type: "join", user: "LateComer", detail: "joined the stream!", timestamp: Date.now() - 9000 },
  { type: "follow", user: "TikTokUser_99", detail: "started following", timestamp: Date.now() - 10000 },
  { type: "comment", user: "ChatMaster", detail: '"Can we get some follows?"', timestamp: Date.now() - 11000 },
  { type: "gift", user: "DiamondKing", detail: "sent Rose!", timestamp: Date.now() - 12000 },
];

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const defaultPreset = (): FeedPreset => ({
  id: crypto.randomUUID(),
  name: "Event Feed",
  eventTypes: ["followers", "gifts", "likes", "shares", "comments", "joins"],
  animationStyle: "slide_in",
  animationDuration: 1.5,
  animationSpeed: 1,
  soundEnabled: false,
  soundPack: "default",
  order: "newest",
  theme: "default",
});

/* ─── Component ─── */
const RecentActivity = () => {
  useAuth();
  const [presets, setPresets] = useState<FeedPreset[]>([defaultPreset()]);
  const [activePresetId, setActivePresetId] = useState(presets[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFilter, setPreviewFilter] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackEvents, setPlaybackEvents] = useState<MockEvent[]>([]);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

  const feedUrl = `${getOverlayBaseUrl()}/overlay/event-feed/${activePreset.id}`;

  const updatePreset = (updates: Partial<FeedPreset>) => {
    setPresets(prev => prev.map(p => p.id === activePresetId ? { ...p, ...updates } : p));
  };

  const addPreset = () => {
    const np = { ...defaultPreset(), name: `Event Feed ${presets.length + 1}` };
    setPresets(prev => [...prev, np]);
    setActivePresetId(np.id);
    toast.success("New feed created!");
  };

  const deletePreset = (id: string) => {
    if (presets.length <= 1) { toast.error("You need at least one feed"); return; }
    setPresets(prev => prev.filter(p => p.id !== id));
    if (activePresetId === id) setActivePresetId(presets.find(p => p.id !== id)!.id);
    toast.success("Feed deleted");
  };

  /* Preview Playback */
  const filteredSampleEvents = sampleEvents.filter(e => {
    const fk = eventTypeMap[e.type]?.filterKey;
    if (!activePreset.eventTypes.includes(fk || "")) return false;
    if (previewFilter !== "all" && fk !== previewFilter) return false;
    if (searchQuery && !e.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setPlaybackEvents([]);
    let idx = 0;
    const events = [...filteredSampleEvents];
    playbackRef.current = setInterval(() => {
      if (idx >= events.length) {
        if (playbackRef.current) clearInterval(playbackRef.current);
        setIsPlaying(false);
        return;
      }
      setPlaybackEvents(prev => [events[idx], ...prev].slice(0, 8));
      idx++;
    }, (activePreset.animationDuration * 1000) / activePreset.animationSpeed);
  }, [filteredSampleEvents, activePreset.animationDuration, activePreset.animationSpeed]);

  useEffect(() => {
    return () => { if (playbackRef.current) clearInterval(playbackRef.current); };
  }, []);

  const handleCopy = (url: string) => {
    copyToClipboard(url);
    toast.success("URL Copied! Paste into OBS / TikTok LIVE Studio");
  };

  /* Stats */
  const stats = {
    likes: sampleEvents.filter(e => e.type === "like").length,
    gifts: sampleEvents.filter(e => e.type === "gift").length,
    followers: sampleEvents.filter(e => e.type === "follow").length,
    total: sampleEvents.length,
  };

  const animVariants: Record<string, any> = {
    slide_in: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 40 } },
    fade_in: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    pop_up: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.5 } },
    zoom: { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 } },
    bounce: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 15 } }, exit: { opacity: 0, y: -20 } },
  };

  const currentAnim = animVariants[activePreset.animationStyle] || animVariants.slide_in;

  // Derive theme colors for preview
  const activeTheme = THEMES.find(t => t.id === activePreset.theme) || THEMES[0];
  const themeColor = activeTheme.color;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto relative z-10 pb-12">
        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold text-foreground">🎉 Event Feeds</h1>
                <PageHelpButton featureKey="recent_activity" />
              </div>
              <p className="text-muted-foreground text-sm mt-1">Create customizable, animated live event feeds for your stream overlays</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Show live activity like follows, gifts, likes, comments & joins on your stream — animated and ready to paste into TikTok LIVE Studio or OBS</p>
            </div>
            <button onClick={addPreset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
              <Plus size={16} /> Create New Feed
            </button>
          </div>
        </motion.div>

        {/* ─── Search & Filter ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..."
              className="pl-9 h-9 rounded-xl bg-muted/20 border-muted/30 text-sm" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", label: "All" }, ...EVENT_TYPES.map(e => ({ id: e.id, label: e.label }))].map(f => (
              <button key={f.id} onClick={() => setPreviewFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                  previewFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(160_100%_45%/0.3)]"
                    : "bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ─── LEFT: Feed Presets ─── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-1 mb-3">Feed Presets</h3>
            {presets.map(preset => (
              <button key={preset.id} onClick={() => setActivePresetId(preset.id)}
                className={`w-full text-left rounded-xl p-3 transition-all duration-200 group relative ${
                  activePresetId === preset.id
                    ? "ring-1 ring-primary/40 shadow-[0_0_20px_hsl(160_100%_45%/0.1)]"
                    : "hover:bg-muted/20"
                }`}
                style={{
                  background: activePresetId === preset.id
                    ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))"
                    : "rgba(255,255,255,0.02)",
                }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-heading font-bold text-foreground truncate">{preset.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setActivePresetId(preset.id); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:bg-primary/10">
                      <SettingsIcon size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {preset.eventTypes.slice(0, 4).map(et => {
                    const ev = EVENT_TYPES.find(e => e.id === et);
                    return ev ? <span key={et} className="text-xs">{ev.emoji}</span> : null;
                  })}
                  {preset.eventTypes.length > 4 && <span className="text-[10px] text-muted-foreground">+{preset.eventTypes.length - 4}</span>}
                </div>
              </button>
            ))}

            {/* Stats */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Feed Analytics</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Events</span><span className="font-bold text-foreground">{stats.total}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">❤️ Likes</span><span className="font-bold" style={{ color: "hsl(350 90% 55%)" }}>{stats.likes}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">🎁 Gifts</span><span className="font-bold" style={{ color: "hsl(280 100% 65%)" }}>{stats.gifts}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">👤 Followers</span><span className="font-bold" style={{ color: "hsl(160 100% 45%)" }}>{stats.followers}</span></div>
              </div>
            </div>
          </motion.div>

          {/* ─── MIDDLE: Live Preview ─── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,23,0.8)", border: `1px solid hsl(${themeColor} / 0.12)` }}>
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <Eye size={14} style={{ color: `hsl(${themeColor})` }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Feed Preview</span>
                </div>
                <button onClick={startPlayback} disabled={isPlaying}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    isPlaying ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}>
                  <Play size={12} fill={isPlaying ? "currentColor" : "none"} />
                  {isPlaying ? "Playing…" : "Play Sample"}
                </button>
              </div>

              {/* Real-time event filter toggles */}
              <div className="px-4 py-2.5 flex flex-wrap gap-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                {EVENT_TYPES.map(et => {
                  const isActive = activePreset.eventTypes.includes(et.id);
                  return (
                    <button key={et.id} onClick={() => updatePreset({
                      eventTypes: isActive
                        ? activePreset.eventTypes.filter(e => e !== et.id)
                        : [...activePreset.eventTypes, et.id]
                    })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                        isActive
                          ? "text-foreground shadow-sm"
                          : "text-muted-foreground/40 line-through"
                      }`}
                      style={{
                        background: isActive ? `hsl(${et.color} / 0.12)` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isActive ? `hsl(${et.color} / 0.25)` : "transparent"}`,
                      }}>
                      <span>{et.emoji}</span> {et.label}
                    </button>
                  );
                })}
              </div>

              {/* Preview Area */}
              <div className="px-4 py-3 min-h-[380px] max-h-[480px] overflow-y-auto space-y-2" style={{ scrollbarWidth: "none" }}>
                <AnimatePresence mode="popLayout">
                  {(isPlaying ? playbackEvents : filteredSampleEvents).map((event, i) => {
                    const config = eventTypeMap[event.type];
                    return (
                      <motion.div key={`${event.user}-${event.type}-${i}-${isPlaying}-${activePreset.animationStyle}-${activePreset.theme}`}
                        {...currentAnim}
                        transition={{ duration: activePreset.animationDuration / activePreset.animationSpeed, delay: isPlaying ? 0 : i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                        style={{
                          background: `linear-gradient(135deg, hsl(${themeColor} / 0.06), hsl(${config?.color || "0 0% 50%"} / 0.04))`,
                          border: `1px solid hsl(${themeColor} / 0.08)`,
                        }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                          style={{ background: getAvatarColor(event.user) }}>
                          {getInitials(event.user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-heading font-bold text-foreground">{event.user}</p>
                          <p className="text-xs text-muted-foreground">{event.detail}</p>
                        </div>
                        <motion.span className="text-lg flex-shrink-0"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}>
                          {config?.emoji}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredSampleEvents.length === 0 && !isPlaying && (
                  <div className="text-center py-16 text-muted-foreground/50 text-sm">
                    No events match your current filters.
                  </div>
                )}
              </div>
            </div>

            {/* ─── Overlay URLs ─── */}
            <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Overlay URLs</h4>
              <div className="space-y-2">
                {[
                  { label: "Primary Overlay", url: feedUrl },
                  { label: "Animated", url: `${feedUrl}?mode=animated` },
                  { label: "Preview", url: `${feedUrl}?mode=preview` },
                ].map(link => (
                  <div key={link.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
                    <span className="text-[10px] font-bold text-primary/70 w-16 flex-shrink-0">{link.label}</span>
                    <span className="flex-1 text-[10px] font-mono text-muted-foreground/60 truncate">{link.url}</span>
                    <button onClick={() => handleCopy(link.url)}
                      className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-2">Width: 1920px · Height: 1080px · 30fps recommended</p>
            </div>
          </motion.div>

          {/* ─── RIGHT: Settings Panel ─── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,23,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <SettingsIcon size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feed Settings</span>
              </div>

              <div className="p-4 space-y-5 max-h-[700px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* Feed Name */}
                <SettingSection label="Feed Name">
                  <Input value={activePreset.name} onChange={e => updatePreset({ name: e.target.value })}
                    className="h-9 rounded-xl bg-muted/15 border-muted/20 text-sm" />
                </SettingSection>

                {/* Event Types */}
                <SettingSection label="Show These Events">
                  <div className="space-y-2">
                    {EVENT_TYPES.map(et => (
                      <label key={et.id} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox checked={activePreset.eventTypes.includes(et.id)}
                          onCheckedChange={(checked) => updatePreset({
                            eventTypes: checked
                              ? [...activePreset.eventTypes, et.id]
                              : activePreset.eventTypes.filter(e => e !== et.id)
                          })} />
                        <span className="text-sm">{et.emoji}</span>
                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{et.label}</span>
                      </label>
                    ))}
                  </div>
                </SettingSection>

                {/* Animation Style */}
                <SettingSection label="Animation Style">
                  <div className="grid grid-cols-2 gap-1.5">
                    {ANIMATION_STYLES.map(s => (
                      <button key={s.id} onClick={() => updatePreset({ animationStyle: s.id })}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                          activePreset.animationStyle === s.id
                            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </SettingSection>

                {/* Duration & Speed */}
                <SettingSection label="Animation Timing">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-bold text-foreground">{activePreset.animationDuration}s</span>
                      </div>
                      <input type="range" min={0.5} max={3} step={0.1} value={activePreset.animationDuration}
                        onChange={e => updatePreset({ animationDuration: parseFloat(e.target.value) })}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-primary" style={{ background: "hsl(160 100% 45% / 0.2)" }} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-bold text-foreground">{activePreset.animationSpeed}x</span>
                      </div>
                      <input type="range" min={0.5} max={3} step={0.1} value={activePreset.animationSpeed}
                        onChange={e => updatePreset({ animationSpeed: parseFloat(e.target.value) })}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-primary" style={{ background: "hsl(160 100% 45% / 0.2)" }} />
                    </div>
                  </div>
                </SettingSection>

                {/* Sound */}
                <SettingSection label="Sound on Event">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Enabled</span>
                      <Switch checked={activePreset.soundEnabled} onCheckedChange={v => updatePreset({ soundEnabled: v })} />
                    </div>
                    {activePreset.soundEnabled && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {SOUND_PACKS.map(sp => (
                          <button key={sp.id} onClick={() => updatePreset({ soundPack: sp.id })}
                            className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                              activePreset.soundPack === sp.id
                                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                            }`}>
                            <Volume2 size={10} /> {sp.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </SettingSection>

                {/* Order */}
                <SettingSection label="Output Order">
                  <div className="flex gap-1.5">
                    {[{ id: "newest" as const, label: "Newest First" }, { id: "oldest" as const, label: "Oldest First" }].map(o => (
                      <button key={o.id} onClick={() => updatePreset({ order: o.id })}
                        className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                          activePreset.order === o.id
                            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                        }`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </SettingSection>

                {/* Theme */}
                <SettingSection label="Visual Theme">
                  <div className="grid grid-cols-2 gap-1.5">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => updatePreset({ theme: t.id })}
                        className={`px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all relative overflow-hidden ${
                          activePreset.theme === t.id
                            ? "ring-1 text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={{
                          background: activePreset.theme === t.id ? `hsl(${t.color} / 0.1)` : "rgba(255,255,255,0.03)",
                          borderColor: activePreset.theme === t.id ? `hsl(${t.color} / 0.3)` : "transparent",
                        }}>

                        <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: `hsl(${t.color})` }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </SettingSection>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Banner ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(280 100% 65% / 0.08), hsl(160 100% 45% / 0.06))",
            border: "1px solid hsl(280 100% 65% / 0.12)",
          }}>
          <Zap size={20} className="mx-auto mb-2" style={{ color: "hsl(280 100% 70%)" }} />
          <p className="text-sm font-heading font-bold text-foreground mb-1">Animated Event Feeds</p>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Instantly Preview, Customize, and Deploy to OBS or TikTok LIVE Studio. Live preview animations · Full styling · Sound sync · Responsive event filtering.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
};

/* ─── Setting Section Helper ─── */
const SettingSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">{label}</h4>
    {children}
  </div>
);

export default RecentActivity;
