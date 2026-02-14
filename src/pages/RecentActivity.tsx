import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Gift, Heart, UserPlus, Share2, MessageCircle,
  Copy, Plus, Trash2, Settings as SettingsIcon,
  Play, Search, Volume2, Eye, Zap, Lock, Crown,
  FlaskConical, Pencil, Check, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

/* ─── Types ─── */
interface FeedPreset {
  id: string;
  name: string;
  publicToken: string;
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
  { id: "joins", label: "Joins", emoji: "👋", color: "120 70% 45%" },
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
  { id: "default", label: "Default", color: "160 100% 45%", desc: "Clean dark, subtle green" },
  { id: "neon_gamer", label: "Neon Gamer", color: "280 100% 65%", desc: "Bright neon, pulse edges" },
  { id: "space_hud", label: "Space HUD", color: "200 100% 55%", desc: "Sci-fi grid + glow" },
  { id: "fortnite", label: "Fortnite Frame", color: "120 80% 50%", desc: "Cartoon frame + shields" },
  { id: "cod_tactical", label: "COD Tactical", color: "45 100% 55%", desc: "Military HUD scanlines" },
  { id: "cyber_pulse", label: "Cyber Pulse", color: "180 100% 50%", desc: "Electric lines, FX sparks" },
];

/* ─── Per-theme visual config ─── */
const getThemeStyles = (themeId: string, themeColor: string) => {
  const base = {
    previewBg: "rgba(15,15,23,0.8)",
    previewBorder: `1px solid hsl(${themeColor} / 0.12)`,
    cardBg: (eventColor: string) => `linear-gradient(135deg, hsl(${themeColor} / 0.05), hsl(${eventColor} / 0.04))`,
    cardBorder: `1px solid hsl(${themeColor} / 0.08)`,
    cardRadius: "0.75rem",
    fontClass: "font-heading",
    overlayElement: null as React.ReactNode,
    avatarRadius: "9999px",
    cardExtra: {} as React.CSSProperties,
    usernameColor: undefined as string | undefined,
    detailColor: undefined as string | undefined,
  };

  switch (themeId) {
    case "neon_gamer":
      return {
        ...base,
        previewBg: "rgba(20,8,30,0.9)",
        previewBorder: `1px solid hsl(280 100% 65% / 0.25)`,
        cardBg: (ec: string) => `linear-gradient(135deg, hsl(280 80% 20% / 0.2), hsl(${ec} / 0.08))`,
        cardBorder: `1px solid hsl(280 100% 65% / 0.2)`,
        cardExtra: { boxShadow: "inset 0 0 20px hsl(280 100% 65% / 0.05), 0 0 15px hsl(280 100% 65% / 0.08)" },
        usernameColor: "hsl(280 100% 80%)",
      };
    case "space_hud":
      return {
        ...base,
        previewBg: "rgba(5,12,25,0.95)",
        previewBorder: `1px solid hsl(200 100% 55% / 0.2)`,
        cardBg: (ec: string) => `linear-gradient(180deg, hsl(200 80% 15% / 0.15), hsl(${ec} / 0.05))`,
        cardBorder: `1px solid hsl(200 100% 55% / 0.15)`,
        cardRadius: "0.5rem",
        cardExtra: { boxShadow: "0 0 1px hsl(200 100% 55% / 0.4), inset 0 1px 0 hsl(200 100% 55% / 0.1)" },
        usernameColor: "hsl(200 100% 75%)",
        overlayElement: (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(0deg, transparent 24%, hsl(200 100% 55% / 0.15) 25%, hsl(200 100% 55% / 0.15) 26%, transparent 27%, transparent 74%, hsl(200 100% 55% / 0.15) 75%, hsl(200 100% 55% / 0.15) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, hsl(200 100% 55% / 0.15) 25%, hsl(200 100% 55% / 0.15) 26%, transparent 27%, transparent 74%, hsl(200 100% 55% / 0.15) 75%, hsl(200 100% 55% / 0.15) 76%, transparent 77%)", backgroundSize: "50px 50px" }} />
        ),
      };
    case "fortnite":
      return {
        ...base,
        previewBg: "rgba(8,18,12,0.9)",
        previewBorder: `2px solid hsl(120 80% 50% / 0.25)`,
        cardBg: (ec: string) => `linear-gradient(135deg, hsl(120 60% 15% / 0.2), hsl(${ec} / 0.06))`,
        cardBorder: `2px solid hsl(120 80% 50% / 0.15)`,
        cardRadius: "0.5rem",
        cardExtra: { boxShadow: "0 2px 0 hsl(120 80% 50% / 0.15), inset 0 0 15px hsl(120 80% 50% / 0.04)" },
        usernameColor: "hsl(120 80% 70%)",
        avatarRadius: "0.5rem",
      };
    case "cod_tactical":
      return {
        ...base,
        previewBg: "rgba(15,14,10,0.95)",
        previewBorder: `1px solid hsl(45 80% 40% / 0.25)`,
        cardBg: (ec: string) => `linear-gradient(90deg, hsl(45 60% 12% / 0.2), hsl(${ec} / 0.04), transparent)`,
        cardBorder: `1px solid hsl(45 80% 40% / 0.15)`,
        cardRadius: "0.25rem",
        cardExtra: { boxShadow: "inset 2px 0 0 hsl(45 100% 55% / 0.3)" },
        usernameColor: "hsl(45 100% 70%)",
        avatarRadius: "0.25rem",
        overlayElement: (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(45 100% 55% / 0.2) 2px, hsl(45 100% 55% / 0.2) 3px)", backgroundSize: "100% 4px" }} />
        ),
      };
    case "cyber_pulse":
      return {
        ...base,
        previewBg: "rgba(5,15,20,0.95)",
        previewBorder: `1px solid hsl(180 100% 50% / 0.25)`,
        cardBg: (ec: string) => `linear-gradient(135deg, hsl(180 80% 15% / 0.15), hsl(${ec} / 0.06))`,
        cardBorder: `1px solid hsl(180 100% 50% / 0.18)`,
        cardExtra: { boxShadow: "0 0 12px hsl(180 100% 50% / 0.06), inset 0 0 20px hsl(180 100% 50% / 0.03)" },
        usernameColor: "hsl(180 100% 70%)",
      };
    default:
      return base;
  }
};

