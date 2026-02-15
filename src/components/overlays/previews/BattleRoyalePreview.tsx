import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const COLORS = ["350 80% 55%", "45 100% 55%", "160 100% 45%", "200 80% 55%", "280 70% 60%", "15 90% 55%"];
const NAMES = ["Luna", "DarkKnight", "Sparkle", "GiftKing", "NeonWolf", "TikFan99", "Blaze", "StarDust"];

interface Fighter {
  id: number;
  name: string;
  color: string;
  hp: number;
  x: number;
  y: number;
  eliminated: boolean;
}

const BattleRoyalePreview = () => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [phase, setPhase] = useState<"joining" | "fighting" | "winner">("joining");
  const [round, setRound] = useState(0);
  const nextId = useRef(0);

  // Auto-demo loop
  useEffect(() => {
    const initial: Fighter[] = Array.from({ length: 6 }, (_, i) => ({
      id: nextId.current++,
      name: NAMES[i],
      color: COLORS[i],
      hp: 100,
      x: 15 + (i % 3) * 30 + Math.random() * 10,
      y: 20 + Math.floor(i / 3) * 35 + Math.random() * 10,
      eliminated: false,
    }));
    setFighters(initial);
    setPhase("joining");

    const t1 = setTimeout(() => setPhase("fighting"), 2000);
    return () => clearTimeout(t1);
  }, []);

  // Fighting phase
  useEffect(() => {
    if (phase !== "fighting") return;
    const alive = fighters.filter(f => !f.eliminated);
    if (alive.length <= 1) {
      setPhase("winner");
      return;
    }

    const interval = setInterval(() => {
      setFighters(prev => {
        const alive = prev.filter(f => !f.eliminated);
        if (alive.length <= 1) return prev;
        const target = alive[Math.floor(Math.random() * alive.length)];
        const dmg = 20 + Math.floor(Math.random() * 30);
        return prev.map(f =>
          f.id === target.id
            ? { ...f, hp: Math.max(0, f.hp - dmg), eliminated: f.hp - dmg <= 0 }
            : f
        );
      });
      setRound(r => r + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [phase, fighters]);

  // Restart loop
  useEffect(() => {
    if (phase !== "winner") return;
    const t = setTimeout(() => {
      const initial: Fighter[] = Array.from({ length: 6 }, (_, i) => ({
        id: nextId.current++,
        name: NAMES[i],
        color: COLORS[i],
        hp: 100,
        x: 15 + (i % 3) * 30 + Math.random() * 10,
        y: 20 + Math.floor(i / 3) * 35 + Math.random() * 10,
        eliminated: false,
      }));
      setFighters(initial);
      setPhase("joining");
      setRound(0);
      setTimeout(() => setPhase("fighting"), 2000);
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]);

  const alive = fighters.filter(f => !f.eliminated);
  const winner = phase === "winner" ? alive[0] : null;

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Arena bg */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(ellipse at center, hsl(350 80% 40%), transparent 70%)" }} />

      {/* Phase indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: phase === "fighting" ? "hsl(350 80% 55% / 0.15)" : phase === "winner" ? "hsl(45 100% 55% / 0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${phase === "fighting" ? "hsl(350 80% 55% / 0.3)" : phase === "winner" ? "hsl(45 100% 55% / 0.3)" : "rgba(255,255,255,0.1)"}`,
            color: phase === "fighting" ? "hsl(350 80% 65%)" : phase === "winner" ? "hsl(45 100% 65%)" : "rgba(255,255,255,0.5)",
          }}
        >
          {phase === "joining" ? `${fighters.length} Joined` : phase === "fighting" ? `⚔️ ${alive.length} Alive` : "🏆 Winner!"}
        </motion.div>
      </div>

      {/* Fighters */}
      <AnimatePresence>
        {fighters.map(f => (
          <motion.div
            key={f.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: f.eliminated ? 0 : 1,
              opacity: f.eliminated ? 0 : 1,
              x: phase === "fighting" ? [0, Math.random() * 6 - 3, 0] : 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute flex flex-col items-center"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: `hsl(${f.color} / 0.2)`,
                border: `2px solid hsl(${f.color} / 0.5)`,
                boxShadow: f.hp < 40 ? `0 0 8px hsl(350 80% 50% / 0.4)` : `0 0 8px hsl(${f.color} / 0.2)`,
                color: `hsl(${f.color})`,
              }}
            >
              {f.name[0]}
            </div>
            {/* HP bar */}
            <div className="w-8 h-[3px] mt-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${f.hp}%` }}
                style={{ background: f.hp > 50 ? `hsl(160 100% 45%)` : f.hp > 25 ? `hsl(45 100% 55%)` : `hsl(350 80% 55%)` }}
              />
            </div>
            <span className="text-[7px] text-white/40 mt-0.5">{f.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Winner announcement */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl mb-1"
            >🏆</motion.div>
            <p className="text-sm font-bold font-heading" style={{ color: `hsl(${winner.color})` }}>{winner.name}</p>
            <p className="text-[8px] text-white/40">Last one standing!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BattleRoyalePreview;
