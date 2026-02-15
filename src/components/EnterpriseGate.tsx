import { motion } from "framer-motion";
import { Crown, Lock, Zap, Sparkles, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgencies } from "@/hooks/use-agencies";
import { useSubscription } from "@/hooks/use-subscription";

interface EnterpriseGateProps {
  children: React.ReactNode;
  feature?: string;
}

/**
 * Wraps content that requires Enterprise access.
 * Shows upgrade overlay for users without an active agency (enterprise membership).
 */
const EnterpriseGate = ({ children, feature }: EnterpriseGateProps) => {
  const { agencies, loading: agenciesLoading } = useAgencies();
  const { isAdmin, loading: subLoading } = useSubscription();

  const loading = agenciesLoading || subLoading;
  const hasEnterprise = isAdmin || (agencies && agencies.length > 0);

  if (loading) return <>{children}</>;
  if (hasEnterprise) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[2px]">
        {children}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <div
          className="relative rounded-2xl p-8 max-w-sm w-full text-center border backdrop-blur-xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(160 30% 8% / 0.95) 100%)",
            borderColor: "hsl(160 100% 45% / 0.25)",
            boxShadow: "0 0 60px hsl(160 100% 45% / 0.12), 0 8px 32px hsl(0 0% 0% / 0.4)",
          }}
        >
          <div
            className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(160 100% 45%), transparent)" }}
          />

          <motion.div
            className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(160 100% 45% / 0.2), hsl(160 100% 35% / 0.1))",
              border: "1px solid hsl(160 100% 45% / 0.3)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px hsl(160 100% 45% / 0.15)",
                "0 0 40px hsl(160 100% 45% / 0.25)",
                "0 0 20px hsl(160 100% 45% / 0.15)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock size={24} style={{ color: "hsl(160 100% 45%)" }} />
          </motion.div>

          <h3 className="text-lg font-heading font-bold text-foreground mb-1">
            {feature ? `${feature} requires Enterprise` : "Enterprise Feature"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Contact sales to unlock <span style={{ color: "hsl(160 100% 45%)" }} className="font-semibold">Enterprise</span> access and manage agencies at scale.
          </p>

          <div className="space-y-2 text-left mb-6">
            {["Multi-agency management", "Whitelabel branding & custom domains", "Real-time monitoring & analytics"].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap size={12} style={{ color: "hsl(160 100% 45%)" }} />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <Link
            to="/pro"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, hsl(160 100% 40%), hsl(160 80% 30%))",
              boxShadow: "0 4px 20px hsl(160 100% 40% / 0.35)",
            }}
          >
            <Building2 size={16} />
            Contact Sales
          </Link>

          <p className="text-[10px] text-muted-foreground/50 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={10} /> Custom pricing for teams
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EnterpriseGate;
