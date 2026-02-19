import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

/* ── Style engine (shared with GoalOverlayRenderer) ── */
export const getStyleConfig = (preset: string, customConfig?: Record<string, unknown> | null) => {
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

  if (customColor && preset !== "rgb") {
    return {
      ...base,
      gradient: `linear-gradient(90deg, ${customColor}, ${customColor}cc)`,
      glow: `0 0 ${20 * glow}px ${customColor}66`,
    };
  }

  return base;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
};

interface Props {
  title: string;
  currentValue: number;
  targetValue: number;
  stylePreset: string;
  customConfig: Record<string, unknown>;
}

/* ── Wide Bar Layout ── */
const WideBarLayout = ({ title, currentValue, targetValue, stylePreset, customConfig }: Props) => {
  const pct = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
  const styleConfig = getStyleConfig(stylePreset, customConfig);
  const fontFamily = (customConfig.font_family as string) || "Inter, sans-serif";

  return (
    <div className="w-full px-2 py-3" style={{ fontFamily }}>
      {/* Title + Percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white/80">{title}</span>
        <span className="text-xs font-bold" style={{ color: styleConfig.gradient.includes("hsl") ? "hsl(160 100% 45%)" : (customConfig.primary_color as string) || "hsl(160 100% 45%)" }}>
          {Math.round(pct)}%
        </span>
      </div>

      {/* Full-width progress bar */}
      <div className="h-4 rounded-full bg-white/[0.08] overflow-hidden relative">
        <motion.div
          key={`${stylePreset}-${customConfig.primary_color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: styleConfig.gradient, boxShadow: styleConfig.glow }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
          />
        </motion.div>
      </div>

      {/* Counter centered below */}
      <div className="text-center mt-1.5">
        <p className="text-[10px] text-white/40 font-medium">
          <AnimatedNumber value={currentValue} /> / {targetValue.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

/* ── Card Layout (original) ── */
const CardLayout = ({ title, currentValue, targetValue, stylePreset, customConfig }: Props) => {
  const pct = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
  const styleConfig = getStyleConfig(stylePreset, customConfig);
  const fontFamily = (customConfig.font_family as string) || "Inter, sans-serif";
  const bgStyle = (customConfig.bg_style as string) || "glass";

  const getBgStyles = () => {
    switch (bgStyle) {
      case "transparent": return { background: "transparent", border: "none", backdropFilter: "none" };
      case "floating": return { background: "rgba(0,0,0,0.88)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" };
      case "blurred": return { background: "rgba(0,0,0,0.4)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(40px)" };
      default: return { background: "rgba(0,0,0,0.78)", border: `1px solid ${styleConfig.border}`, backdropFilter: "blur(20px)" };
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-3" style={{ fontFamily }}>
      <div className="w-full max-w-[360px] relative">
        <div
          className="absolute -inset-[1px] rounded-xl blur-[1px]"
          style={{ background: `linear-gradient(135deg, ${styleConfig.border}, transparent)` }}
        />
        <div className="relative rounded-xl p-4" style={getBgStyles()}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
            <span className="text-base font-bold text-white">{Math.round(pct)}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              key={`${stylePreset}-${customConfig.primary_color}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: styleConfig.gradient, boxShadow: styleConfig.glow }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-white/60 font-medium">
              <AnimatedNumber value={currentValue} /> / {targetValue.toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30">
              {targetValue - currentValue > 0
                ? `${(targetValue - currentValue).toLocaleString()} remaining`
                : "🎉 Complete!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalPreviewInline = (props: Props) => {
  const layout = (props.customConfig.layout as string) || "card";
  return layout === "wide_bar" ? <WideBarLayout {...props} /> : <CardLayout {...props} />;
};

export default GoalPreviewInline;