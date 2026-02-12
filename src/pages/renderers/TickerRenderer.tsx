import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultTickerSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

interface TickerItem {
  id: number;
  type: string;
  user: string;
  text: string;
  icon: string;
}

const eventIcons: Record<string, string> = {
  follow: "👤", like: "❤️", gift: "🎁", share: "🔗", chat: "💬", subscribe: "⭐",
};
const eventTexts: Record<string, string> = {
  follow: "followed", like: "liked", gift: "sent a gift", share: "shared", subscribe: "subscribed",
};

const separators: Record<string, string> = {
  dot: "•", pipe: "|", diamond: "◆", star: "★",
};

const TickerRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultTickerSettings);
  const [items, setItems] = useState<TickerItem[]>([]);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultTickerSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`ticker-${publicToken}`)
      .on("broadcast", { event: "ticker_event" }, (msg) => {
        const p = msg.payload as any;
        const newItem: TickerItem = {
          id: Date.now(),
          type: p.event_type || "follow",
          user: p.user || "Someone",
          text: eventTexts[p.event_type] || p.event_type,
          icon: eventIcons[p.event_type] || "✨",
        };
        setItems(prev => [newItem, ...prev].slice(0, settings.max_items || 20));
      })
      .on("broadcast", { event: "test_alert" }, () => {
        const types = ["follow", "like", "gift", "share"];
        const type = types[Math.floor(Math.random() * types.length)];
        setItems(prev => [{ id: Date.now(), type, user: "TestUser", text: eventTexts[type], icon: eventIcons[type] }, ...prev].slice(0, 20));
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));

    const db = supabase.channel(`ticker-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultTickerSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, settings.max_items]);

  const accent = settings.accent_color || "200 100% 55%";
  const glow = (settings.glow_intensity || 40) / 100;
  const sep = separators[settings.separator_style] || "•";
  const barH = settings.bar_height || 40;
  const speed = settings.scroll_speed || 40;
  const isBottom = settings.bar_position !== "top";

  // Generate repeated content for seamless scrolling
  const tickerContent = items.length > 0 ? items : [
    { id: 1, type: "follow", user: "Waiting for events...", text: "", icon: "📡" },
  ];

  return (
    <div className={`w-screen h-screen overflow-hidden flex ${isBottom ? "items-end" : "items-start"} ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20 z-10">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      <div
        className="w-full overflow-hidden relative"
        style={{
          height: barH,
          background: settings.background_blur ? "rgba(0,0,0,0.6)" : "transparent",
          backdropFilter: settings.background_blur ? "blur(12px)" : "none",
          borderTop: isBottom ? `1px solid hsl(${accent} / 0.15)` : "none",
          borderBottom: !isBottom ? `1px solid hsl(${accent} / 0.15)` : "none",
        }}
      >
        {/* Glow line */}
        <div className="absolute inset-x-0 h-[1px]" style={{
          [isBottom ? "top" : "bottom"]: 0,
          background: `linear-gradient(90deg, transparent, hsl(${accent} / ${0.4 * glow}), transparent)`,
        }} />

        {/* Scrolling content */}
        <motion.div
          ref={scrollRef}
          className="flex items-center gap-0 whitespace-nowrap h-full"
          animate={{ x: settings.direction === "right" ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{ duration: Math.max(10, tickerContent.length * (100 / speed)), repeat: Infinity, ease: "linear" }}
        >
          {/* Double the content for seamless loop */}
          {[...tickerContent, ...tickerContent].map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-3 px-4" style={{ height: barH }}>
              {settings.show_icons && <span className="text-sm">{item.icon}</span>}
              <span className="text-sm font-semibold text-white">{item.user}</span>
              {item.text && <span className="text-sm text-white/50">{item.text}</span>}
              <span className="text-white/20 text-xs mx-2">{sep}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default TickerRenderer;
