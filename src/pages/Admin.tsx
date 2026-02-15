import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin, useAdminUsers, useAdminAnalytics, useAdminLogs } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Users, BarChart3, ScrollText, CreditCard, RefreshCw, Crown, Gauge, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-5 border border-white/[0.06]"
    style={{ background: `linear-gradient(135deg, hsl(${color}/0.08), hsl(${color}/0.02))` }}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg" style={{ background: `hsl(${color}/0.15)` }}>
        <Icon size={16} style={{ color: `hsl(${color})` }} />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
  </motion.div>
);

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"analytics" | "users" | "logs" | "licenses" | "ratelimits">("analytics");

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [roleLoading, isAdmin, navigate]);

  if (!user || roleLoading || !isAdmin) {
    return <AppLayout><div className="flex items-center justify-center h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div></AppLayout>;
  }

  const tabs = [
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "logs" as const, label: "System Logs", icon: ScrollText },
    { id: "licenses" as const, label: "Licenses", icon: CreditCard },
    { id: "ratelimits" as const, label: "API Limits", icon: Gauge },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={24} className="text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">Platform management & analytics</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-muted/20 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" && <AnalyticsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "logs" && <LogsTab />}
        {tab === "licenses" && <LicensesTab />}
        {tab === "ratelimits" && <RateLimitsTab />}
      </div>
    </AppLayout>
  );
};

const AnalyticsTab = () => {
  const { analytics, loading } = useAdminAnalytics();
  if (loading) return <div className="animate-pulse text-muted-foreground">Loading analytics...</div>;
  if (!analytics) return <div className="text-muted-foreground">Failed to load analytics.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={analytics.total_users} icon={Users} color="180 100% 50%" />
      <StatCard label="PRO Users" value={analytics.pro_users} icon={Crown} color="280 100% 65%" />
      <StatCard label="New This Week" value={analytics.recent_signups} icon={Users} color="160 100% 45%" />
      <StatCard label="Total Overlays" value={analytics.total_overlays} icon={BarChart3} color="210 100% 55%" />
      <StatCard label="Active Screens" value={analytics.total_screens} icon={BarChart3} color="45 90% 55%" />
      <StatCard label="Goals Created" value={analytics.total_goals} icon={BarChart3} color="340 100% 60%" />
      <StatCard label="Events Logged" value={analytics.total_events} icon={ScrollText} color="200 100% 50%" />
    </div>
  );
};

const UsersTab = () => {
  const { users, loading, refetch } = useAdminUsers();

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading users...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{users.length} users</span>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/10 border-b border-white/[0.06]">
              <th className="text-left p-3 text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Plan</th>
              <th className="text-left p-3 text-muted-foreground font-medium">TikTok</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Overlays</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-white/[0.04] hover:bg-muted/5 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-foreground">{u.display_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    u.subscription?.plan === "pro" ? "bg-purple-500/20 text-purple-300" :
                    u.subscription?.plan === "enterprise" ? "bg-amber-500/20 text-amber-300" :
                    "bg-muted/30 text-muted-foreground"
                  }`}>
                    {(u.subscription?.plan || u.plan_type || "free").toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{u.tiktok_username || "—"}</td>
                <td className="p-3 text-foreground">{u.overlay_count}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LogsTab = () => {
  const { logs, loading, refetch } = useAdminLogs();

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading logs...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{logs.length} events</span>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log.id} className="rounded-lg border border-white/[0.06] p-3 bg-muted/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">{log.event_type}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            {log.payload && Object.keys(log.payload).length > 0 && (
              <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto font-mono">
                {JSON.stringify(log.payload, null, 2).slice(0, 200)}
              </pre>
            )}
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No events logged yet.</p>}
      </div>
    </div>
  );
};

const LicensesTab = () => {
  const { users, loading, updatePlan, refetch } = useAdminUsers();
  const [updating, setUpdating] = useState<string | null>(null);

  const handlePlanChange = async (userId: string, plan: string) => {
    setUpdating(userId);
    try {
      await updatePlan(userId, plan);
      toast.success(`Plan updated to ${plan}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update plan");
    }
    setUpdating(null);
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Manage user subscriptions</span>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/10 border-b border-white/[0.06]">
              <th className="text-left p-3 text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Current Plan</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const currentPlan = u.subscription?.plan || u.plan_type || "free";
              return (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-muted/5">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{u.display_name || u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      currentPlan === "pro" ? "bg-purple-500/20 text-purple-300" : "bg-muted/30 text-muted-foreground"
                    }`}>{currentPlan.toUpperCase()}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {["free", "pro", "enterprise"].map(plan => (
                        <button key={plan} disabled={currentPlan === plan || updating === u.user_id}
                          onClick={() => handlePlanChange(u.user_id, plan)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            currentPlan === plan
                              ? "bg-primary/20 text-primary cursor-default"
                              : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          } ${updating === u.user_id ? "opacity-50" : ""}`}>
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const LimitBar = ({ label, used, max, color }: { label: string; used: number; max: number; color: string }) => {
  const pct = max > 0 ? ((max - used) / max) * 100 : 0;
  const remaining = used;
  const isLow = max > 0 && remaining / max < 0.15;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-medium ${isLow ? "text-red-400" : "text-foreground"}`}>
          {remaining.toLocaleString()} / {max.toLocaleString()}
          {isLow && <AlertTriangle size={10} className="inline ml-1 text-red-400" />}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: `hsl(${color})` }} />
      </div>
    </div>
  );
};

const RateLimitsTab = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/euler-rate-limits`,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLimits(); }, []);

  if (loading) return <div className="animate-pulse text-muted-foreground">Fetching rate limits...</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">EulerStream API Usage</span>
        <button onClick={fetchLimits} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.minute && (
          <div className="rounded-2xl border border-white/[0.06] p-5 bg-muted/5 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Per Minute</h3>
            <LimitBar label="Remaining" used={data.minute.remaining} max={data.minute.max} color="180 100% 50%" />
            {data.minute.reset_at && (
              <p className="text-[10px] text-muted-foreground">Resets: {new Date(data.minute.reset_at).toLocaleTimeString()}</p>
            )}
          </div>
        )}
        {data.hour && (
          <div className="rounded-2xl border border-white/[0.06] p-5 bg-muted/5 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Per Hour</h3>
            <LimitBar label="Remaining" used={data.hour.remaining} max={data.hour.max} color="210 100% 55%" />
            {data.hour.reset_at && (
              <p className="text-[10px] text-muted-foreground">Resets: {new Date(data.hour.reset_at).toLocaleTimeString()}</p>
            )}
          </div>
        )}
        {data.day && (
          <div className="rounded-2xl border border-white/[0.06] p-5 bg-muted/5 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Per Day</h3>
            <LimitBar label="Remaining" used={data.day.remaining} max={data.day.max} color="280 100% 65%" />
            {data.day.reset_at && (
              <p className="text-[10px] text-muted-foreground">Resets: {new Date(data.day.reset_at).toLocaleTimeString()}</p>
            )}
          </div>
        )}
      </div>

      {data.load_shedding && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Load Shedding</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Threshold: {data.load_shedding.at} | Drop chance: {(data.load_shedding.chance * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;
