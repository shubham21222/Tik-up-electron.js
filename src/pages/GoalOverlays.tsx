import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, UserPlus, Eye, Coins, Star,
  Copy, Play, Settings2, ChevronLeft, ChevronRight,
  Trash2, Target
} from "lucide-react";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useAuth } from "@/hooks/use-auth";
import GoalCustomizePanel from "@/components/goals/GoalCustomizePanel";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";
import { useSubscription } from "@/hooks/use-subscription";

/* ── Goal type definitions ── */
interface GoalTypeConfig {
  id: string;
  icon: typeof Heart;
  label: string;
  defaultTitle: string;
  defaultTarget: number;
  color: string;
  barColors: string[];
  pro?: boolean;
}

const GOAL_TYPES: GoalTypeConfig[] = [
  { id: "likes", icon: Heart, label: "Likes", defaultTitle: "Like Goal", defaultTarget: 1000, color: "350 90% 55%", barColors: ["hsl(160 100% 50%)", "hsl(180 100% 45%)"] },
  { id: "shares", icon: Share2, label: "Shares", defaultTitle: "Share Goal", defaultTarget: 50, color: "200 100% 55%", barColors: ["hsl(160 100% 50%)", "hsl(200 100% 55%)"] },
  { id: "follows", icon: UserPlus, label: "Follows", defaultTitle: "New Followers", defaultTarget: 20, color: "190 100% 50%", barColors: ["hsl(200 100% 55%)", "hsl(190 100% 50%)"], pro: true },
  { id: "viewers", icon: Eye, label: "Viewer Count", defaultTitle: "Viewer Goal", defaultTarget: 100, color: "45 100% 55%", barColors: ["hsl(160 100% 50%)", "hsl(45 100% 55%)"] },
  { id: "coins", icon: Coins, label: "Coins Earned", defaultTitle: "Earned Coins", defaultTarget: 500, color: "280 100% 65%", barColors: ["hsl(280 100% 65%)", "hsl(320 90% 55%)"] },
  { id: "custom", icon: Star, label: "Channel Points Earned", defaultTitle: "Earned Points", defaultTarget: 50, color: "45 100% 50%", barColors: ["hsl(45 100% 50%)", "hsl(35 100% 55%)"] },
];

const WHEN_REACHED_OPTIONS = [
  { label: "Keep Goal unchanged", value: "none" },
  { label: "Reset Goal", value: "reset" },
  { label: "Double Goal", value: "double" },
  { label: "Hide Goal", value: "hide" },
];

const STYLE_PRESETS = ["glass", "neon", "minimal", "gradient", "tiktok", "cyber", "flame", "ice", "festive", "rgb"];
const STYLE_COUNT = STYLE_PRESETS.length;

