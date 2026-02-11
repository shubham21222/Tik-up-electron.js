import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultLikeCounterSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const LikeCounterRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultLikeCounterSettings);
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultLikeCounterSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`like-counter-${publicToken}`)
      .on("broadcast", { event: "like_update" }, (msg) => { if (msg.payload?.count != null) setCount(msg.payload.count); })
      .on("broadcast", { event: "test_alert" }, () => setCount(prev => prev + 42))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`like-counter-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultLikeCounterSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const glow = (settings.glow_strength || 60) / 100;
  const accent = settings.accent_color || "280 100% 65%";

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <motion.div className="flex items-center gap-3">
        <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-2xl">❤️</motion.span>
        <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize: settings.font_size, textShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.3)` }} key={count}
          initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{count.toLocaleString()}</motion.span>
      </motion.div>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default LikeCounterRenderer;
