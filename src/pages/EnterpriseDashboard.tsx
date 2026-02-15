import AppLayout from "@/components/AppLayout";
import EnterpriseGate from "@/components/EnterpriseGate";
import { motion } from "framer-motion";
import { BarChart3, Users, Wifi, Activity } from "lucide-react";

const PlaceholderContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Agencies", value: "24", icon: BarChart3 },
        { label: "Active Users", value: "1,280", icon: Users },
        { label: "WS Connections", value: "47", icon: Wifi },
        { label: "Events / min", value: "1,240", icon: Activity },
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
    <div className="rounded-2xl border border-border/40 p-6 h-64" style={{ background: "rgba(20,25,35,0.55)" }} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border/40 p-6 h-48" style={{ background: "rgba(20,25,35,0.55)" }} />
      <div className="rounded-2xl border border-border/40 p-6 h-48" style={{ background: "rgba(20,25,35,0.55)" }} />
    </div>
  </div>
);

const EnterpriseDashboard = () => (
  <AppLayout>
    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Command Center</h1>
        <p className="text-muted-foreground text-sm">Enterprise-grade monitoring, KPIs, and real-time system health.</p>
      </motion.div>

      <EnterpriseGate feature="Command Center">
        <PlaceholderContent />
      </EnterpriseGate>
    </div>
  </AppLayout>
);

export default EnterpriseDashboard;
