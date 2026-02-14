import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Gift, Heart, UserPlus, Share2, MessageCircle,
  Users, Copy, Plus, Trash2, Settings as SettingsIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { copyToClipboard } from "@/lib/clipboard";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { toast } from "sonner";

const filters = [
  { id: "all", label: "All" },
  { id: "followers", label: "Followers" },
  { id: "gifts", label: "Gifts" },
  { id: "subscribers", label: "Subscribers" },
  { id: "shares", label: "Shares" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "joins", label: "Joins" },
];

const eventTypeMap: Record<string, { icon: typeof Heart; emoji: string; color: string; filterKey: string }> = {
  like:      { icon: Heart, emoji: "❤️", color: "350 90% 55%", filterKey: "likes" },
  gift:      { icon: Gift, emoji: "🎁", color: "280 100% 65%", filterKey: "gifts" },
  follow:    { icon: UserPlus, emoji: "👤", color: "160 100% 45%", filterKey: "followers" },
  subscribe: { icon: Users, emoji: "⭐", color: "45 100% 55%", filterKey: "subscribers" },
  share:     { icon: Share2, emoji: "🔄", color: "200 100% 55%", filterKey: "shares" },
  comment:   { icon: MessageCircle, emoji: "💬", color: "45 100% 55%", filterKey: "comments" },
  join:      { icon: Activity, emoji: "👋", color: "160 100% 45%", filterKey: "joins" },
};

const avatarColors = [
  "hsl(280 70% 50%)", "hsl(200 80% 50%)", "hsl(350 80% 55%)",
  "hsl(160 70% 40%)", "hsl(45 90% 50%)", "hsl(120 60% 40%)",
];

const mockEvents = [
  { type: "like", user: "TikTokFan123", detail: "liked!" },
  { type: "gift", user: "ShareQueen", detail: "sent Diamond!" },
  { type: "join", user: "GiftGiver99", detail: "joined the stream!" },
  { type: "subscribe", user: "CommentKing", detail: "subscribed!" },
  { type: "subscribe", user: "FollowerOne", detail: "subscribed!" },
  { type: "follow", user: "NewViewer_23", detail: "started following" },
  { type: "like", user: "HeartSpammer", detail: "sent 50 likes" },
  { type: "share", user: "BestFriend_01", detail: "shared the stream!" },
  { type: "comment", user: "ActiveChatter", detail: "\"Love this stream!\"" },
  { type: "gift", user: "BigSpender", detail: "sent Lion (5,000 coins)" },
  { type: "join", user: "LateComer", detail: "joined the stream!" },
  { type: "follow", user: "TikTokUser_99", detail: "started following" },
];

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const RecentActivity = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const feedUrl = `${getOverlayBaseUrl()}/overlay/event-feed/${user?.id ?? "demo"}`;

  const filteredEvents = activeFilter === "all"
    ? mockEvents
    : mockEvents.filter(e => eventTypeMap[e.type]?.filterKey === activeFilter);

  const handleCopy = () => {
    copyToClipboard(feedUrl);
    toast.success("Feed URL copied!");
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-3xl font-heading font-bold text-foreground mb-2">Event Feeds</h1><PageHelpButton featureKey="recent_activity" /></div>
            <p className="text-muted-foreground text-sm">Create customizable event feeds for your stream overlays</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> Create Feed
          </button>
        </motion.div>

        {/* Feed Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
            {/* Feed Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-heading font-bold text-foreground">Event Feed</h2>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                  <SettingsIcon size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {filters.map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                    activeFilter === f.id
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(160_100%_45%/0.3)]"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="px-5 pb-3 space-y-1.5 max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, i) => {
                  const config = eventTypeMap[event.type];
                  return (
                    <motion.div key={`${event.user}-${event.type}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                      style={{ background: "rgba(255,255,255,0.02)" }}>
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: getAvatarColor(event.user) }}>
                        {getInitials(event.user)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-bold text-foreground">{event.user}</p>
                        <p className="text-xs text-muted-foreground">{event.detail}</p>
                      </div>
                      {/* Emoji */}
                      <span className="text-xl flex-shrink-0">{config?.emoji}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No events for this filter yet.
                </div>
              )}
            </div>

            {/* URL Bar */}
            <div className="px-5 pb-5 pt-2">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors"
                style={{ borderColor: "hsl(160 100% 45% / 0.3)", background: "rgba(0,0,0,0.3)" }}>
                <span className="flex-1 text-[11px] font-mono text-muted-foreground truncate">{feedUrl}</span>
                <button onClick={handleCopy}
                  className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors flex-shrink-0">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default RecentActivity;