const eventTypeMap: Record<string, { icon: typeof Heart; emoji: string; color: string; filterKey: string }> = {
  like:    { icon: Heart, emoji: "❤️", color: "350 90% 55%", filterKey: "likes" },
  gift:    { icon: Gift, emoji: "🎁", color: "280 100% 65%", filterKey: "gifts" },
  follow:  { icon: UserPlus, emoji: "👤", color: "160 100% 45%", filterKey: "followers" },
  share:   { icon: Share2, emoji: "🔄", color: "200 100% 55%", filterKey: "shares" },
  comment: { icon: MessageCircle, emoji: "💬", color: "45 100% 55%", filterKey: "comments" },
  join:    { icon: Activity, emoji: "👋", color: "120 70% 45%", filterKey: "joins" },
};

const avatarColors = [
  "hsl(280 70% 50%)", "hsl(200 80% 50%)", "hsl(350 80% 55%)",
  "hsl(160 70% 40%)", "hsl(45 90% 50%)", "hsl(120 60% 40%)",
];

const sampleEvents: MockEvent[] = [
  { type: "follow", user: "NewViewer_23", detail: "started following", timestamp: Date.now() - 1000 },
  { type: "gift", user: "ShareQueen", detail: "sent Diamond! 💎", timestamp: Date.now() - 2000 },
  { type: "like", user: "HeartSpammer", detail: "sent 50 likes", timestamp: Date.now() - 3000 },
  { type: "comment", user: "ActiveChatter", detail: '"Love this stream! 🔥"', timestamp: Date.now() - 4000 },
  { type: "join", user: "GiftGiver99", detail: "joined the stream", timestamp: Date.now() - 5000 },
  { type: "gift", user: "BigSpender", detail: "sent Lion (5,000 coins)", timestamp: Date.now() - 6000 },
  { type: "share", user: "BestFriend_01", detail: "shared the stream!", timestamp: Date.now() - 7000 },
  { type: "follow", user: "TikTokUser_99", detail: "started following", timestamp: Date.now() - 8000 },
  { type: "like", user: "TikTokFan123", detail: "liked!", timestamp: Date.now() - 9000 },
  { type: "comment", user: "ChatMaster", detail: '"Can we get some follows?"', timestamp: Date.now() - 10000 },
  { type: "gift", user: "DiamondKing", detail: "sent Rose! 🌹", timestamp: Date.now() - 11000 },
  { type: "join", user: "LateComer", detail: "joined the stream", timestamp: Date.now() - 12000 },
];

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const _defaultPreset = (): FeedPreset => ({
  id: crypto.randomUUID(),
  publicToken: "",
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

const animVariants: Record<string, any> = {
  slide_in: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 40 } },
  fade_in: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  pop_up: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }, exit: { opacity: 0, scale: 0.5 } },
  zoom: { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 } },
  bounce: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 15 } }, exit: { opacity: 0, y: -20 } },
};

