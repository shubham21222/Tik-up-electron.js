import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Zap, Crown, Rocket } from "lucide-react";
import { useAgencies } from "@/hooks/use-agencies";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router-dom";

const plans = [
  { id: "starter" as const, label: "Starter", icon: Zap, color: "200 100% 55%", clients: 5, overlays: 10, ws: 10, price: "Free" },
  { id: "pro" as const, label: "Pro", icon: Crown, color: "280 100% 65%", clients: 25, overlays: 50, ws: 100, price: "$29/mo" },
  { id: "enterprise" as const, label: "Enterprise", icon: Rocket, color: "45 100% 55%", clients: 999, overlays: 999, ws: 1000, price: "Custom" },
];

const AgencyCreate = () => {
  const { user } = useAuth();
  const { createAgency } = useAgencies();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [saving, setSaving] = useState(false);

  const autoSlug = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    const agency = await createAgency(name.trim(), slug.trim(), plan);
    setSaving(false);
    if (agency) navigate(`/agency/${agency.id}`);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Please sign in first.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto relative z-10 pb-12">
        {/* Back link */}
        <Link to="/agencies" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Agency Hub
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Create New Agency</h1>
          <p className="text-sm text-muted-foreground">Set up a new whitelabel agency with branded overlays</p>
        </motion.div>

        <div className="space-y-6">
          {/* Name */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
              <label className="block text-xs font-bold text-foreground mb-2">Agency Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => autoSlug(e.target.value)}
                placeholder="My Awesome Agency"
                className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
                maxLength={100}
              />
              <div className="mt-3">
                <label className="block text-xs font-bold text-foreground mb-2">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">/agency/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-agency"
                    className="flex-1 px-3 py-2 rounded-lg bg-muted/20 border border-border/40 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plan Selection */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="block text-xs font-bold text-foreground mb-3">Select Plan</label>
            <div className="grid grid-cols-3 gap-3">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`rounded-2xl p-[1px] text-left transition-all duration-200 ${plan === p.id ? "ring-2 ring-primary" : ""}`}
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div className="rounded-2xl p-4" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `hsl(${p.color} / 0.12)` }}>
                      <p.icon size={16} style={{ color: `hsl(${p.color})` }} />
                    </div>
                    <h3 className="text-sm font-heading font-bold text-foreground">{p.label}</h3>
                    <p className="text-lg font-bold text-foreground mt-1">{p.price}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] text-muted-foreground">{p.clients === 999 ? "Unlimited" : p.clients} clients</p>
                      <p className="text-[10px] text-muted-foreground">{p.overlays === 999 ? "Unlimited" : p.overlays} overlays</p>
                      <p className="text-[10px] text-muted-foreground">{p.ws} WS connections</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Create Button */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !slug.trim() || saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Building2 size={16} />
              {saving ? "Creating..." : "Create Agency"}
            </button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AgencyCreate;
