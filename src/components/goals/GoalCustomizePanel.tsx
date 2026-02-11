import { motion } from "framer-motion";
import { X, Sliders } from "lucide-react";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useState } from "react";

const stylePresets = ["glass", "neon", "minimal", "gradient", "tiktok"];
const completionActions = ["none", "confetti", "sound", "glow_pulse"];

interface Props {
  goal: Goal;
  onClose: () => void;
}

const GoalCustomizePanel = ({ goal, onClose }: Props) => {
  const { updateGoal } = useGoals();
  const [style, setStyle] = useState(goal.style_preset);
  const [action, setAction] = useState(goal.on_complete_action || "none");
  const [autoReset, setAutoReset] = useState(goal.auto_reset);
  const [milestones, setMilestones] = useState(goal.milestone_alerts);
  const [title, setTitle] = useState(goal.title);
  const [target, setTarget] = useState(goal.target_value);

  const save = async () => {
    await updateGoal(goal.id, {
      style_preset: style,
      on_complete_action: action,
      auto_reset: autoReset,
      milestone_alerts: milestones,
      title,
      target_value: target,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-[1px] max-h-[85vh] overflow-y-auto"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}
      >
        <div className="rounded-2xl p-6" style={{ background: "rgba(12,16,22,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-primary" />
              <h2 className="text-lg font-heading font-bold text-foreground">Customize Goal</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
            </div>

            {/* Target */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Target Value</label>
              <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} min={1}
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
            </div>

            {/* Style Preset */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">Style Preset</label>
              <div className="flex flex-wrap gap-2">
                {stylePresets.map(s => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                      style === s ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Action */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">On Complete</label>
              <div className="flex flex-wrap gap-2">
                {completionActions.map(a => (
                  <button key={a} onClick={() => setAction(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                      action === a ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}>
                    {a.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-reset after completion</p>
                  <p className="text-xs text-muted-foreground">Goal resets to 0 after reaching target</p>
                </div>
                <button onClick={() => setAutoReset(!autoReset)}
                  className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${autoReset ? "bg-primary/30" : "bg-muted/60"}`}>
                  <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${autoReset ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Milestone alerts</p>
                  <p className="text-xs text-muted-foreground">Notify at 25%, 50%, 75% progress</p>
                </div>
                <button onClick={() => setMilestones(!milestones)}
                  className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${milestones ? "bg-primary/30" : "bg-muted/60"}`}>
                  <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${milestones ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                </button>
              </div>
            </div>

            {/* Save */}
            <button onClick={save}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GoalCustomizePanel;
