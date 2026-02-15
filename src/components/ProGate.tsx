import { motion } from "framer-motion";
import { Crown, Lock, Sparkles, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

const comparisonRows = [
  { label: "Overlays", free: "5", pro: "Unlimited" },
  { label: "Alert styles", free: "Basic", pro: "All styles" },
  { label: "Text-to-Speech", free: false, pro: true },
  { label: "Custom CSS", free: false, pro: true },
  { label: "Custom branding", free: false, pro: true },
  { label: "Sound alerts", free: "10", pro: "Unlimited" },
  { label: "Chat commands", free: "5", pro: "Unlimited" },
  { label: "Advanced analytics", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
];

const ProGate = ({ children, feature }: ProGateProps) => {
  const { isPro, loading } = useSubscription();

  if (loading) return <>{children}</>;
  if (isPro) return <>{children}</>;

  return (
    <>
      {/* Blurred content behind */}
      <div className="pointer-events-none select-none opacity-30 blur-[3px]">
        {children}
      </div>

      {/* Fixed centered modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative rounded-2xl p-8 max-w-lg w-full mx-4 text-center border overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(280 30% 6% / 0.98) 100%)",
            borderColor: "hsl(280 100% 65% / 0.25)",
            boxShadow: "0 0 80px hsl(280 100% 60% / 0.15), 0 8px 40px hsl(0 0% 0% / 0.5)",
          }}
        >
          {/* Top glow */}
          <div
            className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(280 100% 65%), transparent)" }}
          />

          <motion.div
            className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(280 100% 65% / 0.2), hsl(280 100% 55% / 0.1))",
              border: "1px solid hsl(280 100% 65% / 0.3)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px hsl(280 100% 65% / 0.15)",
                "0 0 40px hsl(280 100% 65% / 0.25)",
                "0 0 20px hsl(280 100% 65% / 0.15)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock size={24} style={{ color: "hsl(280 100% 70%)" }} />
          </motion.div>

          <h3 className="text-lg font-heading font-bold text-foreground mb-1">
            {feature ? `${feature} is a Pro Feature` : "Pro Feature"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Upgrade to <span style={{ color: "hsl(280 100% 70%)" }} className="font-semibold">TikUp Pro</span> to unlock this and supercharge your streams.
          </p>

          {/* Comparison table */}
          <div className="rounded-xl overflow-hidden border mb-6" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            {/* Header */}
            <div className="grid grid-cols-3 text-[11px] font-bold uppercase tracking-wider px-4 py-2.5"
              style={{ background: "hsl(0 0% 100% / 0.03)" }}>
              <span className="text-left text-muted-foreground">Feature</span>
              <span className="text-center text-muted-foreground">Free</span>
              <span className="text-center" style={{ color: "hsl(280 100% 70%)" }}>Pro</span>
            </div>
            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div key={row.label} className="grid grid-cols-3 items-center px-4 py-2 text-xs"
                style={{ background: i % 2 === 0 ? "transparent" : "hsl(0 0% 100% / 0.015)", borderTop: "1px solid hsl(0 0% 100% / 0.04)" }}>
                <span className="text-left text-muted-foreground">{row.label}</span>
                <span className="flex justify-center">
                  {typeof row.free === "boolean"
                    ? row.free ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-muted-foreground/40" />
                    : <span className="text-muted-foreground/60">{row.free}</span>}
                </span>
                <span className="flex justify-center">
                  {typeof row.pro === "boolean"
                    ? row.pro ? <Check size={14} style={{ color: "hsl(280 100% 70%)" }} /> : <X size={14} />
                    : <span className="font-semibold text-foreground">{row.pro}</span>}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/pro"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, hsl(280 100% 60%), hsl(280 80% 50%))",
              boxShadow: "0 4px 20px hsl(280 100% 55% / 0.35)",
            }}
          >
            <Crown size={16} />
            Upgrade to Pro — $9.99/mo
          </Link>

          <p className="text-[10px] text-muted-foreground/50 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={10} /> Cancel anytime
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default ProGate;
