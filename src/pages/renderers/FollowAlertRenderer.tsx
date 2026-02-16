import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultFollowAlertSettings } from "@/hooks/use-overlay-widgets";
import useOverlayBody from "@/hooks/use-overlay-body";
import tikupLogo from "@/assets/tikup_logo.png";

interface FollowEvent { id: number; user: string; avatar: string; }

const FollowAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultFollowAlertSettings);
  const [alerts, setAlerts] = useState<FollowEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultFollowAlertSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`follow_alert-${publicToken}`)
      .on("broadcast", { event: "new_alert" }, (msg) => {
        setAlerts(prev => [...prev, { ...msg.payload as any, id: Date.now() }]);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        setAlerts(prev => [...prev, { id: Date.now(), user: "TestUser", avatar: "👋" }]);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`follow-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultFollowAlertSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  useEffect(() => {
    if (!alerts.length) return;
    const t = setTimeout(() => setAlerts(prev => prev.slice(1)), settings.duration * 1000);
    return () => clearTimeout(t);
  }, [alerts, settings.duration]);

  const accent = settings.accent_color || "160 100% 45%";
  const glow = (settings.glow_intensity || 50) / 100;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>
      <AnimatePresence>
        {alerts.slice(0, settings.max_on_screen).map(a => (
          <motion.div key={a.id} className="absolute"
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 / (settings.animation_speed || 1), type: "spring" }}>
            <div className="rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[260px]"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}>
               {settings.show_avatar && (
                 <div className="rounded-full flex items-center justify-center overflow-hidden" style={{
                   width: settings.icon_size, height: settings.icon_size,
                   background: `hsl(${accent} / 0.12)`, border: `2px solid hsl(${accent} / 0.3)`,
                   boxShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.15)`,
                 }}>
                   <img src={tikupLogo} alt="TikUp" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                 </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{a.user}</p>
                <p className="text-[11px] mt-0.5" style={{ color: `hsl(${accent})` }}>{settings.welcome_text || "just followed!"}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
    </div>
  );
};

export default FollowAlertRenderer;
