import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Users, Share2, Star } from "lucide-react";

const goals = [
  { icon: Heart, label: "Likes Goal", title: "Like Milestone", current: 327, target: 500, color: "hsl(350,90%,55%)" },
  { icon: Users, label: "Followers Goal", title: "Follow Sprint", current: 156, target: 200, color: "hsl(160,100%,45%)" },
  { icon: Share2, label: "Shares Goal", title: "Share Challenge", current: 64, target: 100, color: "hsl(200,100%,55%)" },
  { icon: Star, label: "Stars Goal", title: "Star Rush", current: 782, target: 1000, color: "hsl(45,100%,55%)" },
];

const AnimatedNumber = ({ value }: { value: number }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.5, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
};

const GoalProgressOverlay = () => {
  const [goalIndex, setGoalIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGoalIndex((prev) => (prev + 1) % goals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goal = goals[goalIndex];
  const Icon = goal.icon;
  const pct = Math.round((goal.current / goal.target) * 100);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        key={goalIndex}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[340px]"
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-[1px] rounded-2xl blur-[1px]"
          style={{
            background: `linear-gradient(135deg, ${goal.color}40, ${goal.color}08)`,
          }}
        />

        <div className="relative rounded-2xl bg-[rgba(0,0,0,0.75)] backdrop-blur-xl border border-white/[0.06] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${goal.color}18` }}
              >
                <Icon size={16} style={{ color: goal.color }} />
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{goal.label}</p>
                <p className="text-[13px] text-white font-semibold">{goal.title}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-white">{pct}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)`,
                boxShadow: `0 0 20px ${goal.color}40`,
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)",
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
            </motion.div>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-[12px] text-white/50 font-medium">
              <AnimatedNumber value={goal.current} /> / {goal.target.toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 font-medium">
              {goal.target - goal.current} remaining
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalProgressOverlay;
