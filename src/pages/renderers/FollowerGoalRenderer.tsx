import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useRendererSettings } from "@/hooks/use-renderer-settings";
import { defaultFollowerGoalSettings } from "@/hooks/overlay-defaults";

const FollowerGoalRenderer = () => {
  const { settings, publicToken } = useRendererSettings(defaultFollowerGoalSettings, "follower-goal");
  const [current, setCurrent] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`follower-goal-${publicToken}`)
      .on("broadcast", { event: "follower_update" }, (msg) => {
        const p = msg.payload as any;
        const v = p?.followerCount ?? p?.follower_count ?? p?.count;
        if (v != null) setCurrent(prev => Math.max(prev, Number(v)));
      })
      .on("broadcast", { event: "test_alert" }, () => setCurrent(prev => prev + 10))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
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
    </div>
  );
};

export default FollowerGoalRenderer;
