import { motion } from "framer-motion";
import { X, Sliders, Palette, Type, Sparkles, PartyPopper } from "lucide-react";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import GoalPreviewInline from "./GoalPreviewInline";

const STYLE_PRESETS = ["glass", "neon", "minimal", "gradient", "tiktok", "cyber", "flame", "ice", "festive", "rgb"];
const COMPLETION_ACTIONS = ["none", "confetti", "glow_pulse", "fireworks", "explosion", "sound"];
const PROGRESS_ANIMATIONS = ["none", "pulse", "glow_burst", "shake", "particles"];
const FONT_OPTIONS = ["Inter", "Space Grotesk", "Orbitron", "Rajdhani", "Poppins", "Montserrat"];
const BG_OPTIONS = [
  { label: "Transparent", value: "transparent" },
  { label: "Glass Card", value: "glass" },
  { label: "Floating Card", value: "floating" },
  { label: "Blurred Glass", value: "blurred" },
];

interface Props {
  goal: Goal;
  onClose: () => void;
}

const GoalCustomizePanel = ({ goal, onClose }: Props) => {
  const { updateGoal } = useGoals();
  const { isPro } = useSubscription();

  const customConfig = (goal.custom_config || {}) as Record<string, unknown>;

  const [style, setStyle] = useState(goal.style_preset);
  const [action, setAction] = useState(goal.on_complete_action || "none");
  const [autoReset, setAutoReset] = useState(goal.auto_reset);
  const [milestones, setMilestones] = useState(goal.milestone_alerts);
  const [title, setTitle] = useState(goal.title);
  const [target, setTarget] = useState(goal.target_value);

  // Custom config fields
  const [primaryColor, setPrimaryColor] = useState((customConfig.primary_color as string) || "#00e676");
  const [glowIntensity, setGlowIntensity] = useState((customConfig.glow_intensity as number) || 50);
  const [fontFamily, setFontFamily] = useState((customConfig.font_family as string) || "Inter");
  const [progressAnimation, setProgressAnimation] = useState((customConfig.progress_animation as string) || "none");
  const [bgStyle, setBgStyle] = useState((customConfig.bg_style as string) || "glass");

  const save = async () => {
    await updateGoal(goal.id, {
      style_preset: style,
      on_complete_action: action,
      auto_reset: autoReset,
      milestone_alerts: milestones,
      title,
      target_value: target,
      custom_config: {
        primary_color: primaryColor,
        glow_intensity: glowIntensity,
        font_family: fontFamily,
        progress_animation: progressAnimation,
        bg_style: bgStyle,
      },
    });
    onClose();
  };

  const isProStyle = (idx: number) => idx >= 5 && !isPro;

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
        className="w-full max-w-lg rounded-2xl p-[1px] max-h-[90vh] overflow-y-auto"
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

          {/* Live Preview — updates instantly with every setting change */}
          <div className="mb-5 rounded-xl overflow-hidden border border-border/20" style={{ background: "rgba(0,0,0,0.6)" }}>
            <GoalPreviewInline
              title={title}
              currentValue={goal.current_value}
              targetValue={target}
              stylePreset={style}
              customConfig={{
                primary_color: primaryColor,
                glow_intensity: glowIntensity,
                font_family: fontFamily,
                bg_style: bgStyle,
                progress_animation: progressAnimation,
              }}
            />
          </div>

          <div className="space-y-5">
            {/* Title + Target */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Target Value</label>
                <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} min={1}
                  className="w-full bg-muted/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
              </div>
            </div>

            {/* Style Preset */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold flex items-center gap-1.5">
                <Palette size={10} /> Style Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((s, idx) => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 relative ${
                      style === s ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}>
                    {s}
                    {isProStyle(idx) && <span className="ml-1 text-[7px] align-super" style={{ color: "hsl(350 90% 60%)" }}>★</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold flex items-center gap-1.5">
                <Palette size={10} /> Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border/40 cursor-pointer bg-transparent" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-muted/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground font-mono outline-none focus:border-primary/40 transition-colors" />
              </div>
            </div>

            {/* Glow Intensity */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">
                Glow Intensity: {glowIntensity}%
              </label>
              <input type="range" min={0} max={100} value={glowIntensity} onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full accent-primary h-1.5" />
            </div>

            {/* Font Family */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold flex items-center gap-1.5">
                <Type size={10} /> Font Family
              </label>
              <div className="flex flex-wrap gap-2">
                {FONT_OPTIONS.map(f => (
                  <button key={f} onClick={() => setFontFamily(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      fontFamily === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}
                    style={{ fontFamily: f }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">Background</label>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map(bg => (
                  <button key={bg.value} onClick={() => setBgStyle(bg.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      bgStyle === bg.value ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}>
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Animation */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold flex items-center gap-1.5">
                <Sparkles size={10} /> On Progress Increase
              </label>
              <div className="flex flex-wrap gap-2">
                {PROGRESS_ANIMATIONS.map(a => (
                  <button key={a} onClick={() => setProgressAnimation(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                      progressAnimation === a ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-border/40 hover:border-border/60"
                    }`}>
                    {a.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Action */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold flex items-center gap-1.5">
                <PartyPopper size={10} /> On Complete
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPLETION_ACTIONS.map(a => (
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
