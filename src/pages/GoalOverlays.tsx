import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Share2, Users, Star, Gift, Eye, Plus,
  Copy, Play, Settings, Trash2, Crown, Target,
  RotateCcw, Clock, ChevronDown
} from "lucide-react";

interface GoalCardData {
  id: string;
  type: string;
  icon: typeof Heart;
  title: string;
  target: number;
  current: number;
  isPro: boolean;
  action: string;
  onReach: string;
}

const goalCards: GoalCardData[] = [
  { id: "1", type: "Likes Goal", icon: Heart, title: "Like Milestone", target: 500, current: 327, isPro: false, action: "Play Sound", onReach: "Show Alert" },
  { id: "2", type: "Shares Goal", icon: Share2, title: "Share Challenge", target: 100, current: 64, isPro: true, action: "Run Animation", onReach: "Trigger Overlay" },
  { id: "3", type: "Follows Goal", icon: Users, title: "Follow Sprint", target: 200, current: 156, isPro: false, action: "Play Sound", onReach: "Show Alert" },
  { id: "4", type: "Stars Goal", icon: Star, title: "Star Rush", target: 1000, current: 782, isPro: true, action: "Run Command", onReach: "Send Message" },
  { id: "5", type: "Gift Goal", icon: Gift, title: "Gift Bonanza", target: 50, current: 23, isPro: false, action: "Play Sound", onReach: "Show Alert" },
  { id: "6", type: "Viewers Goal", icon: Eye, title: "Peak Viewers", target: 300, current: 189, isPro: true, action: "Run Animation", onReach: "Trigger Overlay" },
];

const ProgressBar = ({ current, target }: { current: number; target: number }) => {
  const pct = Math.min((current / target) * 100, 100);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">Progress</span>
        <span className="text-sm font-heading font-bold text-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted/60 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full relative"
          style={{
            background: "linear-gradient(90deg, hsl(160 100% 45%), hsl(180 100% 42%))",
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 50%, transparent)",
              animation: "shimmer 2.5s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
        {current.toLocaleString()} / {target.toLocaleString()}
      </p>
    </div>
  );
};

const SelectDropdown = ({ value, options }: { value: string; options: string[] }) => (
  <div className="relative">
    <select
      defaultValue={value}
      className="appearance-none w-full bg-muted/40 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground font-medium outline-none focus:border-primary/40 transition-colors cursor-pointer pr-7"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
  </div>
);

const GoalCard = ({ goal }: { goal: GoalCardData }) => {
  const Icon = goal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group rounded-2xl p-[1px] transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      }}
    >
      <div
        className="rounded-2xl p-5 h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.08)]"
        style={{
          background: "rgba(20,25,35,0.65)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-foreground">{goal.type}</h3>
              {goal.isPro && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary px-1.5 py-0.5 rounded-md bg-secondary/10 mt-0.5">
                  <Crown size={9} /> PRO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mb-1">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Target</label>
            <input
              type="number"
              defaultValue={goal.target}
              className="w-full bg-muted/40 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground font-medium outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Title</label>
            <input
              type="text"
              defaultValue={goal.title}
              className="w-full bg-muted/40 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground font-medium outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">When Reached</label>
            <SelectDropdown value={goal.onReach} options={["Show Alert", "Trigger Overlay", "Send Message", "Run Command"]} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Action</label>
            <SelectDropdown value={goal.action} options={["Play Sound", "Run Animation", "Run Command", "None"]} />
          </div>
        </div>

        {/* Progress */}
        <ProgressBar current={goal.current} target={goal.target} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-5">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 hover:-translate-y-0.5">
            <Copy size={12} /> Copy URL
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_15px_hsl(160_100%_45%/0.1)]">
            <Play size={12} /> Test
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
            <Settings size={12} /> Customize
          </button>
          <button className="px-3 py-2 rounded-xl border border-destructive/20 text-xs font-medium text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all duration-200 hover:-translate-y-0.5">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const GoalOverlays = () => {
  return (
    <AppLayout>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Goal Overlays
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Create dynamic live goals that update in real-time during your TikTok stream.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> Create New Goal
          </button>
        </motion.div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {goalCards.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <GoalCard goal={goal} />
            </motion.div>
          ))}
        </div>

        {/* Custom Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          }}
        >
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(20,25,35,0.65)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target size={20} className="text-primary" />
              <h2 className="text-lg font-heading font-bold text-foreground">Custom Goals</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl">
              Configure advanced goal settings, reset schedules, and custom event triggers for your stream goals.
            </p>

            <div className="h-[1px] bg-border/40 mb-6" />

            <div className="space-y-5">
              {[
                { icon: RotateCcw, label: "Auto-reset goals after stream ends", desc: "Goals will automatically reset to 0 when your stream ends." },
                { icon: Clock, label: "Time-based goal deadlines", desc: "Set countdown timers for goals. When time expires, the goal resets." },
                { icon: Star, label: "Milestone notifications", desc: "Get notified at 25%, 50%, 75% and 100% progress milestones." },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <item.icon size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button className="w-10 h-[22px] rounded-full bg-muted/60 relative transition-colors duration-200 hover:bg-muted">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground/60 absolute left-1 top-[3px] transition-all duration-200" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </AppLayout>
  );
};

export default GoalOverlays;
