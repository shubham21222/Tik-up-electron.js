import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, Users, Gift, Eye, Plus, Coins,
  Target, UserPlus, RotateCcw, Pencil, Copy, Trash2,
  ExternalLink, Info, ChevronDown
} from "lucide-react";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useAuth } from "@/hooks/use-auth";
import GoalCustomizePanel from "@/components/goals/GoalCustomizePanel";
import GoalCreateDialog from "@/components/goals/GoalCreateDialog";
import GoalOBSInstructions from "@/components/goals/GoalOBSInstructions";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";

const goalTypeConfig: Record<string, { icon: typeof Heart; label: string; color: string; barColor: string }> = {
  likes:       { icon: Heart, label: "Likes", color: "350 90% 55%", barColor: "hsl(160 100% 50%)" },
  shares:      { icon: Share2, label: "Shares", color: "200 100% 55%", barColor: "hsl(200 100% 55%)" },
  follows:     { icon: UserPlus, label: "Followers", color: "190 100% 50%", barColor: "hsl(190 100% 50%)" },
  viewers:     { icon: Eye, label: "Viewer Count", color: "45 100% 55%", barColor: "hsl(45 100% 55%)" },
  coins:       { icon: Coins, label: "Coins Earned", color: "280 100% 65%", barColor: "hsl(280 100% 65%)" },
  gifts:       { icon: Gift, label: "Gifts Count", color: "320 90% 55%", barColor: "hsl(320 90% 55%)" },
  subscribers: { icon: Users, label: "Subscribers", color: "160 100% 45%", barColor: "hsl(160 100% 45%)" },
  custom:      { icon: Target, label: "Custom Goal", color: "200 100% 55%", barColor: "hsl(200 100% 55%)" },
};

const goalTypeEmoji: Record<string, string> = {
  likes: "❤️", shares: "🔄", follows: "👤", viewers: "👁️",
  coins: "🪙", gifts: "🎁", subscribers: "⭐", custom: "🎯",
};

const GoalCard = ({ goal, onSimulate, onReset, onDelete, onCustomize }: {
  goal: Goal;
  onSimulate: () => void;
  onReset: () => void;
  onDelete: () => void;
  onCustomize: () => void;
}) => {
  const config = goalTypeConfig[goal.goal_type] || goalTypeConfig.custom;
  const emoji = goalTypeEmoji[goal.goal_type] || "🎯";
  const pct = goal.target_value > 0 ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
  const [showOBS, setShowOBS] = useState(false);
  const overlayUrl = `${getOverlayBaseUrl()}/overlay/goal/${goal.public_token}`;

  const handleCopy = () => {
    copyToClipboard(overlayUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      <div className="rounded-2xl p-6" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
        {/* Header with title + session badge + action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-heading font-bold text-foreground">{goal.title}</h3>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: "hsl(160 100% 45% / 0.15)", color: "hsl(160 100% 50%)", border: "1px solid hsl(160 100% 45% / 0.3)" }}>
              Session
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onCustomize}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "hsl(200 80% 50% / 0.15)", color: "hsl(200 80% 55%)" }}>
              <Pencil size={14} />
            </button>
            <button onClick={onReset}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "hsl(45 90% 50% / 0.15)", color: "hsl(45 90% 55%)" }}>
              <RotateCcw size={14} />
            </button>
            <button onClick={onDelete}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "hsl(350 80% 50% / 0.15)", color: "hsl(350 80% 55%)" }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-5">{config.label}</p>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="h-9 rounded-xl bg-muted/30 overflow-hidden relative flex items-center">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, 3)}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-xl relative overflow-hidden flex items-center px-3 gap-2"
              style={{ background: config.barColor, boxShadow: `0 0 20px ${config.barColor}40` }}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-xs font-bold text-white whitespace-nowrap drop-shadow-sm">{goal.title}</span>
              {/* Shimmer */}
              <motion.div className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} />
            </motion.div>
            {/* Counter on right */}
            <span className="absolute right-3 text-xs font-heading font-bold text-foreground">
              {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}{" "}
              <span className="text-muted-foreground">({pct}%)</span>
            </span>
          </div>
        </div>

        {/* URL Copy Bar */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors"
          style={{ borderColor: "hsl(160 100% 45% / 0.3)", background: "rgba(0,0,0,0.3)" }}>
          <span className="flex-1 text-[11px] font-mono text-muted-foreground truncate">{overlayUrl}</span>
          <button onClick={handleCopy}
            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors flex-shrink-0">
            <Copy size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const GoalOverlays = () => {
  const { user } = useAuth();
  const { goals, loading, createGoal, deleteGoal, simulateGoal, resetGoal } = useGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [customizeGoalId, setCustomizeGoalId] = useState<string | null>(null);

  const customizeGoal = goals.find(g => g.id === customizeGoalId);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Target size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Goal Overlays</h2>
            <p className="text-sm text-muted-foreground">Create real-time goals that update live on your TikTok stream.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Your Individual Goal Overlays</h1>
              <p className="text-muted-foreground text-sm">Manage and configure your stream goals</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
              <Plus size={16} /> Create Goal
            </button>
          </div>
        </motion.div>

        {/* Goal Cards */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl h-40 bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <Target size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No goals yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first goal overlay to get started.</p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:-translate-y-0.5 transition-all duration-200">
              <Plus size={16} /> Create First Goal
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {goals.map((goal, i) => (
                <GoalCard key={goal.id} goal={goal}
                  onSimulate={() => simulateGoal(goal.id, Math.ceil(goal.target_value * 0.1))}
                  onReset={() => resetGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                  onCustomize={() => setCustomizeGoalId(goal.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <GoalCreateDialog open={showCreate} onClose={() => setShowCreate(false)}
        onCreate={async (type, title, target) => { await createGoal(type, title, target); setShowCreate(false); }} />

      <AnimatePresence>
        {customizeGoal && <GoalCustomizePanel goal={customizeGoal} onClose={() => setCustomizeGoalId(null)} />}
      </AnimatePresence>
    </AppLayout>
  );
};

export default GoalOverlays;
