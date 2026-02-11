import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Zap, Gift, Heart, UserPlus, Share2, Star, Plus,
  Play, Settings, Trash2, Clock,
  Volume2, Gamepad2, Monitor
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInner = "rounded-2xl h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.06)]";
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

type AlertType = { id: string; icon: typeof Zap; label: string; trigger: string; action: string; cooldown: string; active: boolean; color: string };

const alerts: AlertType[] = [
  { id: "1", icon: UserPlus, label: "Follow Alert", trigger: "New Follow", action: "Play Sound + Show Overlay", cooldown: "5s", active: true, color: "160 100% 45%" },
  { id: "2", icon: Heart, label: "Like Alert", trigger: "Like Received", action: "Floating Hearts", cooldown: "0s", active: true, color: "350 90% 55%" },
  { id: "3", icon: Gift, label: "Gift Alert", trigger: "Any Gift", action: "Sound + Overlay + TTS", cooldown: "3s", active: true, color: "280 100% 65%" },
  { id: "4", icon: Share2, label: "Share Alert", trigger: "Stream Shared", action: "Show Overlay", cooldown: "10s", active: true, color: "200 100% 55%" },
  { id: "5", icon: Star, label: "Milestone Alert", trigger: "1K / 5K / 10K Likes", action: "Celebration Effect", cooldown: "0s", active: false, color: "45 100% 55%" },
  { id: "6", icon: Gamepad2, label: "Game Trigger", trigger: "Gift > 100 coins", action: "Spawn Vehicle (GTA 5)", cooldown: "30s", active: false, color: "160 100% 45%" },
  { id: "7", icon: Volume2, label: "Sound on Gift: Rose", trigger: "Rose Gift", action: "Play chime.mp3", cooldown: "2s", active: true, color: "350 90% 55%" },
  { id: "8", icon: Monitor, label: "Screen Shake", trigger: "Gift > 500 coins", action: "Shake Effect (3s)", cooldown: "15s", active: false, color: "200 100% 55%" },
];

const tabs = ["All Alerts", "Gifts", "Social", "Advanced"];

const Actions = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const filtered = activeTab === "Gifts"
    ? alerts.filter(a => ["Gift Alert", "Sound on Gift: Rose", "Screen Shake"].includes(a.label))
    : activeTab === "Social"
    ? alerts.filter(a => ["Follow Alert", "Like Alert", "Share Alert", "Milestone Alert"].includes(a.label))
    : activeTab === "Advanced"
    ? alerts.filter(a => ["Game Trigger", "Screen Shake"].includes(a.label))
    : alerts;

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Event Alerts</h1>
            <p className="text-muted-foreground text-sm">Configure real-time alerts triggered by viewer interactions on your TikTok LIVE.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> New Alert
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-muted/30 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >{tab}</button>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <motion.div key={alert.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`${glassCard} group cursor-default`} style={glassGradient}
              >
                <div className={glassInner} style={glassInnerStyle}>
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(${alert.color} / 0.1)` }}>
                          <Icon size={18} style={{ color: `hsl(${alert.color})` }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-heading font-bold text-foreground">{alert.label}</h3>
                          <p className="text-[11px] text-muted-foreground">{alert.trigger}</p>
                        </div>
                      </div>
                      {/* Toggle */}
                      <button className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${alert.active ? "bg-primary/30" : "bg-muted/60"}`}>
                        <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${alert.active ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-muted/30 rounded-xl px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-0.5">Action</p>
                        <p className="text-xs text-foreground font-medium">{alert.action}</p>
                      </div>
                      <div className="bg-muted/30 rounded-xl px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-0.5">Cooldown</p>
                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><Clock size={10} /> {alert.cooldown}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
                        <Play size={12} /> Test
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5">
                        <Settings size={12} /> Edit
                      </button>
                      <button className="px-3 py-2 rounded-xl border border-destructive/20 text-xs font-medium text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all duration-200 hover:-translate-y-0.5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Actions;
