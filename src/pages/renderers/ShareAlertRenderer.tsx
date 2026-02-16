import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultShareAlertSettings } from "@/hooks/use-overlay-widgets";
import useOverlayBody from "@/hooks/use-overlay-body";

interface ShareEvent { id: number; user: string; count: number; }

const ShareAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultShareAlertSettings);
  const [alerts, setAlerts] = useState<ShareEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultShareAlertSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`share-alert-${publicToken}`)
      .on("broadcast", { event: "share_alert" }, (msg) => {
        setAlerts(prev => [...prev, { ...msg.payload as any, id: Date.now() }]);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        setAlerts(prev => [...prev, { id: Date.now(), user: "TestUser", count: 1 }]);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`share-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultShareAlertSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  useEffect(() => {
    if (!alerts.length) return;
    const t = setTimeout(() => setAlerts(prev => prev.slice(1)), settings.duration * 1000);
    return () => clearTimeout(t);
  }, [alerts, settings.duration]);

  const accent = settings.accent_color || "200 100% 55%";
  const glow = (settings.glow_intensity || 55) / 100;
  const icon = settings.animation_style === "paper_plane" ? "✈️" : settings.animation_style === "rocket_launch" ? "🚀" : "🔗";

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>
      <AnimatePresence>
        {alerts.slice(0, settings.max_on_screen).map(a => (
          <motion.div key={a.id} className="absolute flex flex-col items-center"
            initial={{ y: 50, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 / (settings.animation_speed || 1) }}>
            <motion.div className="rounded-2xl flex items-center justify-center mb-3"
              style={{ width: settings.icon_size, height: settings.icon_size, background: `hsl(${accent} / 0.12)`, border: `1px solid hsl(${accent} / 0.25)`, boxShadow: `0 0 ${20 * glow}px hsl(${accent} / 0.15)` }}>
              <span style={{ fontSize: settings.icon_size * 0.45 }}>{icon}</span>
            </motion.div>
            <p className="text-sm font-bold text-white">{a.user}</p>
            <p className="text-[11px] text-white/50">shared your stream!</p>
            {settings.show_share_count && a.count > 1 && (
              <p className="text-xs font-bold mt-1" style={{ color: `hsl(${accent})` }}>{a.count}x shares</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
    </div>
  );
};

export default ShareAlertRenderer;
