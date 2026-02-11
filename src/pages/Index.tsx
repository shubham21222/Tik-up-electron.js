import AppLayout from "@/components/AppLayout";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  Eye, Heart, Share2, UserPlus, DollarSign, Radio,
  TrendingUp, ArrowUpRight, Activity, Gift, Star,
  Play, Download, Mic, Gamepad2, Timer, Globe, Crown, ArrowRight,
  Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
};

const stats = [
  { label: "Current Viewers", value: 1247, icon: Eye, change: "+12%", color: "160 100% 45%" },
  { label: "Total Likes", value: 84320, icon: Heart, change: "+8.4%", color: "350 90% 55%" },
  { label: "Total Shares", value: 2156, icon: Share2, change: "+23%", color: "200 100% 55%" },
  { label: "New Followers", value: 892, icon: UserPlus, change: "+15%", color: "160 100% 45%" },
  { label: "Revenue", value: 324, icon: DollarSign, change: "+5.2%", prefix: "$", color: "45 100% 55%" },
];

const recentEvents = [
  { icon: Gift, user: "StreamFan42", action: "sent a Rose", time: "2s ago", color: "hsl(350,90%,55%)" },
  { icon: UserPlus, user: "NightOwl", action: "just followed", time: "15s ago", color: "hsl(160,100%,45%)" },
  { icon: Heart, user: "GiftKing", action: "liked the stream", time: "28s ago", color: "hsl(350,90%,55%)" },
  { icon: Share2, user: "CoolViewer", action: "shared the stream", time: "45s ago", color: "hsl(200,100%,55%)" },
  { icon: Star, user: "TikTokPro", action: "sent 5 Stars", time: "1m ago", color: "hsl(45,100%,55%)" },
  { icon: Gift, user: "MusicLover", action: "sent a Lion", time: "2m ago", color: "hsl(280,100%,65%)" },
];

const updates = [
  { icon: Download, title: "Desktop App Available", description: "TikUp is now available as a Desktop App for Windows.", tag: "New" },
  { icon: Mic, title: "Voicemod Integration", description: "Let viewers change your voice with Voicemod.", tag: "New" },
  { icon: Gamepad2, title: "GTA 5 Plugin", description: "Let viewers control your GTA 5 game!", tag: "Popular" },
  { icon: Timer, title: "Stream Countdown", description: "Let viewers extend your stream with gifts!" },
  { icon: Globe, title: "Streamer.bot Integration", description: "Connect with Streamer.bot for more features." },
];

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

