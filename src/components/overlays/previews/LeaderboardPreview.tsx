import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface LeaderboardPreviewProps {
  settings?: Record<string, any>;
}

const mockEntries = [
  { name: "GiftKing99", value: 12500, avatar: "👑", avatar_url: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/smg.jpeg" },
  { name: "StreamFan42", value: 8400, avatar: "🌟", avatar_url: "" },
  { name: "NightVibes", value: 6200, avatar: "🌙", avatar_url: "" },
  { name: "CoolCreator", value: 3800, avatar: "🎨", avatar_url: "" },
  { name: "MusicLover", value: 2100, avatar: "🎵", avatar_url: "" },
];

const medals = ["🥇", "🥈", "🥉"];

const LeaderboardPreview = ({ settings = {} }: LeaderboardPreviewProps) => {
  const [entries, setEntries] = useState(mockEntries);
  const mode = settings.display_mode || "vertical";
  const accent = settings.accent_color || "45 100% 55%";
  const maxEntries = settings.max_entries || 5;
  const showValues = settings.show_values ?? true;
  const _crownFirst = settings.crown_for_first ?? true;

  useEffect(() => {
    const t = setInterval(() => {
      setEntries(prev => {
        const updated = [...prev];
        const idx = Math.floor(Math.random() * updated.length);
        updated[idx] = { ...updated[idx], value: updated[idx].value + Math.floor(Math.random() * 500) };
        return updated.sort((a, b) => b.value - a.value);
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const visible = entries.slice(0, maxEntries);

  if (mode === "podium") {
    const top3 = visible.slice(0, 3);
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const heights = [60, 80, 45];
    return (
      <div className="relative w-full h-full flex items-end justify-center gap-2 pb-8">
        {podiumOrder.map((entry, i) => {
          const rank = i === 1 ? 0 : i === 0 ? 1 : 2;
          return (
            <motion.div key={entry.name} className="flex flex-col items-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}>
              {entry.avatar_url ? <img src={entry.avatar_url} alt={entry.name} className="w-7 h-7 rounded-full object-cover border border-white/10" /> : <span className="text-xl mb-1">{entry.avatar}</span>}
              <p className="text-[10px] font-bold text-white truncate max-w-[60px]">{entry.name}</p>
              {showValues && <p className="text-[9px] mb-1" style={{ color: `hsl(${accent})` }}>{entry.value.toLocaleString()}</p>}
              <motion.div className="w-16 rounded-t-lg flex items-start justify-center pt-2" style={{
                height: heights[i],
                background: rank === 0
                  ? `linear-gradient(to top, hsl(${accent} / 0.3), hsl(${accent} / 0.1))`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${rank === 0 ? `hsl(${accent} / 0.3)` : "rgba(255,255,255,0.06)"}`,
                boxShadow: rank === 0 ? `0 0 15px hsl(${accent} / 0.15)` : "none",
              }}>
                <span className="text-sm">{medals[rank] || `#${rank + 1}`}</span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  if (mode === "ticker") {
    return (
      <div className="relative w-full h-full flex items-center overflow-hidden">
        <motion.div className="flex gap-6 absolute" animate={{ x: [300, -600] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
          {[...visible, ...visible].map((entry, i) => (
            <div key={`${entry.name}-${i}`} className="flex items-center gap-2 px-4 py-2 rounded-xl shrink-0"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm">{i % visible.length < 3 ? medals[i % visible.length] : `#${(i % visible.length) + 1}`}</span>
              <span className="text-xs font-bold text-white">{entry.name}</span>
              {showValues && <span className="text-[10px]" style={{ color: `hsl(${accent})` }}>{entry.value.toLocaleString()}</span>}
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // vertical (default) and spotlight
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 gap-1.5">
      <AnimatePresence>
        {visible.map((entry, i) => (
          <motion.div key={entry.name} layout className="w-full flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{
              background: i === 0 ? `linear-gradient(90deg, hsl(${accent} / 0.1), transparent)` : "rgba(255,255,255,0.02)",
              border: i === 0 ? `1px solid hsl(${accent} / 0.15)` : "1px solid rgba(255,255,255,0.03)",
            }}
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
            <span className="text-sm w-6 text-center">{i < 3 ? medals[i] : <span className="text-[10px] text-white/30">#{i + 1}</span>}</span>
            {settings.show_avatars !== false && (
              entry.avatar_url
                ? <img src={entry.avatar_url} alt={entry.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                : <span className="text-sm">{entry.avatar}</span>
            )}
            <span className="text-xs font-bold text-white flex-1 truncate">{entry.name}</span>
            {showValues && (
              <motion.span className="text-[11px] font-bold" style={{ color: i === 0 ? `hsl(${accent})` : "rgba(255,255,255,0.5)" }}
                key={entry.value} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                {entry.value.toLocaleString()}
              </motion.span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPreview;
