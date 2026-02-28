import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useRendererSettings } from "@/hooks/use-renderer-settings";
import { defaultViewerCountSettings } from "@/hooks/overlay-defaults";

const ViewerCountRenderer = () => {
  const { settings, publicToken } = useRendererSettings(defaultViewerCountSettings, "viewer-count");
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  // Broadcast channel for viewer updates
  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`viewer-count-${publicToken}`)
      .on("broadcast", { event: "viewer_update" }, (msg) => {
        const p = msg.payload as any;
        const v = p?.count ?? p?.viewer_count ?? p?.viewerCount;
        if (v != null) setCount(Number(v));
      })
      .on("broadcast", { event: "test_alert" }, () => setCount(prev => prev + 25))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
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
    </div>
  );
};

export default ViewerCountRenderer;
