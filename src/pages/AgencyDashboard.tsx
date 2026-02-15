import AppLayout from "@/components/AppLayout";
import EnterpriseGate from "@/components/EnterpriseGate";
import { motion } from "framer-motion";
import { Building2, Plus, Users, Layers } from "lucide-react";

const PlaceholderContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: "Total Agencies", value: "12", icon: Building2 },
        { label: "Team Members", value: "48", icon: Users },
        { label: "Active Overlays", value: "156", icon: Layers },
      ].map((card) => (
        <div key={card.label} className="rounded-2xl border border-border/40 p-5" style={{ background: "rgba(20,25,35,0.55)" }}>
          <div className="flex items-center gap-3 mb-3">
            <card.icon size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 p-5 h-40" style={{ background: "rgba(20,25,35,0.55)" }} />
      ))}
    </div>
  </div>
);

const AgencyDashboard = () => (
  <AppLayout>
    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Agency Hub</h1>
        <p className="text-muted-foreground text-sm">Manage agencies, teams, and whitelabel configurations.</p>
      </motion.div>

      <EnterpriseGate feature="Agency Hub">
        <PlaceholderContent />
      </EnterpriseGate>
    </div>
  </AppLayout>
);

export default AgencyDashboard;
