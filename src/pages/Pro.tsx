import AppLayout from "@/components/AppLayout";
import { Crown, Check, Zap, Star, Shield, Headphones, Palette, BarChart3, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
    cta: "Current Plan",
    disabled: true,
    highlight: false,
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
      "OBS Scene Control",
      "Game Integrations",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$29.99",
    period: "/month",
    description: "For agencies & top creators",
    features: [
      "Everything in Pro",
      "Multi-Account Support",
      "API Access",
      "White-Label Overlays",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA & Uptime Guarantee",
      "Team Collaboration",
    ],
    cta: "Contact Sales",
    disabled: false,
    highlight: false,
  },
];

const featureComparison = [
  { feature: "Overlay Widgets", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "TTS Voices", free: "2", pro: "15+", enterprise: "15+ Custom" },
  { feature: "Sound Alerts", free: "10", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Chat Commands", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Game Integrations", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "OBS Control", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "Analytics", free: "Basic", pro: "Advanced", enterprise: "Full + API" },
  { feature: "Custom Branding", free: "—", pro: "✓", enterprise: "White-Label" },
  { feature: "API Access", free: "—", pro: "—", enterprise: "✓" },
  { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
];

const Pro = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={32} className="text-secondary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">
              TikUp <span className="text-gradient-accent">Pro</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Unlock the full power of TikUp. Premium overlays, advanced analytics, game integrations, and priority support.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setBilling("monthly")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", billing === "monthly" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", billing === "yearly" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Yearly <span className="text-xs text-secondary ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border bg-card p-6 flex flex-col relative",
                plan.highlight ? "border-secondary/40 glow-primary" : "border-border"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-heading font-bold text-lg text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 mb-5">
                <span className="text-3xl font-heading font-bold text-foreground">
                  {billing === "yearly" && plan.price !== "$0"
                    ? plan.price === "$9.99" ? "$7.99" : "$23.99"
                    : plan.price}
                </span>
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
              <button
                disabled={plan.disabled}
                className={cn(
                  "w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2",
                  plan.highlight
                    ? "bg-secondary text-secondary-foreground hover:opacity-90"
                    : plan.disabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {plan.cta} {!plan.disabled && <ArrowRight size={14} />}
              </button>
            </div>
          ))}
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
                  <th className="text-center px-5 py-3 text-muted-foreground font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{row.feature}</td>
                    <td className="text-center px-5 py-3 text-muted-foreground">{row.free}</td>
                    <td className="text-center px-5 py-3 text-foreground font-medium">{row.pro}</td>
                    <td className="text-center px-5 py-3 text-muted-foreground">{row.enterprise}</td>
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
