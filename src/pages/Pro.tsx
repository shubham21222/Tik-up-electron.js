import AppLayout from "@/components/AppLayout";
import { Crown, Check, BarChart3, ArrowRight, Loader2, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSubscription, TIKUP_PRO } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic features",
    features: [
      "5 Overlay Widgets",
      "Basic TTS Voices",
      "Standard Sound Alerts",
      "Chat Overlay",
      "Community Support",
      "TikUp Watermark",
    ],
    highlight: false,
    planKey: "free" as const,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious streamers",
    features: [
      "Unlimited Overlays",
      "Premium TTS Voices",
      "Custom Sound Alerts",
      "Advanced Chat Moderation",
      "Priority Support",
      "No Watermark",
      "Custom Branding",
      "Advanced Analytics",
      "Premium Alert Animations",
      "Game Integrations",
    ],
    highlight: true,
    badge: "Most Popular",
    planKey: "pro" as const,
  },
];

const featureComparison = [
  { feature: "Overlay Widgets", free: "5", pro: "Unlimited" },
  { feature: "TTS Voices", free: "2", pro: "15+" },
  { feature: "Sound Alerts", free: "10", pro: "Unlimited" },
  { feature: "Chat Commands", free: "5", pro: "Unlimited" },
  { feature: "Alert Animations", free: "1 (TikUp Signature)", pro: "8+ Premium" },
  { feature: "Game Integrations", free: "—", pro: "✓" },
  { feature: "OBS Control", free: "—", pro: "✓" },
  { feature: "Analytics", free: "Basic", pro: "Advanced" },
  { feature: "Custom Branding", free: "—", pro: "✓" },
  { feature: "Support", free: "Community", pro: "Priority" },
];

const Pro = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
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
            Unlock the full power of TikUp. Premium overlays, advanced analytics, and priority support.
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

        {/* Plans */}
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
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className={plan.highlight ? "text-secondary" : "text-primary"} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.planKey === "pro" && !isPro && (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || loading}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>Upgrade to Pro <ArrowRight size={14} /></>
                    )}
                  </button>
                )}
                {plan.planKey === "free" && (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-sm text-center bg-muted text-muted-foreground cursor-not-allowed">
                    {isCurrent ? "Current Plan" : "Free Tier"}
                  </div>
                )}
                {plan.planKey === "pro" && isPro && (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-sm text-center bg-primary/10 text-primary">
                    ✓ Active
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-primary flex items-center gap-2">
              <BarChart3 size={16} /> Feature Comparison
            </h3>
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
                {featureComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{row.feature}</td>
                    <td className="text-center px-5 py-3 text-muted-foreground">{row.free}</td>
                    <td className="text-center px-5 py-3 text-foreground font-medium">{row.pro}</td>
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