/* ── Individual Goal Card ── */
const GoalTypeCard = ({
  typeConfig,
  goal,
  onEnsureGoal,
  onSimulate,
  onCustomize,
  onDelete,
  isPro,
}: {
  typeConfig: GoalTypeConfig;
  goal: Goal | null;
  onEnsureGoal: (type: string, title: string, target: number) => Promise<Goal | null>;
  onSimulate: (goalId: string) => void;
  onCustomize: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  isPro: boolean;
}) => {
  const Icon = typeConfig.icon;
  const isProLocked = typeConfig.pro && !isPro;

  const [title, setTitle] = useState(goal?.title || typeConfig.defaultTitle);
  const [target, setTarget] = useState(goal?.target_value || typeConfig.defaultTarget);
  const [whenReached, setWhenReached] = useState(goal?.on_complete_action || "none");
  const [styleIndex, setStyleIndex] = useState(0);

  const { updateGoal } = useGoals();

  // Sync from goal data
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTarget(goal.target_value);
      setWhenReached(goal.on_complete_action || "none");
      const presetIdx = STYLE_PRESETS.indexOf(goal.style_preset);
      if (presetIdx >= 0) setStyleIndex(presetIdx);
    }
  }, [goal?.id]);

  const overlayUrl = goal
    ? `${getOverlayBaseUrl()}/overlay/goal/${goal.public_token}`
    : "";

  const handleCopyUrl = async () => {
    if (!goal) {
      const newGoal = await onEnsureGoal(typeConfig.id, title, target);
      if (newGoal) {
        const url = `${getOverlayBaseUrl()}/overlay/goal/${newGoal.public_token}`;
        copyToClipboard(url, "Goal URL copied!");
      }
    } else {
      copyToClipboard(overlayUrl, "Goal URL copied!");
    }
  };

  const handleTest = async () => {
    if (!goal) {
      const newGoal = await onEnsureGoal(typeConfig.id, title, target);
      if (newGoal) onSimulate(newGoal.id);
    } else {
      onSimulate(goal.id);
    }
  };

  const handleCustomize = async () => {
    if (!goal) {
      const newGoal = await onEnsureGoal(typeConfig.id, title, target);
      if (newGoal) onCustomize(newGoal.id);
    } else {
      onCustomize(goal.id);
    }
  };

  // Auto-save field changes
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  const handleFieldChange = useCallback((field: "title" | "target" | "on_complete_action", value: string | number) => {
    if (field === "title") setTitle(value as string);
    if (field === "target") setTarget(value as number);
    if (field === "on_complete_action") setWhenReached(value as string);

    if (goal) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        const update: Record<string, unknown> = {};
        if (field === "title") update.title = value;
        if (field === "target") update.target_value = value;
        if (field === "on_complete_action") update.on_complete_action = value;
        updateGoal(goal.id, update as Partial<Goal>);
      }, 800);
    }
  }, [goal, updateGoal]);

  const prevStyle = () => setStyleIndex(i => (i - 1 + STYLE_COUNT) % STYLE_COUNT);
  const nextStyle = () => setStyleIndex(i => (i + 1) % STYLE_COUNT);

  // Auto-save style changes
  useEffect(() => {
    if (goal && STYLE_PRESETS[styleIndex] !== goal.style_preset) {
      updateGoal(goal.id, { style_preset: STYLE_PRESETS[styleIndex] });
    }
  }, [styleIndex]);

  // Check if style is pro-locked (styles beyond the first 5 are pro)
  const isStyleProLocked = styleIndex >= 5 && !isPro;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-[1px] relative"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      {isProLocked && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "hsl(280 100% 65% / 0.2)", color: "hsl(280 100% 70%)" }}>
            TikUp Pro exclusive
          </span>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: "rgba(14,18,26,0.8)", backdropFilter: "blur(16px)" }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} style={{ color: `hsl(${typeConfig.color})` }} />
          <h3 className="text-sm font-heading font-bold text-foreground">{typeConfig.label}</h3>
          {typeConfig.pro && (
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md" style={{ background: "hsl(350 90% 55% / 0.15)", color: "hsl(350 90% 60%)" }}>
              PRO
            </span>
          )}
          {goal && (
            <button onClick={() => onDelete(goal.id)} className="ml-auto p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Settings row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1 block font-semibold">Goal:</label>
            <input
              type="number"
              value={target}
              onChange={(e) => handleFieldChange("target", Number(e.target.value))}
              min={1}
              className="w-full bg-muted/20 border border-border/40 rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1 block font-semibold">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="w-full bg-muted/20 border border-border/40 rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1 block font-semibold">When reached:</label>
            <select
              value={whenReached}
              onChange={(e) => handleFieldChange("on_complete_action", e.target.value)}
              className="w-full bg-muted/20 border border-border/40 rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-primary/40 transition-colors appearance-none"
            >
              {WHEN_REACHED_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1 block font-semibold">Actions:</label>
            <button
              onClick={handleCustomize}
              className="w-full bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-2 text-xs text-primary font-medium hover:bg-primary/15 transition-colors text-left"
            >
              Customize
            </button>
          </div>
        </div>

        {/* Live iframe preview */}
        {goal && (
          <div className="mb-4 rounded-xl overflow-hidden border border-border/20 relative" style={{ height: 140, background: "rgba(0,0,0,0.5)" }}>
            <iframe
              src={`/overlay/goal/${goal.public_token}?t=${goal.style_preset}`}
              className="border-0 pointer-events-none absolute top-0 left-0"
              style={{
                transform: "scale(0.5)",
                transformOrigin: "top left",
                width: "200%",
                height: "200%",
              }}
              title={`${typeConfig.label} preview`}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
              {isStyleProLocked && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(280 100% 65% / 0.3)", color: "hsl(280 100% 75%)" }}>
                  PRO STYLE
                </span>
              )}
              <span className="text-[8px] font-mono text-white/40 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">LIVE</span>
            </div>
          </div>
        )}

        {/* URL + action buttons row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-muted/15 border border-border/30 rounded-lg px-3 py-2 flex items-center">
            <span className="text-[10px] font-mono text-muted-foreground/60 truncate">
              {overlayUrl || `${getOverlayBaseUrl()}/overlay/goal/...`}
            </span>
          </div>
          <button onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "hsl(200 80% 65%)" }}>
            <Copy size={12} /> Copy URL
          </button>
          <button onClick={handleTest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "hsl(160 100% 50%)" }}>
            <Play size={12} /> Test
          </button>
          <button onClick={handleCustomize}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "hsl(280 80% 65%)" }}>
            <Settings2 size={12} /> Customize
          </button>
        </div>

        {/* Style carousel */}
        <div className="relative">
          <button onClick={prevStyle}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <ChevronLeft size={14} className="text-white/60" />
          </button>
          <div className="px-9 flex items-center justify-center gap-2">
            {STYLE_PRESETS.map((preset, i) => (
              <button
                key={preset}
                onClick={() => setStyleIndex(i)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all duration-200 ${
                  styleIndex === i
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted/20 text-muted-foreground/60 border border-transparent hover:text-muted-foreground"
                }`}
              >
                {preset}
                {i >= 5 && !isPro && <span className="ml-0.5 text-[7px] align-super" style={{ color: "hsl(350 90% 60%)" }}>★</span>}
              </button>
            ))}
          </div>
          <button onClick={nextStyle}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <ChevronRight size={14} className="text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Page ── */
const GoalOverlays = () => {
  const { user } = useAuth();
  const { goals, loading, createGoal, deleteGoal, simulateGoal } = useGoals();
  const { isPro } = useSubscription();
  const [customizeGoalId, setCustomizeGoalId] = useState<string | null>(null);
  const customizeGoal = goals.find(g => g.id === customizeGoalId);

  // Map goals by type for quick lookup
  const goalsByType = goals.reduce<Record<string, Goal>>((acc, g) => {
    if (!acc[g.goal_type]) acc[g.goal_type] = g;
    return acc;
  }, {});

  const ensureGoal = async (type: string, title: string, target: number): Promise<Goal | null> => {
    const existing = goalsByType[type];
    if (existing) return existing;
    return await createGoal(type, title, target);
  };

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
      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">Goal Overlays</h1>
            <PageHelpButton featureKey="goal_overlays" />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            What goals do you have in your broadcast? Define Like, Share or Follow goals in the form of progress indicators.
            To include the goals in <strong className="text-foreground">OBS (Browser Source)</strong> or <strong className="text-foreground">LIVE Studio (Link)</strong>, simply
            copy the URLs. You can change the colors by clicking on the "Customize" button.
          </p>
        </motion.div>

        {/* Goal cards grid — 2 columns */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl h-56 bg-muted/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {GOAL_TYPES.map((typeConfig) => (
              <GoalTypeCard
                key={typeConfig.id}
                typeConfig={typeConfig}
                goal={goalsByType[typeConfig.id] || null}
                onEnsureGoal={ensureGoal}
                onSimulate={(id) => simulateGoal(id, Math.ceil((goalsByType[typeConfig.id]?.target_value || typeConfig.defaultTarget) * 0.1))}
                onCustomize={(id) => setCustomizeGoalId(id)}
                onDelete={(id) => deleteGoal(id)}
                isPro={isPro}
              />
            ))}
          </div>
        )}
      </div>

      {/* Customize panel */}
      <AnimatePresence>
        {customizeGoal && <GoalCustomizePanel goal={customizeGoal} onClose={() => setCustomizeGoalId(null)} />}
      </AnimatePresence>
    </AppLayout>
  );
};

export default GoalOverlays;
