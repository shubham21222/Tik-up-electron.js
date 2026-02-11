import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  Activity, Gift, Heart, UserPlus, Share2, MessageCircle,
  Clock
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const events = [
  { icon: Gift, label: "Gift Received", user: "StreamFan42", detail: "Sent a Rose 🌹", time: "2m ago", color: "280 100% 65%" },
  { icon: UserPlus, label: "New Follower", user: "TikTokUser_99", detail: "Started following you", time: "3m ago", color: "160 100% 45%" },
  { icon: Heart, label: "Like", user: "CoolViewer", detail: "Liked your stream", time: "4m ago", color: "350 90% 55%" },
  { icon: Share2, label: "Share", user: "BestFriend_01", detail: "Shared your stream", time: "5m ago", color: "200 100% 55%" },
  { icon: MessageCircle, label: "Chat", user: "ActiveChatter", detail: "\"Love this stream!\"", time: "6m ago", color: "45 100% 55%" },
  { icon: Gift, label: "Gift Received", user: "BigSpender", detail: "Sent a Lion 🦁 (5,000 coins)", time: "8m ago", color: "280 100% 65%" },
  { icon: UserPlus, label: "New Follower", user: "NewViewer_23", detail: "Started following you", time: "10m ago", color: "160 100% 45%" },
  { icon: Heart, label: "Like Burst", user: "HeartSpammer", detail: "Sent 50 likes", time: "11m ago", color: "350 90% 55%" },
  { icon: Gift, label: "Gift Received", user: "Generous_One", detail: "Sent a Universe 🌌 (34,999 coins)", time: "15m ago", color: "280 100% 65%" },
  { icon: Share2, label: "Share", user: "Supporter_X", detail: "Shared your stream", time: "18m ago", color: "200 100% 55%" },
  { icon: MessageCircle, label: "Chat Command", user: "Gamer_Pro", detail: "Used !dice → rolled a 6", time: "20m ago", color: "45 100% 55%" },
  { icon: UserPlus, label: "New Follower", user: "LateComer", detail: "Started following you", time: "25m ago", color: "160 100% 45%" },
];

const RecentActivity = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

    <div className="max-w-4xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Recent Activity</h1>
        <p className="text-muted-foreground text-sm">Real-time feed of all events from your TikTok LIVE stream.</p>
      </motion.div>

      <div className="space-y-2">
        {events.map((event, i) => {
          const Icon = event.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`${glassCard} group`} style={glassGradient}
            >
              <div className="rounded-2xl p-4 flex items-center gap-4 transition-shadow duration-300 group-hover:shadow-[0_0_20px_hsl(160_100%_45%/0.04)]" style={glassInnerStyle}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${event.color} / 0.1)` }}>
                  <Icon size={16} style={{ color: `hsl(${event.color})` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-heading font-bold text-foreground">{event.user}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{event.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{event.detail}</p>
                </div>
                <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} /> {event.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </AppLayout>
);

export default RecentActivity;
