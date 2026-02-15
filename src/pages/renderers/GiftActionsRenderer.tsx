import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface GiftActionItem {
  img: string;
  label: string;
}

const defaults = {
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
  label_style: "bold",
  custom_css: "",
};

const GiftActionsRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaults);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaults, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const db = supabase.channel(`gift-actions-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (p: any) => { if (p.new?.settings) setSettings({ ...defaults, ...p.new.settings }); })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(db); };
  }, [publicToken]);

  const items: GiftActionItem[] = settings.items?.length > 0 ? settings.items : defaults.items;
  // Duplicate items for seamless infinite scroll
  const scrollItems = settings.auto_scroll ? [...items, ...items, ...items] : items;
  const totalWidth = scrollItems.length * (settings.icon_size + settings.spacing);
  const singleSetWidth = items.length * (settings.icon_size + settings.spacing);
  const duration = singleSetWidth / (settings.scroll_speed || 30);

  const labelStyle: React.CSSProperties = {
    fontSize: settings.label_size,
    fontFamily: "var(--font-heading, 'Impact', sans-serif)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    ...(settings.label_style === "outline" ? {
      color: "transparent",
      WebkitTextStroke: "1.5px white",
    } : settings.label_style === "glow" ? {
      color: "white",
      textShadow: "0 0 8px hsl(280 100% 65%), 0 0 20px hsl(280 100% 65% / 0.5)",
    } : {
      color: "white",
      textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.5)",
    }),
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      <div className="w-full overflow-hidden">
        {settings.auto_scroll ? (
          <motion.div
            className="flex items-end"
            style={{ gap: settings.spacing }}
            animate={{ x: [0, -singleSetWidth] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            {scrollItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: settings.icon_size }}>
                <img src={item.img} alt={item.label} style={{ width: settings.icon_size * 0.85, height: settings.icon_size * 0.85, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }} draggable={false} />
                {settings.show_labels && <span style={labelStyle}>{item.label}</span>}
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex items-end justify-center" style={{ gap: settings.spacing }}>
            {items.map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <img src={item.img} alt={item.label} style={{ width: settings.icon_size * 0.85, height: settings.icon_size * 0.85, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }} draggable={false} />
                {settings.show_labels && <span style={labelStyle}>{item.label}</span>}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default GiftActionsRenderer;
