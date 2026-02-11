import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultLeaderboardSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

interface Entry { name: string; value: number; avatar: string; }

const LeaderboardRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultLeaderboardSettings);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultLeaderboardSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`leaderboard-${publicToken}`)
      .on("broadcast", { event: "leaderboard_update" }, (msg) => { if (msg.payload?.entries) setEntries(msg.payload.entries); })
      .on("broadcast", { event: "test_alert" }, () => {
        setEntries([
          { name: "TestUser1", value: 500, avatar: "👑" },
          { name: "TestUser2", value: 300, avatar: "🌟" },
          { name: "TestUser3", value: 100, avatar: "🎵" },
        ]);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`leaderboard-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultLeaderboardSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const medals = ["🥇", "🥈", "🥉"];
  const accent = settings.accent_color || "45 100% 55%";

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center px-6 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <AnimatePresence>
        {entries.slice(0, settings.max_entries).map((entry, i) => (
          <motion.div key={entry.name} layout className="w-full max-w-sm flex items-center gap-3 px-3 py-2 rounded-xl mb-1"
            style={{ background: i === 0 ? `linear-gradient(90deg, hsl(${accent} / 0.1), transparent)` : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? `hsl(${accent} / 0.15)` : "rgba(255,255,255,0.03)"}` }}
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
            <span className="text-sm w-6 text-center">{i < 3 ? medals[i] : `#${i + 1}`}</span>
            {settings.show_avatars && <span className="text-sm">{entry.avatar}</span>}
            <span className="text-xs font-bold text-white flex-1 truncate">{entry.name}</span>
            {settings.show_values && <span className="text-[11px] font-bold" style={{ color: i === 0 ? `hsl(${accent})` : "rgba(255,255,255,0.5)" }}>{entry.value.toLocaleString()}</span>}
          </motion.div>
        ))}
      </AnimatePresence>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default LeaderboardRenderer;