const Index = () => {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(true);
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("tiktok_username, tiktok_connected").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          if (d.tiktok_username) {
            setTiktokUsername(d.tiktok_username);
            setInputUsername(d.tiktok_username);
            if (d.tiktok_connected) setConnectionStatus("connected");
          }
        }
      });
  }, [user]);

  const handleConnect = useCallback(async () => {
    if (!user) return;
    const clean = inputUsername.trim().replace(/^@/, "");
    if (!clean) {
      setConnectionError("Please enter a TikTok username");
      setConnectionStatus("error");
      return;
    }
    setConnectionError("");
    setConnectionStatus("connecting");
    const { error } = await supabase.from("profiles").update({
      tiktok_username: clean,
      tiktok_connected: true,
      tiktok_connected_at: new Date().toISOString(),
    } as any).eq("user_id", user.id);
    if (error) {
      setConnectionError("Failed to save. Try again.");
      setConnectionStatus("error");
      return;
    }
    setTiktokUsername(clean);
    setConnectionStatus("connected");
    toast.success(`Connected to @${clean}`);
  }, [inputUsername, user]);

  const handleDisconnect = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ tiktok_connected: false } as any).eq("user_id", user.id);
    setConnectionStatus("disconnected");
    setTiktokUsername("");
    toast.info("Disconnected from TikTok");
  };

  return (
    <AppLayout>
      {/* Ambient glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Creator Control Center
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <div className="w-2 h-2 rounded-full bg-destructive absolute inset-0 animate-ping" />
                </div>
                <span className="text-xs font-semibold text-destructive">LIVE</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Welcome back! Your stream tools are ready. Monitor your performance in real-time.
          </p>
        </motion.div>

        {/* TikTok Connection Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 rounded-2xl p-[1px]"
          style={{
            background: connectionStatus === "connected"
              ? "linear-gradient(135deg, hsl(160 100% 45% / 0.3), hsl(160 100% 45% / 0.05))"
              : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          }}
        >
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(24px)" }}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: connectionStatus === "connected"
                ? "radial-gradient(ellipse, hsl(160 100% 45% / 0.06), transparent 70%)"
                : "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {connectionStatus === "connected" ? <Wifi size={24} className="text-primary" /> : <WifiOff size={24} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground">TikTok Connection</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {connectionStatus === "connected"
                        ? <>Streaming as <span className="text-primary font-semibold">@{tiktokUsername}</span></>
                        : "Connect your TikTok username to start receiving live events"}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                  connectionStatus === "connected"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : connectionStatus === "connecting"
                    ? "bg-primary/10 text-primary"
                    : connectionStatus === "error"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {connectionStatus === "connecting" ? <Loader2 size={14} className="animate-spin" /> :
                   connectionStatus === "connected" ? <CheckCircle2 size={14} /> :
                   connectionStatus === "error" ? <AlertCircle size={14} /> :
                   <WifiOff size={14} />}
                  {connectionStatus === "connected" ? "Connected" :
                   connectionStatus === "connecting" ? "Connecting..." :
                   connectionStatus === "error" ? "Error" : "Disconnected"}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-semibold">@</span>
                  <input
                    type="text"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value.replace(/^@/, ""))}
                    placeholder="your_tiktok_username"
                    disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-all font-medium"
                  />
                </div>
                {connectionStatus === "connected" ? (
                  <button onClick={handleDisconnect} className="px-6 py-3.5 rounded-xl bg-destructive/15 text-destructive text-sm font-bold hover:bg-destructive/25 transition-colors border border-destructive/20">
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={connectionStatus === "connecting"}
                    className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {connectionStatus === "connecting" && <Loader2 size={16} className="animate-spin" />}
                    {connectionStatus === "connecting" ? "Connecting..." : "Connect"}
                  </button>
                )}
              </div>

              {connectionError && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-4 py-2.5 rounded-xl border border-destructive/10">
                  <AlertCircle size={14} />
                  {connectionError}
                </div>
              )}

              {connectionStatus === "connected" && (
                <div className="mt-5 flex items-center gap-6">
                  <Link to="/setup" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                    <Settings size={14} />
                    Full Setup & Points Config
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-2xl p-[1px] group cursor-default"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                }}
              >
                <div
                  className="rounded-2xl p-4 h-full transition-shadow duration-300 group-hover:shadow-[0_0_25px_hsl(160_100%_45%/0.06)]"
                  style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `hsl(${stat.color} / 0.1)` }}
                    >
                      <Icon size={16} style={{ color: `hsl(${stat.color})` }} />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
                      <ArrowUpRight size={12} />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground mb-0.5">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Recent Activity - 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-3 rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
          >
            <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  <h2 className="text-sm font-heading font-bold text-foreground">Recent Activity</h2>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">Live Feed</span>
              </div>
              <div className="space-y-1">
                {recentEvents.map((event, i) => {
                  const Icon = event.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${event.color}15` }}>
                        <Icon size={13} style={{ color: event.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground">
                          <span className="font-semibold">{event.user}</span>{" "}
                          <span className="text-muted-foreground">{event.action}</span>
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">{event.time}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Updates - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="lg:col-span-2 rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
          >
            <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <h2 className="text-sm font-heading font-bold text-foreground">What's New</h2>
              </div>
              <div className="space-y-1">
                {updates.map((update, i) => {
                  const Icon = update.icon;
                  return (
                    <div
                      key={update.title}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <Icon size={14} className="text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground truncate">{update.title}</p>
                          {update.tag && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                              update.tag === "New" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                            }`}>
                              {update.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{update.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pro CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg, hsl(280 100% 65% / 0.2), hsl(160 100% 45% / 0.1))" }}
        >
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(20px)" }}>
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.06), transparent 70%)" }} />
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-secondary" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Upgrade to TikUp Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Unlock unlimited overlays, priority TTS, custom branding, advanced analytics, and priority support.
                </p>
              </div>
              <a href="/pro" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0">
                Go Pro <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;
