import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultLikeAlertSettings } from "@/hooks/use-overlay-widgets";
import useOverlayBody from "@/hooks/use-overlay-body";

interface LikeEvent { id: number; user: string; count: number; }

const LikeAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultLikeAlertSettings);
  const [alerts, setAlerts] = useState<LikeEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultLikeAlertSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`like-alert-${publicToken}`)
      .on("broadcast", { event: "like_alert" }, (msg) => {
        setAlerts(prev => [...prev, { ...msg.payload as any, id: Date.now() }]);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        setAlerts(prev => [...prev, { id: Date.now(), user: "TestUser", count: 5 }]);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`like-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultLikeAlertSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  useEffect(() => {
    if (!alerts.length) return;
    const t = setTimeout(() => setAlerts(prev => prev.slice(1)), settings.duration * 1000);
    return () => clearTimeout(t);
  }, [alerts, settings.duration]);

  const colors = settings.color_mode === "cool" ? ["hsl(200 100% 60%)"] : settings.color_mode === "rainbow" ? ["hsl(0 90% 60%)", "hsl(120 80% 50%)", "hsl(200 100% 60%)"] : ["hsl(350 90% 55%)"];
  const glow = (settings.glow_intensity || 60) / 100;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>
      <AnimatePresence>
        {alerts.slice(0, settings.max_on_screen).map(a => (
          <motion.div key={a.id} className="absolute flex flex-col items-center"
            initial={{ y: 30, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 / (settings.animation_speed || 1) }}>
            <motion.div className="rounded-full flex items-center justify-center mb-3"
              style={{ width: settings.icon_size, height: settings.icon_size, background: `${colors[0].replace(")", " / 0.12)")})`, border: `1px solid ${colors[0].replace(")", " / 0.25)")}`, boxShadow: `0 0 ${20 * glow}px ${colors[0].replace(")", " / 0.2)")}` }}
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <span style={{ fontSize: settings.icon_size * 0.5 }}>❤️</span>
            </motion.div>
            <p className="text-sm font-bold text-white">{a.user}</p>
            {settings.show_count && <p className="text-lg font-heading font-black" style={{ color: colors[0] }}>+{a.count} ❤️</p>}
          </motion.div>
        ))}
      </AnimatePresence>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default LikeAlertRenderer;
