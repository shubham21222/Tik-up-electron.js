import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const VoteBattleRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState<any>({ transparent_bg: true, team_a_name: "Team A", team_b_name: "Team B", show_pct: true });
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((p: any) => ({ ...p, ...(data as any).settings })); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`vote-${publicToken}`)
      .on("broadcast", { event: "vote_a" }, (msg) => { setScoreA(p => p + (msg.payload?.points || 1)); })
      .on("broadcast", { event: "vote_b" }, (msg) => { setScoreB(p => p + (msg.payload?.points || 1)); })
      .on("broadcast", { event: "gift" }, (msg) => {
        // Alternate or random assignment for demo
        const coins = msg.payload?.coinValue || 1;
        if (Math.random() > 0.5) setScoreA(p => p + coins);
        else setScoreB(p => p + coins);
      })
      .on("broadcast", { event: "reset" }, () => { setScoreA(0); setScoreB(0); })
      .on("broadcast", { event: "test_alert" }, () => {
        if (Math.random() > 0.5) setScoreA(p => p + 10); else setScoreB(p => p + 10);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`vote-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const total = scoreA + scoreB || 1;
  const leftPct = Math.round((scoreA / total) * 100);
  const rightPct = 100 - leftPct;
  const teamA = settings.team_a_name || "Team A";
  const teamB = settings.team_b_name || "Team B";

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center px-8 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      {/* VS badge */}
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black mb-4"
        style={{ background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(200 80% 55%))", boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}>VS</motion.div>
      {/* Labels */}
      <div className="flex w-full max-w-lg justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(350 80% 55%)" }} />
          <span className="text-sm font-bold text-white/80">{teamA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white/80">{teamB}</span>
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(200 80% 55%)" }} />
        </div>
      </div>
      {/* Bar */}
      <div className="w-full max-w-lg h-14 rounded-2xl overflow-hidden flex" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <motion.div className="h-full flex items-center justify-center relative overflow-hidden" animate={{ width: `${leftPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: "linear-gradient(90deg, hsl(350 80% 55% / 0.4), hsl(350 80% 55% / 0.2))" }}>
          {settings.show_pct && <span className="text-base font-bold text-white/90 z-10">{leftPct}%</span>}
        </motion.div>
        <motion.div className="h-full flex items-center justify-center relative overflow-hidden" animate={{ width: `${rightPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: "linear-gradient(90deg, hsl(200 80% 55% / 0.2), hsl(200 80% 55% / 0.4))" }}>
          {settings.show_pct && <span className="text-base font-bold text-white/90 z-10">{rightPct}%</span>}
        </motion.div>
      </div>
      {/* Scores */}
      <div className="flex w-full max-w-lg justify-between mt-2">
        <span className="text-sm font-bold" style={{ color: "hsl(350 80% 65%)" }}>{scoreA} pts</span>
        <span className="text-sm font-bold" style={{ color: "hsl(200 80% 65%)" }}>{scoreB} pts</span>
      </div>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default VoteBattleRenderer;
