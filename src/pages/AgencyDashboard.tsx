import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Lock, Building2 } from "lucide-react";

const AgencyDashboard = () => (
  <AppLayout>
    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Agency Hub</h1>
        <p className="text-muted-foreground text-sm">Manage agencies, teams, and whitelabel configurations.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex flex-col items-center justify-center py-24 rounded-2xl border border-border/40"
        style={{ background: "rgba(20,25,35,0.55)", backdropFilter: "blur(20px)" }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "hsl(160 100% 45% / 0.08)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
          <Lock size={28} style={{ color: "hsl(160 100% 45%)" }} />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md leading-relaxed">
          The Agency Hub for managing multiple agency accounts, team members, whitelabel branding, and client workspaces is on the way. Stay tuned!
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default AgencyDashboard;
