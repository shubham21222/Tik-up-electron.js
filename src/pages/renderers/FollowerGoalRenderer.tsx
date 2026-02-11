import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultFollowerGoalSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const FollowerGoalRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultFollowerGoalSettings);
  const [current, setCurrent] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultFollowerGoalSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`follower-goal-${publicToken}`)
      .on("broadcast", { event: "follower_update" }, (msg) => { if (msg.payload?.count != null) setCurrent(msg.payload.count); })
      .on("broadcast", { event: "test_alert" }, () => setCurrent(prev => prev + 10))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`follower-goal-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultFollowerGoalSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const target = settings.target_value || 1000;
  const pct = Math.min((current / target) * 100, 100);
  const accent = settings.glow_color || "160 100% 45%";

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center px-8 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <p className="text-sm text-white/60 font-medium mb-3">{settings.title_text || "Follower Goal"}</p>
      <div className="w-full max-w-md rounded-full overflow-hidden" style={{ height: settings.bar_height || 32, background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} style={{ background: `hsl(${accent})`, boxShadow: `0 0 15px hsl(${accent} / 0.3)` }} transition={{ duration: 1 }} />
      </div>
      {settings.show_percentage && <p className="text-xs text-white/50 mt-2">{current} / {target} ({Math.round(pct)}%)</p>}
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default FollowerGoalRenderer;
