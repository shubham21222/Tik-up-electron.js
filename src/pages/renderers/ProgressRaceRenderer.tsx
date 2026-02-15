import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const DEFAULT_TEAMS = [
  { name: "🔥 Fire", color: "350 80% 55%" },
  { name: "💎 Ice", color: "200 80% 55%" },
  { name: "⭐ Gold", color: "45 100% 55%" },
];

const ProgressRaceRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState<any>({ transparent_bg: true, target: 100, team_count: 3, show_pct: true, auto_reset: true });
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((p: any) => ({ ...p, ...(data as any).settings })); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`race-${publicToken}`)
      .on("broadcast", { event: "score" }, (msg) => {
        const { team, points } = msg.payload || {};
        if (typeof team === "number") setScores(p => p.map((s, i) => i === team ? s + (points || 1) : s));
      })
      .on("broadcast", { event: "gift" }, (msg) => {
        const coins = msg.payload?.coinValue || 1;
        const team = Math.floor(Math.random() * (settings.team_count || 3));
        setScores(p => p.map((s, i) => i === team ? s + coins : s));
      })
      .on("broadcast", { event: "reset" }, () => setScores(new Array(settings.team_count || 3).fill(0)))
      .on("broadcast", { event: "test_alert" }, () => {
        const team = Math.floor(Math.random() * (settings.team_count || 3));
        setScores(p => p.map((s, i) => i === team ? s + 5 : s));
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`race-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, settings.team_count]);

  // Auto-reset on win
  useEffect(() => {
    const target = settings.target || 100;
    if (settings.auto_reset && scores.some(s => s >= target)) {
      const t = setTimeout(() => setScores(new Array(settings.team_count || 3).fill(0)), 5000);
      return () => clearTimeout(t);
    }
  }, [scores, settings]);

  const target = settings.target || 100;
  const teams = DEFAULT_TEAMS.slice(0, settings.team_count || 3);

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col justify-center px-8 gap-4 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <div className="text-center mb-2"><span className="text-sm font-bold uppercase tracking-widest text-white/40">🏁 Race to {target}</span></div>
      {teams.map((team, i) => {
        const pct = Math.min((scores[i] || 0) / target * 100, 100);
        const finished = pct >= 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold" style={{ color: `hsl(${team.color})` }}>{team.name}</span>
              {settings.show_pct && <span className="text-xs text-white/50">{Math.round(pct)}%</span>}
            </div>
            <div className="h-7 rounded-xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.06)` }}>
              <motion.div className="h-full rounded-xl relative overflow-hidden" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ background: `linear-gradient(90deg, hsl(${team.color} / 0.3), hsl(${team.color} / 0.5))` }}>
                <motion.div className="absolute inset-0 opacity-40" animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${team.color} / 0.3), transparent)` }} />
              </motion.div>
              {finished && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-2 top-1/2 -translate-y-1/2 text-base">🏆</motion.span>}
            </div>
          </div>
        );
      })}
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default ProgressRaceRenderer;
