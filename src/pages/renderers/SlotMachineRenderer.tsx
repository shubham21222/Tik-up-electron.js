import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const SYMBOLS = ["🌹", "💎", "⭐", "🔥", "🦋", "💖", "🎁"];

const SlotMachineRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState<any>({ transparent_bg: true, spin_duration: 2, win_chance: 20, show_jackpot: true });
  const [reels, setReels] = useState([0, 2, 4]);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const [lastUser, setLastUser] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((p: any) => ({ ...p, ...(data as any).settings })); });
  }, [publicToken]);

  const doSpin = (username: string) => {
    if (spinning) return;
    setSpinning(true);
    setWin(false);
    setLastUser(username);
    const results = [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)];
    if (Math.random() * 100 < (settings.win_chance || 20)) { results[1] = results[0]; results[2] = results[0]; }
    const dur = (settings.spin_duration || 2) * 1000;
    setTimeout(() => setReels(r => [results[0], r[1], r[2]]), dur * 0.35);
    setTimeout(() => setReels(r => [r[0], results[1], r[2]]), dur * 0.6);
    setTimeout(() => { setReels(results); setSpinning(false); if (results[0] === results[1] && results[1] === results[2]) setWin(true); }, dur);
  };

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`slots-${publicToken}`)
      .on("broadcast", { event: "gift" }, (msg) => doSpin(msg.payload?.username || "Viewer"))
      .on("broadcast", { event: "test_alert" }, () => doSpin("TestUser"))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`slots-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <div className="px-6 py-5 rounded-2xl" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1.5px solid rgba(255,255,255,0.1)", boxShadow: win ? "0 0 40px hsl(45 100% 55% / 0.2)" : "0 4px 20px rgba(0,0,0,0.3)" }}>
        <div className="text-center mb-3"><span className="text-sm font-bold uppercase tracking-widest" style={{ color: "hsl(45 100% 65%)" }}>🎰 Gift Slots</span></div>
        <div className="flex gap-3">
          {reels.map((idx, i) => (
            <motion.div key={i} className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${win ? "hsl(45 100% 55% / 0.3)" : "rgba(255,255,255,0.06)"}` }}
              animate={spinning ? { y: [0, -10, 6, -5, 0] } : {}} transition={{ duration: 0.12, repeat: spinning ? Infinity : 0, delay: i * 0.08 }}>
              <motion.span key={`${i}-${idx}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl">{SYMBOLS[idx]}</motion.span>
            </motion.div>
          ))}
        </div>
        {settings.show_jackpot && win && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: [1, 1.1, 1] }} className="text-center mt-3">
          <span className="text-lg font-bold" style={{ color: "hsl(45 100% 65%)" }}>🎉 JACKPOT!</span>
          {lastUser && <p className="text-xs text-white/50 mt-1">{lastUser} wins!</p>}
        </motion.div>}
        {!win && lastUser && <div className="text-center mt-2"><span className="text-xs text-white/40">{lastUser} spun!</span></div>}
      </div>
      
    </div>
  );
};

export default SlotMachineRenderer;
