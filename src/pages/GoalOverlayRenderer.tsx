import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

interface GoalData {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  style_preset: string;
  on_complete_action: string | null;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
};

const Confetti = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: [`hsl(160 100% 45%)`, `hsl(350 90% 55%)`, `hsl(280 100% 65%)`, `hsl(45 100% 55%)`, `hsl(200 100% 55%)`][i % 5],
    delay: Math.random() * 0.5,
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: "-5%", width: p.size, height: p.size, background: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "120vh", opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
};

const GoalOverlayRenderer = () => {
  const { publicToken } = useParams();
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [connected, setConnected] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const prevValue = useRef(0);

  // Fetch initial goal data
  useEffect(() => {
    if (!publicToken) return;

    const fetchGoal = async () => {
      const { data, error } = await supabase
        .from("goals" as any)
        .select("*")
        .eq("public_token", publicToken)
        .single();

      if (!error && data) {
        const g = data as unknown as GoalData;
        setGoal(g);
        prevValue.current = g.current_value;
      }
    };

    fetchGoal();
  }, [publicToken]);

  // Realtime subscription
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`goal-${publicToken}`)
      .on("broadcast", { event: "goal_update" }, (msg) => {
        const payload = msg.payload as { current_value: number; target_value: number };
        setGoal(prev => prev ? { ...prev, current_value: payload.current_value, target_value: payload.target_value } : prev);
      })
      .on("broadcast", { event: "goal_complete" }, () => {
        setShowComplete(true);
        setTimeout(() => setShowComplete(false), 5000);
      })
      .on("broadcast", { event: "reset_goal" }, () => {
        setGoal(prev => prev ? { ...prev, current_value: 0 } : prev);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
        setReconnecting(false);
      });

    // Also listen for DB changes
    const dbChannel = supabase
      .channel(`goal-db-${publicToken}`)
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "goals", filter: `public_token=eq.${publicToken}` },
        (payload: any) => {
          if (payload.new) {
            const n = payload.new as GoalData;
            setGoal(prev => prev ? { ...prev, ...n } : n);
            if (n.current_value >= n.target_value && prevValue.current < n.target_value) {
              setShowComplete(true);
              setTimeout(() => setShowComplete(false), 5000);
            }
            prevValue.current = n.current_value;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
    };
  }, [publicToken]);

  if (!goal) {
    return (
      <div className="w-screen h-screen bg-transparent flex items-center justify-center">
        <p className="text-white/20 text-xs font-mono">Loading goal...</p>
      </div>
    );
  }

  const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0;
  const isComplete = pct >= 100;

  // Style presets
  const getBarGradient = () => {
    switch (goal.style_preset) {
      case "neon": return "linear-gradient(90deg, hsl(160 100% 45%), hsl(200 100% 55%))";
      case "tiktok": return "linear-gradient(90deg, hsl(174 100% 54%), hsl(350 99% 57%))";
      case "gradient": return "linear-gradient(90deg, hsl(280 100% 65%), hsl(350 90% 55%))";
      case "minimal": return "linear-gradient(90deg, hsl(0 0% 70%), hsl(0 0% 90%))";
      default: return "linear-gradient(90deg, hsl(160 100% 45%), hsl(180 100% 42%))";
    }
  };

  const getBarGlow = () => {
    switch (goal.style_preset) {
      case "neon": return "0 0 25px hsl(160 100% 45% / 0.5), 0 0 50px hsl(160 100% 45% / 0.2)";
      case "tiktok": return "0 0 20px hsl(174 100% 54% / 0.4)";
      case "gradient": return "0 0 20px hsl(280 100% 65% / 0.4)";
      case "minimal": return "none";
      default: return "0 0 15px hsl(160 100% 45% / 0.3)";
    }
  };

  return (
    <div className="w-screen h-screen bg-transparent relative overflow-hidden flex items-center justify-center">
      {/* Reconnecting overlay */}
      {reconnecting && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium z-10">
          Reconnecting...
        </div>
      )}

      {/* Connection indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      {/* Completion confetti */}
      <AnimatePresence>
        {showComplete && goal.on_complete_action !== "none" && <Confetti />}
      </AnimatePresence>

      {/* Goal card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-[420px] relative"
      >
        {/* Glow ring on complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0, 0.5, 0.3], scale: [0.98, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-[2px] rounded-2xl"
              style={{ background: getBarGradient(), filter: "blur(8px)" }}
            />
          )}
        </AnimatePresence>

        {/* Outer glow */}
        <div
          className="absolute -inset-[1px] rounded-2xl blur-[1px]"
          style={{ background: `linear-gradient(135deg, hsl(160 100% 45% / 0.15), hsl(160 100% 45% / 0.03))` }}
        />

        <div className="relative rounded-2xl bg-[rgba(0,0,0,0.78)] backdrop-blur-xl border border-white/[0.06] p-6">
          {/* Title */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white tracking-tight">{goal.title}</h2>
            <span className="text-xl font-bold text-white">{Math.round(pct)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-4 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: getBarGradient(),
                boxShadow: getBarGlow(),
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
            </motion.div>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-white/60 font-medium">
              <AnimatedNumber value={goal.current_value} /> / {goal.target_value.toLocaleString()}
            </p>
            <p className="text-xs text-white/30">
              {goal.target_value - goal.current_value > 0
                ? `${(goal.target_value - goal.current_value).toLocaleString()} remaining`
                : "🎉 Complete!"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Idle watermark */}
      {!goal && (
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/5 text-[9px] font-mono">TikUp Goal Overlay</p>
      )}
    </div>
  );
};

export default GoalOverlayRenderer;