/* ─── Component ─── */
const RecentActivity = () => {
  useAuth();
  const { isPro } = useSubscription();
  const { widgets, loading: widgetsLoading, createWidget, updateSettings, deleteWidget } = useOverlayWidgets("event_feed");

  // Derive presets from widgets
  const presets: FeedPreset[] = widgets.map(w => ({
    id: w.id,
    name: w.name,
    publicToken: w.public_token,
    eventTypes: w.settings?.eventTypes || ["followers", "gifts", "likes", "shares", "comments", "joins"],
    animationStyle: w.settings?.animationStyle || "slide_in",
    animationDuration: w.settings?.animationDuration || 1.5,
    animationSpeed: w.settings?.animationSpeed || 1,
    soundEnabled: w.settings?.soundEnabled || false,
    soundPack: w.settings?.soundPack || "default",
    order: w.settings?.order || "newest",
    theme: w.settings?.theme || "default",
  }));

  const [activePresetId, setActivePresetId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFilter, setPreviewFilter] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackEvents, setPlaybackEvents] = useState<MockEvent[]>([]);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-select first preset or create one
  useEffect(() => {
    if (widgetsLoading) return;
    if (presets.length > 0 && !activePresetId) {
      setActivePresetId(presets[0].id);
    } else if (presets.length === 0 && isPro) {
      createWidget("event_feed", "Event Feed").then(w => {
        if (w) setActivePresetId(w.id);
      });
    }
  }, [widgetsLoading, presets.length, isPro]);

  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];
  const activeTheme = THEMES.find(t => t.id === (activePreset?.theme || "default")) || THEMES[0];
  const themeColor = activeTheme.color;
  const currentAnim = animVariants[activePreset?.animationStyle || "slide_in"] || animVariants.slide_in;
  const themeStyles = getThemeStyles(activePreset?.theme || "default", themeColor);

  const feedUrl = activePreset?.publicToken ? `https://tikup.xyz/overlay/event-feed/${activePreset.publicToken}` : "";

  const updatePreset = async (updates: Partial<FeedPreset>) => {
    if (!activePreset) return;
    const newSettings = {
      eventTypes: updates.eventTypes ?? activePreset.eventTypes,
      animationStyle: updates.animationStyle ?? activePreset.animationStyle,
      animationDuration: updates.animationDuration ?? activePreset.animationDuration,
      animationSpeed: updates.animationSpeed ?? activePreset.animationSpeed,
      soundEnabled: updates.soundEnabled ?? activePreset.soundEnabled,
      soundPack: updates.soundPack ?? activePreset.soundPack,
      order: updates.order ?? activePreset.order,
      theme: updates.theme ?? activePreset.theme,
    };
    await updateSettings(activePreset.id, newSettings);
  };

  const addPreset = async () => {
    if (!isPro) return;
    const w = await createWidget("event_feed", `Event Feed ${presets.length + 1}`);
    if (w) setActivePresetId(w.id);
  };

  const handleDeletePreset = async (id: string) => {
    if (presets.length <= 1) { toast.error("You need at least one feed"); return; }
    await deleteWidget(id);
    if (activePresetId === id) {
      const remaining = presets.filter(p => p.id !== id);
      if (remaining.length > 0) setActivePresetId(remaining[0].id);
    }
  };

  const startEditName = (id: string, name: string) => {
    setEditingName(id);
    setEditNameValue(name);
  };

  const saveEditName = async () => {
    if (!editingName) return;
    const preset = presets.find(p => p.id === editingName);
    if (!preset) return;
    // Update name via direct supabase call since hook only updates settings
    const { supabase } = await import("@/integrations/supabase/client");
    await (supabase as any).from("overlay_widgets").update({ name: editNameValue }).eq("id", editingName);
    setEditingName(null);
    toast.success("Feed renamed!");
    // Trigger refetch
    window.location.reload();
  };

  /* Preview filtering */
  const filteredSampleEvents = sampleEvents.filter(e => {
    if (!activePreset) return true;
    const fk = eventTypeMap[e.type]?.filterKey;
    if (!activePreset.eventTypes?.includes(fk || "")) return false;
    if (previewFilter !== "all" && fk !== previewFilter) return false;
    if (searchQuery && !e.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const displayEvents = activePreset?.order === "oldest" ? [...filteredSampleEvents].reverse() : filteredSampleEvents;

  /* Playback */
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
    }, ((activePreset?.animationDuration ?? 1) * 1000) / (activePreset?.animationSpeed ?? 1));
  }, [filteredSampleEvents, activePreset?.animationDuration, activePreset?.animationSpeed]);

  const runTestEvents = useCallback(() => {
    const testSequence: MockEvent[] = [
      { type: "follow", user: "TestFollower", detail: "started following", timestamp: Date.now() },
      { type: "gift", user: "TestGifter", detail: "sent Diamond! 💎", timestamp: Date.now() },
      { type: "like", user: "TestLiker", detail: "sent 10 likes", timestamp: Date.now() },
      { type: "comment", user: "TestChatter", detail: '"Great stream!"', timestamp: Date.now() },
    ];
    setIsPlaying(true);
    setPlaybackEvents([]);
    let idx = 0;
    playbackRef.current = setInterval(() => {
      if (idx >= testSequence.length) {
        if (playbackRef.current) clearInterval(playbackRef.current);
        setIsPlaying(false);
        return;
      }
      setPlaybackEvents(prev => [testSequence[idx], ...prev]);
      idx++;
    }, 800);
  }, []);

  useEffect(() => {
    return () => { if (playbackRef.current) clearInterval(playbackRef.current); };
  }, []);

  const handleCopy = (url: string) => {
    copyToClipboard(url);
    toast.success("✅ URL Copied! Paste into OBS / TikTok LIVE Studio");
  };

  /* Stats */
  const stats = {
    likes: sampleEvents.filter(e => e.type === "like").length,
    gifts: sampleEvents.filter(e => e.type === "gift").length,
    followers: sampleEvents.filter(e => e.type === "follow").length,
    total: sampleEvents.length,
  };

  if (!activePreset && !widgetsLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-sm">Loading event feeds…</p>
        </div>
      </AppLayout>
    );
  }

  if (!activePreset) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-sm">Setting up your first feed…</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto relative z-10 pb-12">
        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold text-foreground">🎆 Event Feeds</h1>
                <motion.span
                  animate={{ boxShadow: ["0 0 8px hsl(280 100% 65% / 0.3)", "0 0 20px hsl(280 100% 65% / 0.5)", "0 0 8px hsl(280 100% 65% / 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "hsl(280 100% 65% / 0.12)", border: "1px solid hsl(280 100% 65% / 0.3)", color: "hsl(280 100% 75%)" }}>
                  <Crown size={10} /> Pro
                </motion.span>
                <PageHelpButton featureKey="recent_activity" />
              </div>
              <p className="text-muted-foreground text-sm mt-1">Create customizable, <span className="text-foreground font-medium">animated live event feeds</span> for your stream overlays</p>
              <p className="text-muted-foreground/50 text-xs mt-1">Preview live, customize & deploy to OBS / TikTok LIVE Studio</p>
            </div>
            <button onClick={addPreset} disabled={!isPro}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Plus size={16} /> Create New Feed
            </button>
          </div>
        </motion.div>

        {/* ─── Pro Lock Overlay ─── */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-center max-w-md mx-auto p-8 rounded-3xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(280 60% 8%), hsl(260 40% 6%))", border: "1px solid hsl(280 100% 65% / 0.15)" }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "hsl(280 100% 65% / 0.12)", border: "1px solid hsl(280 100% 65% / 0.2)" }}>
                <Lock size={28} style={{ color: "hsl(280 100% 70%)" }} />
              </motion.div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Animated Event Feeds are PRO only</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Upgrade to unlock animated previews, customizable themes, sound packs, and ready-to-use overlay URLs.
              </p>
              <Link to="/pro"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, hsl(280 100% 60%), hsl(320 100% 55%))", boxShadow: "0 4px 30px hsl(280 100% 60% / 0.3)" }}>
                <Crown size={16} /> Upgrade to Pro
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Search & Filter ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events…"
              className="pl-9 h-9 rounded-xl bg-muted/20 border-muted/30 text-sm" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", label: "All" }, ...EVENT_TYPES.map(e => ({ id: e.id, label: e.label }))].map(f => (
              <button key={f.id} onClick={() => setPreviewFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
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
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1 mb-3">Feed Presets</h3>
            {presets.map(preset => (
              <div key={preset.id} onClick={() => setActivePresetId(preset.id)}
                className={`rounded-xl p-3.5 transition-all duration-200 cursor-pointer group relative ${
                  activePresetId === preset.id ? "ring-1 shadow-lg" : "hover:bg-muted/15"
                }`}
                style={{
                  background: activePresetId === preset.id
                    ? `linear-gradient(135deg, hsl(${themeColor} / 0.06), rgba(255,255,255,0.02))`
                    : "rgba(255,255,255,0.02)",
                  borderColor: activePresetId === preset.id ? `hsl(${themeColor} / 0.25)` : "transparent",
                  boxShadow: activePresetId === preset.id ? `0 0 20px hsl(${themeColor} / 0.08)` : "none",
                  border: `1px solid ${activePresetId === preset.id ? `hsl(${themeColor} / 0.15)` : "rgba(255,255,255,0.04)"}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  {editingName === preset.id ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <Input value={editNameValue} onChange={e => setEditNameValue(e.target.value)}
                        className="h-7 text-xs rounded-lg bg-muted/20 border-muted/30" autoFocus
                        onKeyDown={e => e.key === "Enter" && saveEditName()} />
                      <button onClick={saveEditName} className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:bg-primary/10">
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-heading font-bold text-foreground truncate">{preset.name}</span>
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startEditName(preset.id, preset.name); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <Pencil size={11} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                {/* Event type icons */}
                <div className="flex gap-1.5 flex-wrap">
                  {preset.eventTypes.map(et => {
                    const ev = EVENT_TYPES.find(e => e.id === et);
                    return ev ? <span key={et} className="text-[11px]">{ev.emoji}</span> : null;
                  })}
                </div>
                {/* Event type text */}
                <p className="text-[10px] text-muted-foreground/50 mt-1 truncate">
                  {preset.eventTypes.map(et => EVENT_TYPES.find(e => e.id === et)?.label).filter(Boolean).join(", ")}
                </p>
              </div>
            ))}

            {/* Stats */}
            <div className="mt-4 p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2.5">Feed Analytics</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Events</span><span className="font-bold text-foreground">{stats.total}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">❤️ Likes</span><span className="font-bold" style={{ color: "hsl(350 90% 55%)" }}>{stats.likes}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">🎁 Gifts</span><span className="font-bold" style={{ color: "hsl(280 100% 65%)" }}>{stats.gifts}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">👤 Followers</span><span className="font-bold" style={{ color: "hsl(160 100% 45%)" }}>{stats.followers}</span></div>
              </div>
            </div>
          </motion.div>

          {/* ─── CENTER: Live Preview ─── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden transition-all duration-500 relative"
              style={{ background: themeStyles.previewBg, border: themeStyles.previewBorder }}>
              {/* Theme overlay (scanlines, grids, etc.) */}
              {themeStyles.overlayElement}

              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3 relative z-10" style={{ borderBottom: `1px solid hsl(${themeColor} / 0.08)` }}>
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Eye size={14} style={{ color: `hsl(${themeColor})` }} />
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Feed Preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={runTestEvents} disabled={isPlaying}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-secondary/10 text-secondary hover:bg-secondary/20 disabled:opacity-40">
                    <FlaskConical size={10} /> Test Events
                  </button>
                  <button onClick={startPlayback} disabled={isPlaying}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40"
                    style={{ background: `hsl(${themeColor} / 0.1)`, color: `hsl(${themeColor})` }}>
                    <Play size={12} fill={isPlaying ? "currentColor" : "none"} />
                    {isPlaying ? "Playing…" : "Play Sample"}
                  </button>
                </div>
              </div>

              {/* Real-time event filter toggles */}
              <div className="px-4 py-2.5 flex flex-wrap gap-1.5 relative z-10" style={{ borderBottom: `1px solid hsl(${themeColor} / 0.05)` }}>
                {EVENT_TYPES.map(et => {
                  const isActive = activePreset.eventTypes.includes(et.id);
                  return (
                    <button key={et.id} onClick={() => updatePreset({
                      eventTypes: isActive
                        ? activePreset.eventTypes.filter(e => e !== et.id)
                        : [...activePreset.eventTypes, et.id]
                    })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                        isActive ? "text-foreground shadow-sm" : "text-muted-foreground/40 line-through"
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
              <div className="px-4 py-3 min-h-[360px] max-h-[460px] overflow-y-auto space-y-2 relative z-10" style={{ scrollbarWidth: "none" }}>
                <AnimatePresence mode="popLayout">
                  {(isPlaying ? playbackEvents : displayEvents).map((event, i) => {
                    const config = eventTypeMap[event.type];
                    return (
                      <motion.div key={`${event.user}-${event.type}-${i}-${isPlaying}-${activePreset?.animationStyle}-${activePreset?.theme}`}
                        {...currentAnim}
                        transition={{ duration: (activePreset?.animationDuration ?? 1) / (activePreset?.animationSpeed ?? 1), delay: isPlaying ? 0 : i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3 transition-all duration-300"
                        style={{
                          background: themeStyles.cardBg(config?.color || "0 0% 50%"),
                          border: themeStyles.cardBorder,
                          borderRadius: themeStyles.cardRadius,
                          ...themeStyles.cardExtra,
                        }}>
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                          style={{ background: getAvatarColor(event.user), borderRadius: themeStyles.avatarRadius }}>
                          {getInitials(event.user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${themeStyles.fontClass} font-bold`}
                            style={{ color: themeStyles.usernameColor || "hsl(0 0% 88%)" }}>
                            {event.user}
                          </p>
                          <p className="text-xs" style={{ color: themeStyles.detailColor || "hsl(0 0% 40%)" }}>{event.detail}</p>
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

                {displayEvents.length === 0 && !isPlaying && (
                  <div className="text-center py-16 text-muted-foreground/50 text-sm">
                    No events match your current filters.
                  </div>
                )}
              </div>
            </div>

            {/* ─── Overlay URL ─── */}
            <div className="mt-4 rounded-2xl p-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, hsl(${themeColor} / 0.03), rgba(255,255,255,0.02))`, border: `1px solid hsl(${themeColor} / 0.1)` }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} style={{ color: `hsl(${themeColor})` }} />
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Your Event Feed Overlay URL</h4>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mb-3">Paste this single URL into TikTok LIVE Studio or OBS as a Browser Source</p>
              
              {feedUrl ? (
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl transition-all duration-200"
                  style={{ background: "rgba(0,0,0,0.4)", border: `1px solid hsl(${themeColor} / 0.15)` }}>
                  <span className="flex-1 text-[11px] font-mono text-foreground/70 truncate select-all">{feedUrl}</span>
                  <button onClick={() => handleCopy(feedUrl)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.12)`, color: `hsl(${themeColor})`, border: `1px solid hsl(${themeColor} / 0.2)` }}>
                    <Copy size={11} /> Copy URL
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40">Save your feed to generate an overlay URL</p>
              )}

              <p className="text-[10px] text-muted-foreground/30 mt-2.5">Recommended: Width 1920px · Height 1080px · 30fps · Connected to your TikTok LIVE events in real-time</p>
            </div>
          </motion.div>

          {/* ─── RIGHT: Settings Panel ─── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,23,0.8)", border: `1px solid hsl(${themeColor} / 0.1)` }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid hsl(${themeColor} / 0.06)` }}>
                <SettingsIcon size={14} style={{ color: `hsl(${themeColor})` }} />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feed Settings</span>
              </div>

              <div className="p-4 space-y-5 max-h-[700px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
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
                            ? "text-foreground ring-1"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                        }`}
                        style={activePreset.animationStyle === s.id ? {
                          background: `hsl(${themeColor} / 0.1)`,
                          boxShadow: `0 0 12px hsl(${themeColor} / 0.1)`,
                          borderColor: `hsl(${themeColor} / 0.2)`,
                          border: `1px solid hsl(${themeColor} / 0.2)`,
                        } : {}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </SettingSection>

                {/* Duration & Speed */}
                <SettingSection label="Animation Timing">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-bold text-foreground">{activePreset.animationDuration}s</span>
                      </div>
                      <input type="range" min={0.5} max={3} step={0.1} value={activePreset.animationDuration}
                        onChange={e => updatePreset({ animationDuration: parseFloat(e.target.value) })}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-primary"
                        style={{ background: `hsl(${themeColor} / 0.15)` }} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-bold text-foreground">{activePreset.animationSpeed}x</span>
                      </div>
                      <input type="range" min={0.5} max={3} step={0.1} value={activePreset.animationSpeed}
                        onChange={e => updatePreset({ animationSpeed: parseFloat(e.target.value) })}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-primary"
                        style={{ background: `hsl(${themeColor} / 0.15)` }} />
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
                                ? "text-foreground ring-1"
                                : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                            }`}
                            style={activePreset.soundPack === sp.id ? {
                              background: `hsl(${themeColor} / 0.1)`,
                              border: `1px solid hsl(${themeColor} / 0.2)`,
                            } : {}}>
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
                            ? "text-foreground ring-1"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                        }`}
                        style={activePreset.order === o.id ? {
                          background: `hsl(${themeColor} / 0.1)`,
                          border: `1px solid hsl(${themeColor} / 0.2)`,
                        } : {}}>
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
                        className={`px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all relative overflow-hidden text-left ${
                          activePreset.theme === t.id ? "ring-1 text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={{
                          background: activePreset.theme === t.id ? `hsl(${t.color} / 0.1)` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${activePreset.theme === t.id ? `hsl(${t.color} / 0.3)` : "rgba(255,255,255,0.04)"}`,
                          boxShadow: activePreset.theme === t.id ? `0 0 15px hsl(${t.color} / 0.1)` : "none",
                        }}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: `hsl(${t.color})`, boxShadow: `0 0 8px hsl(${t.color} / 0.4)` }} />
                          {t.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </SettingSection>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Bottom Banner ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor} / 0.06), hsl(280 100% 65% / 0.04))`,
            border: `1px solid hsl(${themeColor} / 0.1)`,
          }}>
          <Zap size={20} className="mx-auto mb-2" style={{ color: `hsl(${themeColor})` }} />
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
