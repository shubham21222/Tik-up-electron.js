import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface FeedEvent {
  id: number;
  type: string;
  username: string;
  detail: string;
  emoji: string;
  timestamp: number;
}

interface FeedSettings {
  eventTypes: string[];
  animationStyle: string;
  animationDuration: number;
  animationSpeed: number;
  order: "newest" | "oldest";
  theme: string;
  maxEvents?: number;
}

const defaultFeedSettings: FeedSettings = {
  eventTypes: ["followers", "gifts", "likes", "shares", "comments", "joins"],
  animationStyle: "slide_in",
  animationDuration: 1.5,
  animationSpeed: 1,
  order: "newest",
  theme: "default",
  maxEvents: 10,
};

const THEMES: Record<string, { color: string; bg: string; cardBg: (c: string) => string; cardBorder: string; cardRadius: string; usernameColor?: string; overlayCSS?: string }> = {
  default: {
    color: "160 100% 45%", bg: "rgba(10,10,15,0.95)",
    cardBg: (c) => `linear-gradient(135deg, hsl(160 100% 45% / 0.06), hsl(${c} / 0.04))`,
    cardBorder: "1px solid hsl(160 100% 45% / 0.1)", cardRadius: "12px",
  },
  neon_gamer: {
    color: "280 100% 65%", bg: "rgba(20,8,30,0.95)",
    cardBg: (c) => `linear-gradient(135deg, hsl(280 80% 20% / 0.25), hsl(${c} / 0.1))`,
    cardBorder: "1px solid hsl(280 100% 65% / 0.25)", cardRadius: "12px",
    usernameColor: "hsl(280 100% 80%)",
    overlayCSS: "box-shadow: inset 0 0 30px hsl(280 100% 65% / 0.06);",
  },
  space_hud: {
    color: "200 100% 55%", bg: "rgba(5,12,25,0.95)",
    cardBg: (c) => `linear-gradient(180deg, hsl(200 80% 15% / 0.2), hsl(${c} / 0.06))`,
    cardBorder: "1px solid hsl(200 100% 55% / 0.2)", cardRadius: "6px",
    usernameColor: "hsl(200 100% 75%)",
  },
  fortnite: {
    color: "120 80% 50%", bg: "rgba(8,18,12,0.95)",
    cardBg: (c) => `linear-gradient(135deg, hsl(120 60% 15% / 0.25), hsl(${c} / 0.08))`,
    cardBorder: "2px solid hsl(120 80% 50% / 0.2)", cardRadius: "6px",
    usernameColor: "hsl(120 80% 70%)",
  },
  cod_tactical: {
    color: "45 100% 55%", bg: "rgba(15,14,10,0.95)",
    cardBg: (c) => `linear-gradient(90deg, hsl(45 60% 12% / 0.25), hsl(${c} / 0.05), transparent)`,
    cardBorder: "1px solid hsl(45 80% 40% / 0.2)", cardRadius: "4px",
    usernameColor: "hsl(45 100% 70%)",
    overlayCSS: "box-shadow: inset 3px 0 0 hsl(45 100% 55% / 0.35);",
  },
  cyber_pulse: {
    color: "180 100% 50%", bg: "rgba(5,15,20,0.95)",
    cardBg: (c) => `linear-gradient(135deg, hsl(180 80% 15% / 0.2), hsl(${c} / 0.08))`,
    cardBorder: "1px solid hsl(180 100% 50% / 0.2)", cardRadius: "10px",
    usernameColor: "hsl(180 100% 70%)",
  },
};

const eventTypeConfig: Record<string, { emoji: string; color: string; filterKey: string; verb: string }> = {
  gift:    { emoji: "🎁", color: "280 100% 65%", filterKey: "gifts", verb: "sent a gift!" },
  like:    { emoji: "❤️", color: "350 90% 55%", filterKey: "likes", verb: "liked!" },
  follow:  { emoji: "👤", color: "160 100% 45%", filterKey: "followers", verb: "started following" },
  share:   { emoji: "🔄", color: "200 100% 55%", filterKey: "shares", verb: "shared the stream!" },
  chat:    { emoji: "💬", color: "45 100% 55%", filterKey: "comments", verb: "commented" },
  join:    { emoji: "👋", color: "120 70% 45%", filterKey: "joins", verb: "joined the stream" },
};

