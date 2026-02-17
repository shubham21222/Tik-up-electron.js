import AppLayout from "@/components/AppLayout";
import { Crown, Check, X, BarChart3, ArrowRight, Loader2, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSubscription, TIKUP_PRO, FEATURE_COMPARISON } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get started",
    highlight: false,
    planKey: "free" as const,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious streamers who want it all",
    highlight: true,
    badge: "Most Popular",
    planKey: "pro" as const,
  },
];

const Pro = () => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { isPro, isAdmin, loading, refetch } = useSubscription();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Welcome to TikUp Pro! 🎉");
      refetch();
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled");
    }
  }, [searchParams, refetch]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: TIKUP_PRO.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
    setCheckoutLoading(false);
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open portal");
    }
    setPortalLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={32} className="text-secondary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">
              TikUp <span className="text-gradient-accent">Pro</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Same features. More power. Unlock unlimited access and priority everything.
          </p>

          {isAdmin && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/30">
              <Crown size={14} className="text-secondary" />
              <span className="text-sm font-medium text-secondary">Owner Account — All Features Unlocked</span>
            </div>
          )}

          {isPro && !isAdmin && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
                <Check size={14} /> Active Pro Subscription
              </span>
              <button
                onClick={handleManage}
                disabled={portalLoading}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                Manage Subscription
              </button>
            </div>
          )}
        </div>

        {/* Plans Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = (isPro && plan.planKey === "pro") || (!isPro && plan.planKey === "free");
            return (
              <div
                key={plan.name}
                className={cn(
                  "rounded-xl border bg-card p-6 flex flex-col relative",
                  plan.highlight ? "border-secondary/40 glow-primary" : "border-border",
                  isCurrent && "ring-2 ring-primary/30"
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                    {plan.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                    Your Plan
                  </span>
                )}
                <h3 className="font-heading font-bold text-lg text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4 mb-5">
                  <span className="text-3xl font-heading font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>

                {plan.planKey === "pro" && !isPro && (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || loading}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50 mt-auto"
                  >
                    {checkoutLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>Upgrade to Pro <ArrowRight size={14} /></>
                    )}
                  </button>
                )}
                {plan.planKey === "free" && (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-sm text-center bg-muted text-muted-foreground cursor-not-allowed mt-auto">
                    {isCurrent ? "Current Plan" : "Free Tier"}
                  </div>
                )}
                {plan.planKey === "pro" && isPro && (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-sm text-center bg-primary/10 text-primary mt-auto">
                    ✓ Active
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unified Feature Comparison Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <BarChart3 size={16} className="text-secondary" /> Full Feature Comparison
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Both plans include every feature — Pro unlocks unlimited & premium access
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center px-5 py-3 text-muted-foreground font-medium">Free</th>
                  <th className="text-center px-5 py-3 text-secondary font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{row.label}</td>
                    <td className="text-center px-5 py-3">
                      {typeof row.free === "boolean"
                        ? row.free
                          ? <Check size={16} className="inline text-primary" />
                          : <X size={16} className="inline text-muted-foreground/40" />
                        : <span className="text-muted-foreground">{row.free}</span>}
                    </td>
                    <td className="text-center px-5 py-3">
                      {typeof row.pro === "boolean"
                        ? row.pro
                          ? <Check size={16} className="inline text-secondary" />
                          : <X size={16} className="inline text-muted-foreground/40" />
                        : <span className="font-semibold text-foreground">{row.pro}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Pro;
