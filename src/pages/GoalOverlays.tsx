import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, Users, Gift, Eye, Plus, Coins,
  Target, UserPlus, RotateCcw,
  ChevronDown, Copy, Play, Settings, Trash2, ExternalLink,
  Info
} from "lucide-react";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useAuth } from "@/hooks/use-auth";
import GoalCustomizePanel from "@/components/goals/GoalCustomizePanel";
import GoalCreateDialog from "@/components/goals/GoalCreateDialog";
import GoalOBSInstructions from "@/components/goals/GoalOBSInstructions";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";

const goalTypeConfig: Record<string, { icon: typeof Heart; label: string; color: string }> = {
  likes: { icon: Heart, label: "Likes Goal", color: "350 90% 55%" },
  shares: { icon: Share2, label: "Shares Goal", color: "200 100% 55%" },
  follows: { icon: UserPlus, label: "Follows Goal", color: "160 100% 45%" },
  viewers: { icon: Eye, label: "Viewer Count Goal", color: "45 100% 55%" },
  coins: { icon: Coins, label: "Coins Earned Goal", color: "280 100% 65%" },
  gifts: { icon: Gift, label: "Gift Goal", color: "350 90% 55%" },
  subscribers: { icon: Users, label: "Subscribers Goal", color: "160 100% 45%" },
  custom: { icon: Target, label: "Custom Goal", color: "200 100% 55%" },
};



const GoalCard = ({ goal, onSimulate, onReset, onDelete, onCustomize }: {
  goal: Goal;
  onSimulate: () => void;
  onReset: () => void;
  onDelete: () => void;
  onCustomize: () => void;
}) => {
  const config = goalTypeConfig[goal.goal_type] || goalTypeConfig.custom;
  const Icon = config.icon;
  const pct = goal.target_value > 0 ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
  const [showOBS, setShowOBS] = useState(false);
  const overlayUrl = `${getOverlayBaseUrl()}/overlay/goal/${goal.public_token}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group rounded-2xl p-[1px] transition-all duration-300"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      <div
        className="rounded-2xl p-5 h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.08)]"
        style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${config.color} / 0.12)` }}>
              <Icon size={20} style={{ color: `hsl(${config.color})` }} />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-foreground">{goal.title}</h3>
              <p className="text-[11px] text-muted-foreground">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30">
              <div className={`w-2 h-2 rounded-full ${goal.is_active ? "bg-primary animate-pulse" : "bg-destructive"}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{goal.is_active ? "Live" : "Off"}</span>
            </div>
            {/* Style badge */}
            <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted/20 px-2 py-1 rounded-lg capitalize">
              {goal.style_preset}
            </span>
          </div>
        </div>

        {/* Target + Title inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Target</label>
            <div className="bg-muted/30 rounded-xl px-3 py-2 text-sm font-heading font-bold text-foreground">
              {goal.target_value.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Current</label>
            <div className="bg-muted/30 rounded-xl px-3 py-2 text-sm font-heading font-bold text-foreground">
              {goal.current_value.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Progress</span>
            <span className="text-sm font-heading font-bold text-foreground">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted/40 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, hsl(${config.color}), hsl(${config.color} / 0.7))`,
                boxShadow: `0 0 15px hsl(${config.color} / 0.3)`,
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center font-medium">
            {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}
          </p>
        </div>

        {/* URL Copy Bar */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-muted/20 border border-border/40">
          <div className="flex-1 text-[11px] text-muted-foreground font-mono truncate">
            {overlayUrl}
          </div>
          <button onClick={copyUrl} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors flex-shrink-0">
            <Copy size={11} /> Copy
          </button>
          <button onClick={() => window.open(overlayUrl, "_blank")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex-shrink-0">
            <ExternalLink size={13} />
          </button>
        </div>

        {/* OBS Instructions Toggle */}
        <button onClick={() => setShowOBS(!showOBS)} className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-4">
          <span className="flex items-center gap-1.5"><Info size={11} /> How to Use in OBS / TikTok Live Studio</span>
          <ChevronDown size={12} className={`transition-transform ${showOBS ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showOBS && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <GoalOBSInstructions url={overlayUrl} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={copyUrl} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 hover:-translate-y-0.5">
            <Copy size={12} /> Copy URL
          </button>
          <button onClick={onSimulate} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_15px_hsl(160_100%_45%/0.1)]">
            <Play size={12} /> Test
          </button>
          <button onClick={onCustomize} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
            <Settings size={12} /> Customize
          </button>
          <button onClick={onReset} className="px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5" title="Reset">
            <RotateCcw size={12} />
          </button>
          <button onClick={onDelete} className="px-3 py-2 rounded-xl border border-destructive/20 text-xs font-medium text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all duration-200 hover:-translate-y-0.5">
            <Trash2 size={12} />
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
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Goal Overlays</h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Create dynamic live goals that update in real-time during your TikTok stream. Paste the URL into OBS or TikTok Live Studio.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]"
          >
            <Plus size={16} /> Create Goal
          </button>
        </motion.div>

        {/* Goal Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Target size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No goals yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first goal overlay to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus size={16} /> Create First Goal
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onSimulate={() => simulateGoal(goal.id, Math.ceil(goal.target_value * 0.1))}
                  onReset={() => resetGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                  onCustomize={() => setCustomizeGoalId(goal.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <GoalCreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (type, title, target) => {
          await createGoal(type, title, target);
          setShowCreate(false);
        }}
      />

      {/* Customize Panel */}
      <AnimatePresence>
        {customizeGoal && (
          <GoalCustomizePanel
            goal={customizeGoal}
            onClose={() => setCustomizeGoalId(null)}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default GoalOverlays;
