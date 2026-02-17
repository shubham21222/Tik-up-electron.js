import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const COLORS = ["350 80% 55%", "45 100% 55%", "160 100% 45%", "200 80% 55%", "280 70% 60%", "15 90% 55%", "320 80% 50%", "180 70% 45%",
  "100 60% 45%", "250 70% 55%", "30 90% 55%", "190 80% 45%", "0 80% 50%", "60 90% 50%", "220 80% 55%", "300 70% 55%"];

interface Fighter { id: number; name: string; color: string; hp: number; x: number; y: number; eliminated: boolean; }

const BattleRoyaleRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState<any>({ transparent_bg: true, max_fighters: 8, round_speed: 3, show_hp: true });
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [phase, setPhase] = useState<"waiting" | "fighting" | "winner">("waiting");
  const [connected, setConnected] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings((prev: any) => ({ ...prev, ...(data as any).settings })); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`battle-${publicToken}`)
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const name = p.username || "Viewer";
        setFighters(prev => {
          if (prev.some(f => f.name === name)) return prev;
          if (prev.length >= (settings.max_fighters || 8)) return prev;
          const id = nextId.current++;
          return [...prev, { id, name, color: COLORS[id % COLORS.length], hp: 100,
            x: 10 + Math.random() * 80, y: 15 + Math.random() * 60, eliminated: false }];
        });
      })
      .on("broadcast", { event: "start_battle" }, () => setPhase("fighting"))
      .on("broadcast", { event: "test_alert" }, () => {
        const id = nextId.current++;
        setFighters(prev => [...prev, { id, name: `Test${id}`, color: COLORS[id % COLORS.length], hp: 100,
          x: 10 + Math.random() * 80, y: 15 + Math.random() * 60, eliminated: false }]);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`battle-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings((prev: any) => ({ ...prev, ...p.new.settings })); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, settings.max_fighters]);

  // Auto-start when enough fighters
  useEffect(() => {
    if (phase === "waiting" && fighters.filter(f => !f.eliminated).length >= 2) {
      const t = setTimeout(() => setPhase("fighting"), 5000);
      return () => clearTimeout(t);
    }
  }, [fighters, phase]);

  // Fighting
  useEffect(() => {
    if (phase !== "fighting") return;
    const interval = setInterval(() => {
      setFighters(prev => {
        const alive = prev.filter(f => !f.eliminated);
        if (alive.length <= 1) { setPhase("winner"); return prev; }
        const target = alive[Math.floor(Math.random() * alive.length)];
        const dmg = 15 + Math.floor(Math.random() * 25);
        return prev.map(f => f.id === target.id ? { ...f, hp: Math.max(0, f.hp - dmg), eliminated: f.hp - dmg <= 0 } : f);
      });
    }, (settings.round_speed || 3) * 300);
    return () => clearInterval(interval);
  }, [phase, settings.round_speed]);

  // Reset after winner
  useEffect(() => {
    if (phase !== "winner") return;
    const t = setTimeout(() => { setFighters([]); setPhase("waiting"); nextId.current = 0; }, 8000);
    return () => clearTimeout(t);
  }, [phase]);

  const alive = fighters.filter(f => !f.eliminated);
  const winner = phase === "winner" ? alive[0] : null;

  return (
    <div className={`w-screen h-screen overflow-hidden relative ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      {/* Phase */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="px-4 py-1.5 rounded-full text-sm font-bold" style={{
          background: phase === "fighting" ? "hsl(350 80% 55% / 0.15)" : phase === "winner" ? "hsl(45 100% 55% / 0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${phase === "fighting" ? "hsl(350 80% 55% / 0.3)" : phase === "winner" ? "hsl(45 100% 55% / 0.3)" : "rgba(255,255,255,0.1)"}`,
          color: phase === "fighting" ? "hsl(350 80% 65%)" : phase === "winner" ? "hsl(45 100% 65%)" : "rgba(255,255,255,0.4)",
        }}>
          {phase === "waiting" ? `⏳ ${fighters.length} Joined` : phase === "fighting" ? `⚔️ ${alive.length} Alive` : "🏆 Winner!"}
        </div>
      </div>
      <AnimatePresence>
        {fighters.map(f => (
          <motion.div key={f.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: f.eliminated ? 0 : 1, opacity: f.eliminated ? 0 : 1 }}
            exit={{ scale: 0, opacity: 0 }} className="absolute flex flex-col items-center" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background: `hsl(${f.color} / 0.2)`, border: `2px solid hsl(${f.color} / 0.5)`, color: `hsl(${f.color})` }}>{f.name[0]}</div>
            {settings.show_hp && <div className="w-12 h-1 mt-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${f.hp}%` }}
                style={{ background: f.hp > 50 ? "hsl(160 100% 45%)" : f.hp > 25 ? "hsl(45 100% 55%)" : "hsl(350 80% 55%)" }} /></div>}
            <span className="text-[10px] text-white/50 mt-0.5">{f.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {winner && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center px-8 py-6 rounded-2xl" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid hsl(45 100% 55% / 0.2)" }}>
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-xl font-bold font-heading" style={{ color: `hsl(${winner.color})` }}>{winner.name}</p>
          <p className="text-sm text-white/50">Last one standing!</p>
        </div>
      </motion.div>}
      
    </div>
  );
};

export default BattleRoyaleRenderer;
