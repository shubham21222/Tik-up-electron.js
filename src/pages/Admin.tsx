import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin, useAdminUsers, useAdminAnalytics, useAdminLogs, useAdminAuditLogs } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Users, BarChart3, ScrollText, CreditCard, RefreshCw, Crown, Gauge, AlertTriangle, Megaphone, Send, Trash2, Link2, FileSearch, ToggleRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

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
  const [tab, setTab] = useState<"analytics" | "users" | "logs" | "licenses" | "ratelimits" | "announcements" | "tiktok" | "audit" | "features">("analytics");

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
    { id: "tiktok" as const, label: "TikTok Links", icon: Link2 },
    { id: "announcements" as const, label: "Announcements", icon: Megaphone },
    { id: "logs" as const, label: "System Logs", icon: ScrollText },
    { id: "audit" as const, label: "Audit Log", icon: FileSearch },
    { id: "features" as const, label: "Features", icon: ToggleRight },
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
        {tab === "tiktok" && <TikTokLinksTab />}
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "logs" && <LogsTab />}
        {tab === "audit" && <AuditLogTab />}
        {tab === "features" && <FeatureFlagsTab />}
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

const AnnouncementsTab = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [sending, setSending] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setNotifs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("notifications").insert({
      title: title.trim(),
      body: body.trim(),
      type,
      created_by: session?.user?.id,
    });
    setTitle("");
    setBody("");
    toast.success("Notification sent to all users");
    await fetchNotifs();
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  return (
    <div className="space-y-6">
      {/* Create new */}
      <div className="rounded-2xl border border-border p-5 bg-muted/5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Send size={14} className="text-primary" /> Send Notification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={100}
            className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary md:col-span-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="announcement">📢 Announcement</option>
            <option value="update">ℹ️ Update</option>
            <option value="alert">⚠️ Alert</option>
          </select>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notification body..."
          rows={3}
          maxLength={500}
          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!title.trim() || !body.trim() || sending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send size={14} /> {sending ? "Sending..." : "Send to All Users"}
        </button>
      </div>

      {/* Existing notifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{notifs.length} notifications</span>
          <button onClick={fetchNotifs} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
          ) : notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications sent yet.</p>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className="rounded-lg border border-border p-3 bg-muted/5 flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">{n.type}</span>
                    <span className="text-sm font-semibold text-foreground">{n.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <span className="text-[10px] text-muted-foreground/50 mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
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

const TikTokLinksTab = () => {
  const { users, loading, refetch, unlinkTiktok, overrideTiktok } = useAdminUsers();
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [overrideUser, setOverrideUser] = useState<string | null>(null);
  const [overrideUsername, setOverrideUsername] = useState("");

  const handleUnlink = async (userId: string) => {
    setUnlinking(userId);
    try {
      await unlinkTiktok(userId);
      toast.success("TikTok username unlinked");
    } catch (e: any) {
      toast.error(e.message || "Failed to unlink");
    }
    setUnlinking(null);
  };

  const handleOverride = async (userId: string) => {
    if (!overrideUsername.trim()) return;
    try {
      await overrideTiktok(userId, overrideUsername.trim());
      toast.success(`Username overridden to @${overrideUsername.trim()}`);
      setOverrideUser(null);
      setOverrideUsername("");
    } catch (e: any) {
      toast.error(e.message || "Failed to override");
    }
  };

  const linkedUsers = users.filter((u: any) => u.tiktok_username);

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{linkedUsers.length} linked accounts</span>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/10 border-b border-border">
              <th className="text-left p-3 text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-muted-foreground font-medium">TikTok Username</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Locked At</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {linkedUsers.map((u: any) => (
              <tr key={u.id} className="border-b border-border hover:bg-muted/5">
                <td className="p-3">
                  <div className="font-medium text-foreground">{u.display_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="p-3 text-foreground font-mono">@{u.tiktok_username}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {u.username_locked_at ? new Date(u.username_locked_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUnlink(u.user_id)}
                      disabled={unlinking === u.user_id}
                      className="px-3 py-1 rounded-lg text-[11px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      {unlinking === u.user_id ? "..." : "Unlink"}
                    </button>
                    {overrideUser === u.user_id ? (
                      <div className="flex gap-1">
                        <input
                          value={overrideUsername}
                          onChange={e => setOverrideUsername(e.target.value)}
                          placeholder="new_username"
                          className="w-28 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground outline-none"
                        />
                        <button onClick={() => handleOverride(u.user_id)}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-primary/20 text-primary hover:bg-primary/30">
                          Save
                        </button>
                        <button onClick={() => { setOverrideUser(null); setOverrideUsername(""); }}
                          className="px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setOverrideUser(u.user_id); setOverrideUsername(u.tiktok_username || ""); }}
                        className="px-3 py-1 rounded-lg text-[11px] font-medium bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                      >
                        Override
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {linkedUsers.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No TikTok accounts linked yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuditLogTab = () => {
  const { logs, loading, refetch } = useAdminAuditLogs();

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading audit logs...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{logs.length} audit entries</span>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log.id} className="rounded-lg border border-border p-3 bg-muted/5">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                log.action.includes("unlink") ? "bg-destructive/10 text-destructive" :
                log.action.includes("override") ? "bg-amber-500/10 text-amber-400" :
                "bg-primary/10 text-primary"
              }`}>{log.action}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            {log.target_user_id && (
              <p className="text-[11px] text-muted-foreground">Target: {log.target_user_id}</p>
            )}
            {log.details && Object.keys(log.details).length > 0 && (
              <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto font-mono">
                {JSON.stringify(log.details, null, 2).slice(0, 300)}
              </pre>
            )}
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No audit events logged yet.</p>}
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

const FeatureFlagsTab = () => {
  const { flags, toggleFlag } = useFeatureFlags();
  const [editingBadge, setEditingBadge] = useState<string | null>(null);
  const [badgeValue, setBadgeValue] = useState("");
  const [editingDesc, setEditingDesc] = useState<string | null>(null);
  const [descValue, setDescValue] = useState("");

  // Group flags by section
  const grouped = flags.reduce<Record<string, typeof flags>>((acc, f) => {
    (acc[f.section] = acc[f.section] || []).push(f);
    return acc;
  }, {});

  const sectionOrder = ["Live Studio", "Engagement", "Growth", "Creator Tools", "Enterprise", "Settings"];

  const saveBadge = async (flagId: string) => {
    await supabase.from("feature_flags" as any).update({ badge: badgeValue } as any).eq("id", flagId);
    setEditingBadge(null);
    toast.success("Badge updated");
  };

  const saveDesc = async (flagId: string) => {
    await supabase.from("feature_flags" as any).update({ description: descValue } as any).eq("id", flagId);
    setEditingDesc(null);
    toast.success("Description updated");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Full control over all features. Hidden features move to the "What's New" section for all users.</p>
      {sectionOrder.map(section => {
        const items = grouped[section];
        if (!items?.length) return null;
        return (
          <div key={section} className="rounded-2xl border border-white/[0.06] p-5 bg-muted/5">
            <h3 className="text-sm font-heading font-bold text-foreground mb-4">{section}</h3>
            <div className="space-y-3">
              {items.map(flag => (
                <div key={flag.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{flag.label}</span>
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{flag.feature_key}</span>
                      {editingBadge === flag.id ? (
                        <div className="flex items-center gap-1">
                          <input value={badgeValue} onChange={e => setBadgeValue(e.target.value)} placeholder="Badge" maxLength={20}
                            className="bg-muted/30 border border-border rounded px-2 py-0.5 text-[10px] w-20 text-foreground outline-none focus:border-primary" />
                          <button onClick={() => saveBadge(flag.id)} className="text-[10px] text-primary hover:text-primary/80">Save</button>
                          <button onClick={() => setEditingBadge(null)} className="text-[10px] text-muted-foreground">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingBadge(flag.id); setBadgeValue(flag.badge || ""); }}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md cursor-pointer ${
                            flag.badge === "New" ? "bg-secondary/20 text-secondary" :
                            flag.badge === "Popular" ? "bg-orange-500/20 text-orange-400" :
                            flag.badge ? "bg-muted/30 text-muted-foreground" : "bg-muted/10 text-muted-foreground/30 hover:bg-muted/20"
                          }`}>
                          {flag.badge || "+ badge"}
                        </button>
                      )}
                    </div>
                    {editingDesc === flag.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input value={descValue} onChange={e => setDescValue(e.target.value)} placeholder="Description"
                          className="bg-muted/30 border border-border rounded px-2 py-0.5 text-[10px] flex-1 text-foreground outline-none focus:border-primary" />
                        <button onClick={() => saveDesc(flag.id)} className="text-[10px] text-primary hover:text-primary/80">Save</button>
                        <button onClick={() => setEditingDesc(null)} className="text-[10px] text-muted-foreground">✕</button>
                      </div>
                    ) : (
                      <p onClick={() => { setEditingDesc(flag.id); setDescValue(flag.description || ""); }}
                        className="text-[11px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground truncate">
                        {flag.description || "Click to add description..."}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.feature_key)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      flag.is_visible ? "bg-primary" : "bg-muted/40"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ left: flag.is_visible ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Admin;
