import { motion } from "framer-motion";
import { Crown, Lock, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

/**
 * Wraps content that requires Pro. If user is not Pro,
 * shows a sleek upgrade overlay instead of the children.
 */
const ProGate = ({ children, feature }: ProGateProps) => {
  const { isPro, loading } = useSubscription();

  if (loading) return <>{children}</>;
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred / dimmed content behind */}
      <div className="pointer-events-none select-none opacity-40 blur-[2px]">
        {children}
      </div>

      {/* Upgrade overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <div
          className="relative rounded-2xl p-8 max-w-sm w-full text-center border backdrop-blur-xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(280 30% 8% / 0.95) 100%)",
            borderColor: "hsl(280 100% 65% / 0.25)",
            boxShadow: "0 0 60px hsl(280 100% 60% / 0.12), 0 8px 32px hsl(0 0% 0% / 0.4)",
          }}
        >
          {/* Glow accent */}
          <div
            className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full"
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
            Upgrade to <span style={{ color: "hsl(280 100% 70%)" }} className="font-semibold">TikUp Pro</span> to unlock this feature and supercharge your streams.
          </p>

          <div className="space-y-2 text-left mb-6">
            {["Unlimited overlays & alerts", "Advanced animations & effects", "Priority support"].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap size={12} style={{ color: "hsl(280 100% 65%)" }} />
                <span>{perk}</span>
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
        </div>
      </motion.div>
    </div>
  );
};

export default ProGate;
