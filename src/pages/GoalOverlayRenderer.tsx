import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface GoalData {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  style_preset: string;
  on_complete_action: string | null;
  custom_config: Record<string, unknown> | null;
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

/* ── Confetti celebration ── */
const Confetti = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
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

/* ── Fireworks celebration ── */
const Fireworks = () => {
  const bursts = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    y: 20 + Math.random() * 40,
    delay: i * 0.3,
    color: [`hsl(350 90% 55%)`, `hsl(45 100% 55%)`, `hsl(160 100% 45%)`, `hsl(280 100% 65%)`, `hsl(200 100% 55%)`][i % 5],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bursts.map(b => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: 8, height: 8, background: b.color }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 8, 0], opacity: [1, 0.8, 0] }}
          transition={{ duration: 1.2, delay: b.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

/* ── Progress pulse effect ── */
const ProgressPulse = ({ color }: { color: string }) => (
  <motion.div
    className="absolute inset-0 rounded-2xl pointer-events-none"
    style={{ border: `2px solid ${color}`, opacity: 0 }}
    animate={{ opacity: [0, 0.6, 0], scale: [1, 1.03, 1] }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  />
);

/* ── Style engine ── */
const getStyleConfig = (preset: string, customConfig?: Record<string, unknown> | null) => {
  const customColor = customConfig?.primary_color as string | undefined;
  const glow = ((customConfig?.glow_intensity as number) ?? 50) / 100;

  const presets: Record<string, { gradient: string; glow: string; border: string }> = {
    glass: {
      gradient: "linear-gradient(90deg, hsl(160 100% 45%), hsl(180 100% 42%))",
      glow: `0 0 ${15 * glow}px hsl(160 100% 45% / ${0.3 * glow})`,
      border: "rgba(255,255,255,0.06)",
    },
    neon: {
      gradient: "linear-gradient(90deg, hsl(160 100% 45%), hsl(200 100% 55%))",
      glow: `0 0 ${25 * glow}px hsl(160 100% 45% / ${0.5 * glow}), 0 0 ${50 * glow}px hsl(160 100% 45% / ${0.2 * glow})`,
      border: "hsl(160 100% 45% / 0.15)",
    },
    tiktok: {
      gradient: "linear-gradient(90deg, hsl(174 100% 54%), hsl(350 99% 57%))",
      glow: `0 0 ${20 * glow}px hsl(174 100% 54% / ${0.4 * glow})`,
      border: "hsl(174 100% 54% / 0.12)",
    },
    gradient: {
      gradient: "linear-gradient(90deg, hsl(280 100% 65%), hsl(350 90% 55%))",
      glow: `0 0 ${20 * glow}px hsl(280 100% 65% / ${0.4 * glow})`,
      border: "hsl(280 100% 65% / 0.12)",
    },
    minimal: {
      gradient: "linear-gradient(90deg, hsl(0 0% 70%), hsl(0 0% 90%))",
      glow: "none",
      border: "rgba(255,255,255,0.08)",
    },
    cyber: {
      gradient: "linear-gradient(90deg, hsl(180 100% 50%), hsl(260 100% 65%))",
      glow: `0 0 ${30 * glow}px hsl(180 100% 50% / ${0.5 * glow}), 0 0 ${60 * glow}px hsl(260 100% 65% / ${0.2 * glow})`,
      border: "hsl(180 100% 50% / 0.15)",
    },
    flame: {
      gradient: "linear-gradient(90deg, hsl(30 100% 50%), hsl(0 100% 50%), hsl(45 100% 55%))",
      glow: `0 0 ${25 * glow}px hsl(30 100% 50% / ${0.5 * glow})`,
      border: "hsl(30 100% 50% / 0.15)",
    },
    ice: {
      gradient: "linear-gradient(90deg, hsl(190 100% 70%), hsl(210 100% 80%), hsl(200 60% 90%))",
      glow: `0 0 ${20 * glow}px hsl(190 100% 70% / ${0.4 * glow})`,
      border: "hsl(190 100% 70% / 0.12)",
    },
    festive: {
      gradient: "linear-gradient(90deg, hsl(0 80% 50%), hsl(120 80% 40%), hsl(0 80% 50%))",
      glow: `0 0 ${20 * glow}px hsl(0 80% 50% / ${0.3 * glow})`,
      border: "hsl(0 80% 50% / 0.12)",
    },
    rgb: {
      gradient: "linear-gradient(90deg, hsl(0 100% 50%), hsl(120 100% 50%), hsl(240 100% 50%), hsl(0 100% 50%))",
      glow: `0 0 ${25 * glow}px hsl(280 100% 60% / ${0.4 * glow})`,
      border: "hsl(280 100% 60% / 0.12)",
    },
  };

  const base = presets[preset] || presets.glass;

  // Override gradient with custom color if set
  if (customColor && preset !== "rgb") {
    return {
      ...base,
      gradient: `linear-gradient(90deg, ${customColor}, ${customColor}cc)`,
      glow: `0 0 ${20 * glow}px ${customColor}66`,
    };
  }

  return base;
};

const GoalOverlayRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [connected, setConnected] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const prevValue = useRef(0);

  // Read URL query param overrides for live preview in customize panel
  const urlOverrides = useMemo(() => {
    if (typeof window === "undefined") return {} as Record<string, string>;
    const params = new URLSearchParams(window.location.search);
    const o: Record<string, string> = {};
    params.forEach((v, k) => { o[k] = v; });
    return o;
  }, []);

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

  // Realtime subscription + polling fallback
  useEffect(() => {
    if (!publicToken) return;

    const pollGoal = async () => {
      const { data } = await supabase
        .from("goals" as any)
        .select("*")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        const g = data as unknown as GoalData;
        setGoal(prev => {
          if (!prev || g.current_value !== prev.current_value || g.target_value !== prev.target_value || g.style_preset !== prev.style_preset || JSON.stringify(g.custom_config) !== JSON.stringify(prev.custom_config)) {
            // Trigger progress pulse
            if (prev && g.current_value > prev.current_value) {
              setShowPulse(true);
              setTimeout(() => setShowPulse(false), 700);
            }
            if (prev && g.current_value >= g.target_value && prevValue.current < g.target_value) {
              setShowComplete(true);
              setTimeout(() => setShowComplete(false), 5000);
            }
            prevValue.current = g.current_value;
            return g;
          }
          return prev;
        });
      }
    };
    const pollInterval = setInterval(pollGoal, 3000);

    const channel = supabase
      .channel(`goal-${publicToken}`)
      .on("broadcast", { event: "goal_update" }, (msg) => {
        const payload = msg.payload as { current_value: number; target_value: number };
        setGoal(prev => {
          if (prev) {
            if (payload.current_value > prev.current_value) {
              setShowPulse(true);
              setTimeout(() => setShowPulse(false), 700);
            }
            return { ...prev, current_value: payload.current_value, target_value: payload.target_value };
          }
          return prev;
        });
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
      });

    const dbChannel = supabase
      .channel(`goal-db-${publicToken}`)
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "goals", filter: `public_token=eq.${publicToken}` },
        (payload: any) => {
          if (payload.new) {
            const n = payload.new as GoalData;
            setGoal(prev => {
              if (prev && n.current_value > prev.current_value) {
                setShowPulse(true);
                setTimeout(() => setShowPulse(false), 700);
              }
              if (n.current_value >= n.target_value && prevValue.current < n.target_value) {
                setShowComplete(true);
                setTimeout(() => setShowComplete(false), 5000);
              }
              prevValue.current = n.current_value;
              return prev ? { ...prev, ...n } : n;
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
    };
  }, [publicToken]);

  // Apply URL overrides from customize panel for live preview
  const effectiveGoal = useMemo(() => {
    if (!goal) return null;
    const g = { ...goal };
    if (urlOverrides.t) g.style_preset = urlOverrides.t;
    if (urlOverrides.title) g.title = urlOverrides.title;
    if (urlOverrides.target) g.target_value = Number(urlOverrides.target) || g.target_value;
    if (urlOverrides.on_complete) g.on_complete_action = urlOverrides.on_complete;
    const cc = { ...(g.custom_config || {}) };
    if (urlOverrides.primary_color) cc.primary_color = urlOverrides.primary_color;
    if (urlOverrides.glow_intensity) cc.glow_intensity = Number(urlOverrides.glow_intensity);
    if (urlOverrides.font_family) cc.font_family = urlOverrides.font_family;
    if (urlOverrides.bg_style) cc.bg_style = urlOverrides.bg_style;
    if (urlOverrides.progress_animation) cc.progress_animation = urlOverrides.progress_animation;
    g.custom_config = cc;
    return g;
  }, [goal, urlOverrides]);

  if (!effectiveGoal) {
    return (
      <div className="w-screen h-screen bg-transparent flex items-center justify-center">
        <p className="text-white/20 text-xs font-mono">Loading goal...</p>
      </div>
    );
  }

  const pct = effectiveGoal.target_value > 0 ? Math.min((effectiveGoal.current_value / effectiveGoal.target_value) * 100, 100) : 0;
  const isComplete = pct >= 100;
  const styleConfig = getStyleConfig(effectiveGoal.style_preset, effectiveGoal.custom_config);
  const customConfig = effectiveGoal.custom_config || {};
  const fontFamily = (customConfig.font_family as string) || "Inter, sans-serif";
  const progressAnim = (customConfig.progress_animation as string) || "none";
  const bgStyle = (customConfig.bg_style as string) || "glass";
  const layout = (customConfig.layout as string) || "card";

  const getBgStyles = () => {
    switch (bgStyle) {
      case "transparent": return { background: "transparent", border: "none", backdropFilter: "none" };
      case "floating": return { background: "rgba(0,0,0,0.88)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" };
      case "blurred": return { background: "rgba(0,0,0,0.4)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(40px)" };
      default: return { background: "rgba(0,0,0,0.78)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(20px)" };
    }
  };

  const completionType = effectiveGoal.on_complete_action || "confetti";

  /* ── Wide Bar Layout ── */
  if (layout === "wide_bar") {
    const pctColor = styleConfig.gradient.includes("hsl") ? "hsl(160 100% 45%)" : (customConfig.primary_color as string) || "hsl(160 100% 45%)";
    return (
      <div className="w-screen h-screen bg-transparent relative overflow-hidden flex items-end justify-center pb-8">
        {/* Connection indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
        </div>

        {/* Completion celebration */}
        <AnimatePresence>
          {showComplete && completionType !== "none" && (
            completionType === "fireworks" || completionType === "explosion"
              ? <Fireworks />
              : <Confetti />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full px-6"
          style={{ fontFamily }}
        >
          {/* Title + Percentage */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-white/90">{effectiveGoal.title}</span>
            <span className="text-lg font-bold" style={{ color: pctColor }}>
              {Math.round(pct)}%
            </span>
          </div>

          {/* Full-width progress bar */}
          <div className="h-6 rounded-full bg-white/[0.08] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: styleConfig.gradient, boxShadow: styleConfig.glow }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
              {effectiveGoal.style_preset === "rgb" && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", backgroundSize: "200% 100%" }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>

          {/* Counter centered */}
          <div className="text-center mt-2">
            <p className="text-sm text-white/50 font-medium">
              <AnimatedNumber value={effectiveGoal.current_value} /> / {effectiveGoal.target_value.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Card Layout (default) ── */
  return (
    <div className="w-screen h-screen bg-transparent relative overflow-hidden flex items-center justify-center">
      {/* Connection indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {showComplete && completionType !== "none" && (
          completionType === "fireworks" || completionType === "explosion"
            ? <Fireworks />
            : <Confetti />
        )}
      </AnimatePresence>

      {/* Goal card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: showPulse && progressAnim === "shake" ? [1, 1.02, 0.98, 1] : 1,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-[480px] relative"
        style={{ fontFamily }}
      >
        {/* Glow ring on complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0, 0.5, 0.3], scale: [0.98, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-[2px] rounded-2xl"
              style={{ background: styleConfig.gradient, filter: "blur(8px)" }}
            />
          )}
        </AnimatePresence>

        {/* Progress pulse overlay */}
        <AnimatePresence>
          {showPulse && progressAnim === "pulse" && (
            <ProgressPulse color={styleConfig.glow.includes("none") ? "rgba(255,255,255,0.3)" : "hsl(160 100% 45%)"} />
          )}
          {showPulse && progressAnim === "glow_burst" && (
            <motion.div
              className="absolute -inset-[3px] rounded-2xl pointer-events-none"
              style={{ background: styleConfig.gradient, filter: "blur(12px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>

        {/* Outer glow */}
        <div
          className="absolute -inset-[1px] rounded-2xl blur-[1px]"
          style={{ background: `linear-gradient(135deg, ${styleConfig.border}, transparent)` }}
        />

        <div className="relative rounded-2xl p-6" style={getBgStyles()}>
          {/* Title */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight">{effectiveGoal.title}</h2>
            <span className="text-2xl font-bold text-white">{Math.round(pct)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-5 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: styleConfig.gradient,
                boxShadow: styleConfig.glow,
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
              {/* RGB cycling for rgb preset */}
              {effectiveGoal.style_preset === "rgb" && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", backgroundSize: "200% 100%" }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-base text-white/60 font-semibold">
              <AnimatedNumber value={effectiveGoal.current_value} /> / {effectiveGoal.target_value.toLocaleString()}
            </p>
            <p className="text-sm text-white/30">
              {effectiveGoal.target_value - effectiveGoal.current_value > 0
                ? `${(effectiveGoal.target_value - effectiveGoal.current_value).toLocaleString()} remaining`
                : "🎉 Complete!"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalOverlayRenderer;
