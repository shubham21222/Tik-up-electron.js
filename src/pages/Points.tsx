import AppLayout from "@/components/AppLayout";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import {
  Trophy, Crown, Heart, Gift, MessageCircle, Medal
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const AnimNum = ({ value }: { value: number }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => { const c = animate(mv, value, { duration: 1.5, ease: [0.22, 1, 0.36, 1] }); return c.stop; }, [value, mv]);
  return <motion.span>{display}</motion.span>;
};

const topGifters = [
  { rank: 1, name: "GiftKing", value: 12500, avatar: "G", gifts: 342 },
  { rank: 2, name: "StreamLover99", value: 8200, avatar: "S", gifts: 214 },
  { rank: 3, name: "TikTokPro", value: 6800, avatar: "T", gifts: 187 },
  { rank: 4, name: "CoolViewer42", value: 3200, avatar: "C", gifts: 98 },
  { rank: 5, name: "NewFan2025", value: 1500, avatar: "N", gifts: 56 },
  { rank: 6, name: "VibeCheck", value: 900, avatar: "V", gifts: 34 },
  { rank: 7, name: "WatcherX", value: 700, avatar: "W", gifts: 28 },
  { rank: 8, name: "Supporter99", value: 550, avatar: "S", gifts: 21 },
];

const topLikers = [
  { rank: 1, name: "HeartSpammer", value: 45200, avatar: "H" },
  { rank: 2, name: "LikeMachine", value: 32100, avatar: "L" },
  { rank: 3, name: "DoubleTap", value: 28900, avatar: "D" },
  { rank: 4, name: "HeartBot", value: 19800, avatar: "H" },
  { rank: 5, name: "LoveStream", value: 12400, avatar: "L" },
];

const topChatters = [
  { rank: 1, name: "ChatKing", value: 3420, avatar: "C" },
  { rank: 2, name: "TalkativeTom", value: 2890, avatar: "T" },
  { rank: 3, name: "VibeMaster", value: 2100, avatar: "V" },
  { rank: 4, name: "StreamTalk", value: 1650, avatar: "S" },
  { rank: 5, name: "ChatMod", value: 1200, avatar: "C" },
];

const rankColors = ["", "45 100% 55%", "0 0% 65%", "25 70% 45%"];

const LeaderboardSection = ({ title, icon: Icon, data, unit, color }: {
  title: string; icon: typeof Trophy; data: { rank: number; name: string; value: number; avatar: string; gifts?: number }[]; unit: string; color: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className={glassCard} style={glassGradient}
  >
    <div className="rounded-2xl p-5" style={glassInnerStyle}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} style={{ color: `hsl(${color})` }} />
        <h2 className="text-sm font-heading font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-1">
        {data.map((item, i) => (
          <motion.div key={item.name}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/20 transition-colors"
          >
            <span className={`text-sm font-heading font-bold w-6 text-center ${
              item.rank <= 3 ? "" : "text-muted-foreground"
            }`} style={item.rank <= 3 ? { color: `hsl(${rankColors[item.rank]})` } : undefined}>
              {item.rank <= 3 ? <Medal size={16} style={{ color: `hsl(${rankColors[item.rank]})` }} /> : `#${item.rank}`}
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0"
              style={{ background: `linear-gradient(135deg, hsl(${color}), hsl(${color} / 0.7))` }}
            >
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              {"gifts" in item && <p className="text-[11px] text-muted-foreground">{item.gifts} gifts sent</p>}
            </div>
            <span className="text-sm font-heading font-bold" style={{ color: `hsl(${color})` }}>
              <AnimNum value={item.value} />
              <span className="text-[10px] text-muted-foreground ml-1">{unit}</span>
            </span>
            {item.rank === 1 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                <Crown size={10} className="text-secondary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

const Points = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-sm">Track your most active viewers, top gifters, and community champions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeaderboardSection title="Top Gifters" icon={Gift} data={topGifters} unit="coins" color="280 100% 65%" />
        <LeaderboardSection title="Top Likers" icon={Heart} data={topLikers} unit="likes" color="350 90% 55%" />
        <LeaderboardSection title="Top Chatters" icon={MessageCircle} data={topChatters} unit="msgs" color="160 100% 45%" />
      </div>
    </div>
  </AppLayout>
);

export default Points;
