import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, Layers, Wifi, Activity, TrendingUp, TrendingDown,
  Server, Database, Zap, Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowUpRight, Globe, Shield, BarChart3, Eye
} from "lucide-react";
import { useAgencies } from "@/hooks/use-agencies";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

/* ─── Glass helpers ─── */
const glass = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };
const glassBorder = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };

/* ─── Simulated live data (replace with real-time queries later) ─── */
const useLiveMetrics = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 3000); return () => clearInterval(t); }, []);
  // Simulated values that fluctuate slightly each tick
  const base = { wsConnections: 47, eventsPerMin: 1240, avgLatency: 18, uptime: 99.97, bandwidth: 2.4 };
  const jitter = (v: number, pct = 0.08) => Math.round(v * (1 + (Math.random() - 0.5) * pct));
  return {
    wsConnections: jitter(base.wsConnections),
    eventsPerMin: jitter(base.eventsPerMin),
    avgLatency: jitter(base.avgLatency, 0.15),
    uptime: base.uptime,
    bandwidth: +(base.bandwidth + (Math.random() - 0.5) * 0.3).toFixed(1),
    tick,
  };
};

/* ─── Health status items ─── */
const healthServices = [
  { name: "WebSocket Gateway", status: "operational", latency: "12ms" },
  { name: "Event Pipeline", status: "operational", latency: "8ms" },
  { name: "Database Cluster", status: "operational", latency: "3ms" },
  { name: "CDN / Overlay Delivery", status: "operational", latency: "22ms" },
  { name: "Auth Service", status: "operational", latency: "5ms" },
  { name: "Webhook Processor", status: "degraded", latency: "145ms" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  operational: { icon: CheckCircle2, color: "160 100% 45%", label: "Operational" },
  degraded: { icon: AlertTriangle, color: "45 100% 55%", label: "Degraded" },
  down: { icon: XCircle, color: "350 80% 55%", label: "Down" },
};

/* ─── Recent activity feed ─── */
const recentEvents = [
  { time: "2s ago", type: "agency_created", msg: "New agency 'StreamPro Media' created", color: "160 100% 45%" },
  { time: "15s ago", type: "ws_spike", msg: "WebSocket connections spike: 47 → 62", color: "45 100% 55%" },
  { time: "1m ago", type: "overlay_deployed", msg: "Gift Alert deployed for client @dancequeen", color: "200 100% 55%" },
  { time: "3m ago", type: "error", msg: "Webhook timeout for agency 'NightOwl Studios'", color: "350 80% 55%" },
  { time: "5m ago", type: "member_added", msg: "Designer added to 'Elite Creators Agency'", color: "280 100% 65%" },
  { time: "8m ago", type: "plan_upgrade", msg: "'StreamPro Media' upgraded to Pro plan", color: "280 100% 65%" },
  { time: "12m ago", type: "overlay_deployed", msg: "Leaderboard overlay deployed for @gamerkid99", color: "200 100% 55%" },
];

/* ─── Mini sparkline component ─── */
const Sparkline = ({ color, data }: { color: string; data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke={`hsl(${color})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const { agencies, loading } = useAgencies();
  const metrics = useLiveMetrics();

  // Simulated sparkline data
  const [sparkData] = useState(() => ({
    ws: Array.from({ length: 12 }, () => 30 + Math.random() * 30),
    events: Array.from({ length: 12 }, () => 800 + Math.random() * 600),
    latency: Array.from({ length: 12 }, () => 10 + Math.random() * 20),
    bandwidth: Array.from({ length: 12 }, () => 1.5 + Math.random() * 1.5),
  }));

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Building2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to access Enterprise Dashboard</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  const totalClients = agencies.reduce((s, a) => s + a.max_clients, 0);
  const totalOverlays = agencies.reduce((s, a) => s + a.max_overlays, 0);
  const activeAgencies = agencies.filter(a => a.is_active).length;

  const kpis = [
    { label: "Total Agencies", value: agencies.length, icon: Building2, color: "160 100% 45%", trend: "+2", up: true, spark: sparkData.ws },
    { label: "Active Agencies", value: activeAgencies, icon: Activity, color: "200 100% 55%", trend: "+1", up: true, spark: sparkData.events },
    { label: "Client Slots", value: totalClients, icon: Users, color: "280 100% 65%", trend: "+10", up: true, spark: sparkData.latency },
    { label: "Overlay Capacity", value: totalOverlays, icon: Layers, color: "45 100% 55%", trend: "+25", up: true, spark: sparkData.bandwidth },
  ];

  const liveCards = [
    { label: "WS Connections", value: metrics.wsConnections, unit: "", icon: Wifi, color: "160 100% 45%", spark: sparkData.ws },
    { label: "Events / min", value: metrics.eventsPerMin.toLocaleString(), unit: "", icon: Zap, color: "45 100% 55%", spark: sparkData.events },
    { label: "Avg Latency", value: metrics.avgLatency, unit: "ms", icon: Clock, color: "200 100% 55%", spark: sparkData.latency },
    { label: "Bandwidth", value: metrics.bandwidth, unit: "GB/h", icon: Globe, color: "280 100% 65%", spark: sparkData.bandwidth },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Monitoring</span>
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Enterprise Command Center</h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time overview of all agencies, connections, and system health</p>
            </div>
            <Link to="/agencies"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 text-sm font-semibold text-primary hover:bg-primary/5 transition-all hover:-translate-y-0.5">
              <Building2 size={14} /> Manage Agencies
            </Link>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-[1px]"
              style={glassBorder}
            >
              <div className="rounded-2xl px-4 py-4 relative overflow-hidden" style={glass}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(${kpi.color} / 0.12)` }}>
                    <kpi.icon size={16} style={{ color: `hsl(${kpi.color})` }} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: kpi.up ? "hsl(160 100% 50%)" : "hsl(350 80% 55%)" }}>
                    {kpi.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {kpi.trend}
                  </div>
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{loading ? "—" : kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                {/* Sparkline bg */}
                <div className="absolute bottom-2 right-3 opacity-40">
                  <Sparkline color={kpi.color} data={kpi.spark} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Metrics Strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-[1px] mb-6" style={glassBorder}>
          <div className="rounded-2xl p-1" style={glass}>
            <div className="flex items-center gap-2 px-3 py-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Real-Time Metrics</span>
              <span className="text-[9px] text-muted-foreground ml-auto">Auto-refreshes every 3s</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {liveCards.map((card) => (
                <div key={card.label} className="rounded-xl px-4 py-3 bg-muted/10 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon size={13} style={{ color: `hsl(${card.color})` }} />
                    <span className="text-[10px] text-muted-foreground font-medium">{card.label}</span>
                  </div>
                  <motion.p
                    key={`${card.label}-${metrics.tick}`}
                    initial={{ opacity: 0.5, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-heading font-bold text-foreground"
                  >
                    {card.value}<span className="text-xs text-muted-foreground ml-1">{card.unit}</span>
                  </motion.p>
                  <div className="absolute bottom-1 right-2 opacity-30">
                    <Sparkline color={card.color} data={card.spark} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two-column: System Health + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* System Health — 3 cols */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-3 rounded-2xl p-[1px]" style={glassBorder}>
            <div className="rounded-2xl p-5" style={glass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-primary" />
                  <h3 className="text-sm font-heading font-bold text-foreground">System Health</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "hsl(160 100% 45% / 0.1)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-primary">
                    {healthServices.filter(s => s.status === "operational").length}/{healthServices.length} Operational
                  </span>
                </div>
              </div>

              {/* Uptime bar */}
              <div className="mb-5 px-3 py-3 rounded-xl bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground font-medium">Platform Uptime (30d)</span>
                  <span className="text-sm font-heading font-bold text-primary">{metrics.uptime}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.uptime}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-primary"
                    style={{ boxShadow: "0 0 12px hsl(160 100% 45% / 0.3)" }}
                  />
                </div>
              </div>

              {/* Service list */}
              <div className="space-y-2">
                {healthServices.map((svc) => {
                  const cfg = statusConfig[svc.status] || statusConfig.operational;
                  const Icon = cfg.icon;
                  return (
                    <div key={svc.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={14} style={{ color: `hsl(${cfg.color})` }} />
                        <span className="text-xs font-medium text-foreground">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground">{svc.latency}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold" style={{ background: `hsl(${cfg.color} / 0.1)`, color: `hsl(${cfg.color})` }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Activity Feed — 2 cols */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl p-[1px]" style={glassBorder}>
            <div className="rounded-2xl p-5" style={glass}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-primary" />
                <h3 className="text-sm font-heading font-bold text-foreground">Live Activity</h3>
              </div>

              <div className="space-y-1">
                {recentEvents.map((evt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/10 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: `hsl(${evt.color})` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground leading-snug">{evt.msg}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{evt.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-6 rounded-2xl p-[1px]" style={glassBorder}>
          <div className="rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3" style={glass}>
            <span className="text-xs font-bold text-muted-foreground mr-2">Quick Actions</span>
            {[
              { label: "New Agency", to: "/agency/new", icon: Building2, color: "160 100% 45%" },
              { label: "Agency Hub", to: "/agencies", icon: BarChart3, color: "200 100% 55%" },
              { label: "Overlays", to: "/overlays", icon: Layers, color: "280 100% 65%" },
              { label: "Moderation", to: "/auto-moderation", icon: Shield, color: "45 100% 55%" },
            ].map((action) => (
              <Link key={action.label} to={action.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all hover:-translate-y-0.5">
                <action.icon size={12} style={{ color: `hsl(${action.color})` }} />
                {action.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default EnterpriseDashboard;
