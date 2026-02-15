import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Users, Layers, Wifi, Crown, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAgencies, type Agency } from "@/hooks/use-agencies";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const planColors: Record<string, { bg: string; text: string; border: string }> = {
  starter: { bg: "hsl(200 100% 55% / 0.12)", text: "hsl(200 100% 60%)", border: "hsl(200 100% 55% / 0.25)" },
  pro: { bg: "hsl(280 100% 65% / 0.12)", text: "hsl(280 100% 70%)", border: "hsl(280 100% 65% / 0.25)" },
  enterprise: { bg: "hsl(45 100% 55% / 0.12)", text: "hsl(45 100% 60%)", border: "hsl(45 100% 55% / 0.25)" },
};

const AgencyCard = ({ agency, onDelete, onToggle }: { agency: Agency; onDelete: () => void; onToggle: () => void }) => {
  const plan = planColors[agency.plan] || planColors.starter;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
              <Building2 size={18} style={{ color: plan.text }} />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-foreground">{agency.name}</h3>
              <p className="text-[11px] text-muted-foreground font-mono">/{agency.slug}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground transition-colors">
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-border/60 p-1.5 shadow-xl"
                  style={{ background: "rgba(20,25,35,0.95)", backdropFilter: "blur(20px)" }}
                >
                  <Link to={`/agency/${agency.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/40 transition-colors w-full" onClick={() => setShowMenu(false)}>
                    <Pencil size={12} /> Edit Agency
                  </Link>
                  <button onClick={() => { onToggle(); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/40 transition-colors w-full">
                    {agency.is_active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                    {agency.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => { onDelete(); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-muted/40 transition-colors w-full" style={{ color: "hsl(350 80% 55%)" }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Plan badge + status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: plan.bg, color: plan.text, border: `1px solid ${plan.border}` }}>
            {agency.plan}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${agency.is_active ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
            {agency.is_active ? "● Active" : "○ Inactive"}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Clients", value: `0/${agency.max_clients}` },
            { icon: Layers, label: "Overlays", value: `0/${agency.max_overlays}` },
            { icon: Wifi, label: "WS Limit", value: agency.max_ws_connections },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-muted/10">
              <stat.icon size={13} className="text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{stat.value}</span>
              <span className="text-[9px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Manage button */}
        <Link to={`/agency/${agency.id}`}
          className="flex items-center justify-center gap-1.5 w-full mt-4 px-4 py-2.5 rounded-xl border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
          <Pencil size={11} /> Manage
        </Link>
      </div>
    </motion.div>
  );
};

const AgencyDashboard = () => {
  const { user } = useAuth();
  const { agencies, loading, deleteAgency, updateAgency } = useAgencies();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Building2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to manage agencies</h2>
            <p className="text-sm text-muted-foreground">Create and manage your whitelabel agency accounts.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold text-foreground">Agency Hub</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Manage your whitelabel agencies, clients, and branded overlays</p>
            </div>
            <Link to="/agency/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
              <Plus size={16} /> New Agency
            </Link>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Agencies", value: agencies.length, icon: Building2, color: "160 100% 45%" },
            { label: "Active", value: agencies.filter(a => a.is_active).length, icon: ToggleRight, color: "160 100% 50%" },
            { label: "Pro Plans", value: agencies.filter(a => a.plan === "pro" || a.plan === "enterprise").length, icon: Crown, color: "280 100% 65%" },
            { label: "Total Client Slots", value: agencies.reduce((s, a) => s + a.max_clients, 0), icon: Users, color: "200 100% 55%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(${stat.color} / 0.12)` }}>
                  <stat.icon size={16} style={{ color: `hsl(${stat.color})` }} />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Agency Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl h-56 bg-muted/20 animate-pulse" />)}
          </div>
        ) : agencies.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <Building2 size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No agencies yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first whitelabel agency to get started.</p>
            <Link to="/agency/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:-translate-y-0.5 transition-all duration-200">
              <Plus size={16} /> Create First Agency
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {agencies.map((agency) => (
                <AgencyCard
                  key={agency.id}
                  agency={agency}
                  onDelete={() => deleteAgency(agency.id)}
                  onToggle={() => updateAgency(agency.id, { is_active: !agency.is_active })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AgencyDashboard;