const animVariants: Record<string, any> = {
  slide_in: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 60 } },
  fade_in: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  pop_up: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }, exit: { opacity: 0, scale: 0.5 } },
  zoom: { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 } },
  bounce: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 15 } }, exit: { opacity: 0, y: -30 } },
};

const avatarColors = [
  "hsl(280 70% 50%)", "hsl(200 80% 50%)", "hsl(350 80% 55%)",
  "hsl(160 70% 40%)", "hsl(45 90% 50%)", "hsl(120 60% 40%)",
];
const getInitials = (n: string) => n.slice(0, 2).toUpperCase();
const getAvatarColor = (n: string) => avatarColors[n.charCodeAt(0) % avatarColors.length];

const EventFeedRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState<FeedSettings>(defaultFeedSettings);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const idCounter = useRef(0);

  // Fetch widget settings
  useEffect(() => {
    if (!publicToken) return;
    (async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        const s = (data as any).settings || {};
        setSettings({ ...defaultFeedSettings, ...s });
      }
    })();
  }, [publicToken]);

  // Realtime subscription
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`event_feed-${publicToken}`)
      .on("broadcast", { event: "feed_event" }, (msg) => {
        const p = msg.payload as any;
        const eventType = p.event_type || p.type;
        const cfg = eventTypeConfig[eventType];
        if (!cfg) return;

        // Check if this event type is enabled
        if (!settings.eventTypes.includes(cfg.filterKey)) return;

        const newEvent: FeedEvent = {
          id: ++idCounter.current,
          type: eventType,
          username: p.username || p.user || "Unknown",
          detail: p.detail || p.message || cfg.verb,
          emoji: cfg.emoji,
          timestamp: Date.now(),
        };

        setEvents(prev => {
          const updated = [newEvent, ...prev];
          return updated.slice(0, settings.maxEvents || 10);
        });
      })
      .subscribe(status => setConnected(status === "SUBSCRIBED"));

    // Listen for settings changes
    const dbChannel = supabase
      .channel(`event_feed-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (payload: any) => {
        if (payload.new?.settings) {
          setSettings({ ...defaultFeedSettings, ...payload.new.settings });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
    };
  }, [publicToken, settings.eventTypes, settings.maxEvents]);

  // Auto-remove events after 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 30000;
      setEvents(prev => prev.filter(e => e.timestamp > cutoff));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const theme = THEMES[settings.theme] || THEMES.default;
  const anim = animVariants[settings.animationStyle] || animVariants.slide_in;
  const displayEvents = settings.order === "oldest" ? [...events].reverse() : events;

  return (
    <div className="w-screen h-screen overflow-hidden p-4 font-['Outfit',sans-serif]"
      style={{ background: "transparent" }}>
      {/* Connection dot */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <div className="space-y-2 max-h-full overflow-hidden">
        <AnimatePresence mode="popLayout">
          {displayEvents.map((event) => {
            const cfg = eventTypeConfig[event.type];
            return (
              <motion.div
                key={event.id}
                {...anim}
                exit={anim.exit}
                transition={{ duration: settings.animationDuration / settings.animationSpeed }}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: theme.cardBg(cfg?.color || "0 0% 50%"),
                  border: theme.cardBorder,
                  borderRadius: theme.cardRadius,
                  ...(theme.overlayCSS ? {} : {}),
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
                  style={{ background: getAvatarColor(event.username), borderRadius: settings.theme === "cod_tactical" ? "4px" : settings.theme === "fortnite" ? "6px" : "9999px" }}>
                  {getInitials(event.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: theme.usernameColor || "white", fontFamily: "'Exo 2', sans-serif" }}>
                    {event.username}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{event.detail}</p>
                </div>
                <span className="text-xl flex-shrink-0">{event.emoji}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <p className="text-white/30 text-xs font-mono">Waiting for events…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFeedRenderer;
