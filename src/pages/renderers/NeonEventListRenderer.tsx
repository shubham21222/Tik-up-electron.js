import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultNeonEventListSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

interface EventItem {
  id: number;
  user: string;
  action: string;
  type: string;
  color: string;
}

const typeColors: Record<string, string> = {
  gift: "280 100% 65%",
  follow: "160 100% 50%",
  like: "350 90% 60%",
  share: "200 100% 60%",
};

const typeLabels: Record<string, string> = {
  gift: "🎁",
  follow: "👤",
  like: "❤️",
  share: "🔁",
};

const NeonEventListRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultNeonEventListSettings);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    if (!publicToken) return;
    const fetchWidget = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        setSettings(applyUrlOverrides({ ...defaultNeonEventListSettings, ...(data as any).settings }) as typeof defaultNeonEventListSettings);
      }
    };
    fetchWidget();
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`neon-event-list-${publicToken}`)
      .on("broadcast", { event: "gift_alert" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ user: p.username || "Viewer", action: `${p.giftName || "Gift"} ${p.repeatCount > 1 ? `×${p.repeatCount}` : ""}`, type: "gift" });
      })
      .on("broadcast", { event: "follow" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ user: p.username || "Viewer", action: "New Follow", type: "follow" });
      })
      .on("broadcast", { event: "like" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ user: p.username || "Viewer", action: "Liked Stream", type: "like" });
      })
      .on("broadcast", { event: "share" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ user: p.username || "Viewer", action: "Shared LIVE", type: "share" });
      })
      .on("broadcast", { event: "test_event" }, () => {
        addEvent({ user: "Tikup_User", action: "Rose 🌹 ×3", type: "gift" });
      })
      .subscribe();

    const dbChannel = supabase
      .channel(`neon-event-list-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` }, (payload: any) => {
        if (payload.new?.settings) setSettings({ ...defaultNeonEventListSettings, ...payload.new.settings });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(dbChannel); };
  }, [publicToken]);

  const addEvent = ({ user, action, type }: { user: string; action: string; type: string }) => {
    const color = typeColors[type] || "200 100% 60%";
    const newEvent: EventItem = { id: Date.now() + Math.random(), user, action, type, color };
    setEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  const s = settings as any;
  const accentColor = s.accent_color || "200 100% 60%";
  const maxEvents = s.max_events || 5;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center p-8 ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="relative w-full max-w-sm">
        {/* Header */}
        {s.show_header !== false && (
          <div className="relative mb-2 px-3 py-2 mx-2 rounded-sm flex items-center gap-2"
            style={{ background: "rgba(0,0,0,0.85)", border: `1px solid hsl(${accentColor} / 0.3)` }}>
            <div className="absolute top-0 left-0 w-3 h-0.5" style={{ background: `hsl(${accentColor})` }} />
            <div className="absolute top-0 left-0 w-0.5 h-3" style={{ background: `hsl(${accentColor})` }} />
            <div className="absolute bottom-0 right-0 w-3 h-0.5" style={{ background: `hsl(${accentColor})` }} />
            <div className="absolute bottom-0 right-0 w-0.5 h-3" style={{ background: `hsl(${accentColor})` }} />
            <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: `hsl(${accentColor})`, boxShadow: `0 0 8px hsl(${accentColor})` }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-[13px] font-bold text-white/90 tracking-widest uppercase">{s.header_text || "Live Events"}</span>
            <span className="ml-auto text-[10px] font-mono" style={{ color: `hsl(${accentColor})` }}>
              {String(Math.min(events.length, maxEvents)).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Events */}
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {events.slice(0, maxEvents).map((ev) => (
              <motion.div key={ev.id} className="relative mx-2"
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <div className="relative rounded-sm px-3 py-2 flex items-center gap-2"
                  style={{ background: "rgba(0,0,0,0.75)", border: `1px solid hsl(${ev.color} / 0.25)` }}>
                  <div className="absolute top-0 left-0 w-2 h-0.5" style={{ background: `hsl(${ev.color})` }} />
                  <div className="absolute top-0 left-0 w-0.5 h-2" style={{ background: `hsl(${ev.color})` }} />
                  <div className="absolute bottom-0 right-0 w-2 h-0.5" style={{ background: `hsl(${ev.color})` }} />
                  <div className="absolute bottom-0 right-0 w-0.5 h-2" style={{ background: `hsl(${ev.color})` }} />
                  <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${ev.color})`, boxShadow: `0 0 6px hsl(${ev.color})` }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-sm font-bold text-white/90 truncate">{ev.user}</span>
                  <span className="text-[11px] ml-auto flex-shrink-0" style={{ color: `hsl(${ev.color})` }}>{ev.action}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Outer border */}
        <div className="absolute -inset-1 pointer-events-none rounded-md"
          style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="absolute top-0 left-0 w-4 h-0.5" style={{ background: `hsl(${accentColor} / 0.4)` }} />
          <div className="absolute top-0 left-0 w-0.5 h-4" style={{ background: `hsl(${accentColor} / 0.4)` }} />
          <div className="absolute bottom-0 right-0 w-4 h-0.5" style={{ background: `hsl(${accentColor} / 0.4)` }} />
          <div className="absolute bottom-0 right-0 w-0.5 h-4" style={{ background: `hsl(${accentColor} / 0.4)` }} />
        </div>
      </div>
    </div>
  );
};

export default NeonEventListRenderer;
