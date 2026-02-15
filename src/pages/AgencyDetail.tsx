import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Users, Layers, Wifi, Save, UserPlus, Trash2, Crown } from "lucide-react";
import { useAgencies, useAgencyMembers, type Agency } from "@/hooks/use-agencies";
import { useAuth } from "@/hooks/use-auth";
import { useParams, Link, useNavigate } from "react-router-dom";
import TabNav from "@/components/TabNav";

const tabs = ["Overview", "Members", "Branding"];

const AgencyDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { agencies, updateAgency, loading } = useAgencies();
  const { members, loading: membersLoading, removeMember } = useAgencyMembers(id || null);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const agency = agencies.find(a => a.id === id);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<Agency["plan"]>("starter");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agency) {
      setName(agency.name);
      setPlan(agency.plan);
    }
  }, [agency]);

  if (!user) {
    return <AppLayout><div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Sign in required.</p></div></AppLayout>;
  }

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></AppLayout>;
  }

  if (!agency) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Building2 size={48} className="text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-heading font-bold text-foreground mb-2">Agency not found</h2>
          <Link to="/agencies" className="text-sm text-primary hover:underline">← Back to Agency Hub</Link>
        </div>
      </AppLayout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateAgency(agency.id, { name: name.trim(), plan });
    setSaving(false);
  };

  const roleColors: Record<string, string> = {
    owner: "hsl(45 100% 55%)",
    admin: "hsl(200 100% 55%)",
    designer: "hsl(280 100% 65%)",
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto relative z-10 pb-12">
        <Link to="/agencies" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Agency Hub
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">{agency.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">/{agency.slug}</p>
            </div>
          </div>
        </motion.div>

        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "Overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Edit form */}
            <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">Agency Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    maxLength={100} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">Plan</label>
                  <div className="flex gap-2">
                    {(["starter", "pro", "enterprise"] as const).map((p) => (
                      <button key={p} onClick={() => setPlan(p)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${plan === p ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/15 text-muted-foreground border border-border/30 hover:bg-muted/30"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 transition-all hover:-translate-y-0.5">
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: "Max Clients", value: agency.max_clients, color: "200 100% 55%" },
                { icon: Layers, label: "Max Overlays", value: agency.max_overlays, color: "280 100% 65%" },
                { icon: Wifi, label: "WS Connections", value: agency.max_ws_connections, color: "160 100% 45%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
                  <div className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                    <s.icon size={18} style={{ color: `hsl(${s.color})` }} />
                    <span className="text-xl font-heading font-bold text-foreground">{s.value}</span>
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "Members" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
              <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-bold text-foreground">Team Members</h3>
                  <span className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</span>
                </div>

                {membersLoading ? (
                  <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse" />)}</div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                            <Users size={14} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-mono text-foreground">{m.user_id.slice(0, 8)}…</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold capitalize" style={{ color: roleColors[m.role] || "inherit", background: `${roleColors[m.role]}15` }}>
                            {m.role}
                          </span>
                          {m.role !== "owner" && (
                            <button onClick={() => removeMember(m.id)} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors" style={{ color: "hsl(350 80% 55%)" }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "Branding" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
              <div className="rounded-2xl p-8 flex flex-col items-center justify-center" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                <Crown size={40} className="text-muted-foreground/20 mb-4" />
                <h3 className="text-sm font-heading font-bold text-foreground mb-2">Whitelabel Builder</h3>
                <p className="text-xs text-muted-foreground text-center max-w-sm">Upload logos, set brand colors, and customize fonts for all your agency overlays. Coming in Phase 3.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default AgencyDetail;
