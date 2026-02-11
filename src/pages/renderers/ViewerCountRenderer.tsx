import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultViewerCountSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const ViewerCountRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultViewerCountSettings);
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultViewerCountSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`viewer-count-${publicToken}`)
      .on("broadcast", { event: "viewer_update" }, (msg) => { if (msg.payload?.count != null) setCount(msg.payload.count); })
      .on("broadcast", { event: "test_alert" }, () => setCount(prev => prev + 25))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`viewer-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultViewerCountSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const accent = settings.accent_color || "45 100% 55%";

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <div className="flex items-center gap-3">
        {settings.icon_visible && <motion.div className="w-3 h-3 rounded-full" style={{ background: `hsl(${accent})`, boxShadow: `0 0 10px hsl(${accent} / 0.5)` }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
        <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize: settings.font_size }} key={count} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{count.toLocaleString()}</motion.span>
      </div>
      <p className="absolute mt-12 text-[10px] text-white/40">{settings.label_text || "viewers"}</p>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default ViewerCountRenderer;
