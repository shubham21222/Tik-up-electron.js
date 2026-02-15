import AppLayout from "@/components/AppLayout";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Eye, Heart, Share2, UserPlus, Radio,
  TrendingUp, ArrowUpRight, Activity, Gift, Star,
  Download, Mic, Gamepad2, Timer, Globe, Crown, ArrowRight,
  Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2, Settings,
  Clock, Gem, RefreshCw, Trophy, Medal, HelpCircle, DollarSign,
  Users, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTikTokLive } from "@/hooks/use-tiktok-live";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import FeatureGuideModal, { type GuideStep } from "@/components/FeatureGuideModal";
import tikupLogo from "@/assets/tikup_logo.png";
import DashboardModeration from "@/components/dashboard/DashboardModeration";
import DashboardFeatures from "@/components/dashboard/DashboardFeatures";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LiveStats {
  is_live: boolean;
  username: string;
  viewer_count: number;
  like_count: number;
  share_count: number;
  follower_count: number;
  diamond_count: number;
  room_id: string;
  title: string;
  start_time: number;
  error?: string;
}

interface RankEntry {
  rank: number;
  diamonds: number;
  diamonds_description: string;
  nickname: string;
  unique_id: string;
  avatar: string;
}

const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
};

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const eventIconMap: Record<string, { icon: typeof Gift; color: string }> = {
  gift:   { icon: Gift, color: "280 100% 65%" },
  like:   { icon: Heart, color: "350 90% 55%" },
  follow: { icon: UserPlus, color: "160 100% 45%" },
  share:  { icon: Share2, color: "200 100% 55%" },
  chat:   { icon: MessageSquare, color: "45 100% 55%" },
  join:   { icon: Users, color: "120 70% 45%" },
};

const formatTimeAgo = (ts: number) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const getEventAction = (type: string, data: Record<string, unknown>) => {
  switch (type) {
    case "gift": return `sent ${data.giftName || "a gift"}${(data.repeatCount as number) > 1 ? ` x${data.repeatCount}` : ""}`;
    case "like": return "liked the stream";
    case "follow": return "just followed";
    case "share": return "shared the stream";
    case "chat": return String(data.message || "commented");
    case "join": return "joined the stream";
    default: return type;
  }
};

const staticEvents = [
  { icon: Gift, user: "StreamFan42", action: "sent a Rose", time: "1s ago", color: "350 90% 55%" },
  { icon: UserPlus, user: "NightOwl", action: "just followed", time: "2s ago", color: "160 100% 45%" },
  { icon: Heart, user: "GiftKing", action: "liked the stream", time: "3s ago", color: "350 90% 55%" },
  { icon: Share2, user: "CoolViewer", action: "shared the stream", time: "8s ago", color: "200 100% 55%" },
  { icon: Star, user: "TikTokPro", action: "sent 5 Stars", time: "15s ago", color: "45 100% 55%" },
  { icon: Gift, user: "MusicLover", action: "sent a Lion", time: "22s ago", color: "280 100% 65%" },
];

const updates = [
  { icon: Download, title: "Desktop App Available", description: "TikUp is now available as a Desktop App for Windows.", tag: "New" },
  { icon: Mic, title: "Voicemod Integration", description: "Let viewers change your voice with Voicemod.", tag: "New" },
  { icon: Gamepad2, title: "GTA 5 Plugin", description: "Let viewers control your GTA 5 game!", tag: "Popular" },
  { icon: Timer, title: "Stream Countdown", description: "Let viewers extend your stream with gifts!" },
  { icon: Globe, title: "Streamer.bot Integration", description: "Connect with Streamer.bot for more features." },
];

// Generate mock chart data for engagement
const generateChartData = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const h = i < 10 ? `0${i}` : `${i}`;
    hours.push({
      hour: `${h}:00`,
      viewers: Math.floor(Math.random() * 800 + 200),
      engagement: Math.floor(Math.random() * 500 + 100),
    });
  }
  return hours;
};

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

function formatDuration(startTime: number): string {
  if (!startTime) return "";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - startTime;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/* ── Glass card wrapper ── */
const GlassCard = ({ children, className = "", style = {}, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-2xl border border-[hsl(0_0%_100%/0.04)] ${className}`}
    style={{
      background: "linear-gradient(180deg, hsl(210 20% 8% / 0.85), hsl(210 15% 6% / 0.9))",
      backdropFilter: "blur(24px)",
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const Index = () => {
  const { user } = useAuth();
  const tikTokLive = useTikTokLive();
  const [isLive, setIsLive] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState("");
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [streamDuration, setStreamDuration] = useState("");
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [showConnectGuide, setShowConnectGuide] = useState(false);
  const [chartData] = useState(generateChartData);
  const statsInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── All existing fetch/connect logic (unchanged) ──
  const fetchLiveStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-stats`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data: LiveStats = await res.json();
      setLiveStats(data);
      setIsLive(data.is_live);
      if (data.is_live && data.start_time) {
        setStreamDuration(formatDuration(data.start_time));
      }
    } catch (err) {
      console.error("Failed to fetch live stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const fetchRankings = useCallback(async () => {
    if (!user) return;
    setRankingsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-rankings?region=GB&rank_type=DAILY_RANK`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await res.json();
      if (data.ranks) setRankings(data.ranks);
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
    } finally {
      setRankingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (connectionStatus === "connected" && user) {
      fetchLiveStats();
      statsInterval.current = setInterval(fetchLiveStats, 30_000);
      durationInterval.current = setInterval(() => {
        if (liveStats?.start_time) {
          setStreamDuration(formatDuration(liveStats.start_time));
        }
      }, 1000);
    }
    return () => {
      if (statsInterval.current) clearInterval(statsInterval.current);
      if (durationInterval.current) clearInterval(durationInterval.current);
    };
  }, [connectionStatus, user, fetchLiveStats, liveStats?.start_time]);

  useEffect(() => {
    if (user) fetchRankings();
  }, [user, fetchRankings]);

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
          } else {
            const seen = localStorage.getItem("tikup_guide_seen_connect_live");
            if (!seen) setShowConnectGuide(true);
          }
        } else {
          const seen = localStorage.getItem("tikup_guide_seen_connect_live");
          if (!seen) setShowConnectGuide(true);
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

  // Auto-connect WebSocket when TikTok account is linked
  useEffect(() => {
    if (connectionStatus === "connected" && tikTokLive.status === "disconnected") {
      tikTokLive.connect();
    }
  }, [connectionStatus]);

  const handleDisconnect = async () => {
    if (!user) return;
    tikTokLive.disconnect();
    await supabase.from("profiles").update({ tiktok_connected: false } as any).eq("user_id", user.id);
    setConnectionStatus("disconnected");
    setTiktokUsername("");
    toast.info("Disconnected from TikTok");
  };

  const connectGuideSteps: GuideStep[] = [
    {
      icon: <Wifi size={20} />,
      title: "Welcome to TikUp!",
      subtitle: "Let's connect your TikTok LIVE in under 30 seconds 💜",
      bullets: [
        "See real-time viewer stats on your dashboard",
        "Trigger alerts when viewers send gifts",
        "Add overlays to your LIVE stream",
        "No developer account needed!",
      ],
      visual: (
        <div className="relative flex items-center justify-center h-full">
          <motion.img src={tikupLogo} alt="TikUp" className="w-16 h-16 object-contain relative z-10"
            animate={{ y: [0, -6, 0], scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 10px hsl(160 100% 50% / 0.3))", "drop-shadow(0 0 22px hsl(160 100% 50% / 0.6))", "drop-shadow(0 0 10px hsl(160 100% 50% / 0.3))"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      ),
    },
    {
      icon: <UserPlus size={20} />,
      title: "Enter Your Username",
      subtitle: "Just type your TikTok @username, that's it!",
      bullets: ["Find the connection box on your dashboard", "Type your TikTok username (no @ needed)", "Hit Connect, done in one click", "We'll automatically find your LIVE stream"],
      visual: (
        <div className="flex items-center justify-center h-full px-6">
          <div className="w-full max-w-[240px]">
            <motion.div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              animate={{ borderColor: ["rgba(255,255,255,0.08)", "hsl(160 100% 50% / 0.3)", "rgba(255,255,255,0.08)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm font-semibold" style={{ color: "hsl(0 0% 40%)" }}>@</span>
              <motion.span className="text-sm font-medium" style={{ color: "hsl(0 0% 70%)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >your_username</motion.span>
            </motion.div>
            <motion.div className="mt-2 rounded-lg py-2 text-center text-xs font-bold"
              style={{ background: "hsl(160 100% 45%)", color: "black" }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            >Connect</motion.div>
          </div>
        </div>
      ),
    },
    {
      icon: <Radio size={20} />,
      title: "Go LIVE on TikTok",
      subtitle: "Start your TikTok LIVE stream as usual",
      bullets: ["Open TikTok and start a LIVE", "TikUp detects your stream automatically", "Stats update in real-time on your dashboard", "All overlays & alerts activate instantly"],
      visual: (
        <div className="flex items-center justify-center h-full">
          <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(160 100% 45% / 0.1)", border: "1px solid hsl(160 100% 45% / 0.2)" }}
            animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0px hsl(160 100% 50% / 0)", "0 0 30px hsl(160 100% 50% / 0.3)", "0 0 0px hsl(160 100% 50% / 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Radio size={24} style={{ color: "hsl(160 100% 50%)" }} />
          </motion.div>
        </div>
      ),
    },
    {
      icon: <Gift size={20} />,
      title: "Add Stream Overlays",
      subtitle: "Make your LIVE stand out with alerts & widgets",
      bullets: ["Gift alerts pop up when viewers send gifts", "Chat overlay shows messages on screen", "Like counters track engagement live", "Copy the overlay URL → paste in OBS"],
      visual: (
        <div className="flex items-center justify-center gap-4 h-full">
          {["🎁", "💬", "❤️"].map((emoji, i) => (
            <motion.div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              animate={{ y: [0, -8, 0], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            >{emoji}</motion.div>
          ))}
        </div>
      ),
    },
    {
      icon: <CheckCircle2 size={20} />,
      title: "You're All Set! 🎉",
      subtitle: "Your TikTok LIVE is now supercharged",
      bullets: ["Dashboard shows live viewer stats", "Alerts trigger on every gift & follow", "Upgrade to PRO for premium animations", "💡 Tip: Check the Overlays page to customize"],
      visual: (
        <div className="flex items-center justify-center h-full">
          <motion.div className="text-5xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >🚀</motion.div>
        </div>
      ),
    },
  ];

  // Merge stats: use the higher of WS real-time or polling data (WS starts at 0, so take max)
  const wsConnected = tikTokLive.status === "connected";
  const pollingViewers = liveStats?.viewer_count ?? 0;
  const pollingLikes = liveStats?.like_count ?? 0;
  const pollingFollowers = liveStats?.follower_count ?? 0;
  const pollingGifts = liveStats?.diamond_count ?? 0;

  const mergedViewers = Math.max(tikTokLive.stats.viewerCount, pollingViewers);
  const mergedLikes = Math.max(tikTokLive.stats.likeCount, pollingLikes);
  const mergedFollowers = pollingFollowers + tikTokLive.stats.followerCount;
  const mergedGifts = Math.max(tikTokLive.stats.giftCoins, pollingGifts);

  /* ── Stat card data ── */
  const statCards = [
    {
      label: "Viewers",
      value: mergedViewers,
      icon: Eye,
      change: wsConnected ? "⚡ Live" : "+12%",
      changeColor: "hsl(160 100% 45%)",
      accentColor: "160 100% 45%",
    },
    {
      label: "Likes",
      value: mergedLikes,
      icon: Heart,
      change: wsConnected ? "⚡ Live" : "+8.4%",
      changeColor: "hsl(350 90% 55%)",
      accentColor: "350 90% 55%",
    },
    {
      label: "Followers",
      value: mergedFollowers,
      icon: Users,
      change: wsConnected ? "⚡ Live" : "+15%",
      changeColor: "hsl(45 100% 55%)",
      accentColor: "200 100% 55%",
    },
    {
      label: "Gifts",
      value: mergedGifts,
      icon: Gift,
      change: wsConnected ? "⚡ Live" : "+5.2%",
      changeColor: "hsl(280 100% 65%)",
      accentColor: "280 100% 65%",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto relative z-10 pb-12">
        {/* ─── HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
              <button onClick={() => setShowConnectGuide(true)}
                className="p-1.5 rounded-full transition-colors hover:bg-muted/40 text-muted-foreground hover:text-foreground">
                <HelpCircle size={16} />
              </button>
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <div className="w-2 h-2 rounded-full bg-destructive absolute inset-0 animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold text-destructive">LIVE</span>
                  {streamDuration && <span className="text-[10px] text-destructive/70">{streamDuration}</span>}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {connectionStatus === "connected"
                ? <>Streaming as <span className="text-primary font-semibold">@{tiktokUsername}</span></>
                : "Connect your TikTok to see live stats"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLiveStats} disabled={statsLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border border-border/30">
              <RefreshCw size={12} className={statsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* ─── DISCORD BANNER (top) ─── */}
        <motion.a
          href="https://discord.gg/8S45FFrd"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.03 }}
          className="block group mb-6"
        >
          <GlassCard className="px-5 py-4 hover:border-[hsl(235_86%_65%/0.2)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "hsl(235 86% 65% / 0.12)", border: "1px solid hsl(235 86% 65% / 0.15)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                    fill="hsl(235 86% 65%)" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-heading font-bold text-foreground">Join the TikUp Discord</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">Get help, share ideas, and connect with other creators</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-[hsl(235_86%_65%)] group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </GlassCard>
        </motion.a>

        {/* ─── CONNECTION BANNER (compact) ─── */}
        {connectionStatus !== "connected" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}>
                    <WifiOff size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-heading font-bold text-foreground">Connect TikTok</h3>
                    <p className="text-[11px] text-muted-foreground">Enter your username to power your stream</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">@</span>
                    <input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      disabled={connectionStatus === "connecting"}
                      className="w-full md:w-44 bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={connectionStatus === "connecting"}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
                  >
                    {connectionStatus === "connecting" && <Loader2 size={14} className="animate-spin" />}
                    Connect
                  </button>
                </div>
              </div>
              {connectionError && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle size={12} />
                  {connectionError}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* ─── CONNECTED BAR ─── */}
        {connectionStatus === "connected" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-6"
          >
            <GlassCard className="px-5 py-3 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">Connected</span>
                <span className="text-xs text-muted-foreground">@{tiktokUsername}</span>
              </div>
              <div className="md:ml-auto flex items-center gap-3 flex-wrap">
                {isLive && liveStats?.title && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{liveStats.title}</span>
                )}
                <Link to="/setup" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Settings size={11} /> Settings
                </Link>
                <button onClick={handleDisconnect} className="text-[11px] text-destructive/70 hover:text-destructive transition-colors">
                  Disconnect
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ─── STAT CARDS (reference style) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
              >
                <GlassCard className="p-5 hover:border-[hsl(0_0%_100%/0.08)] transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity"
                      style={{ background: `hsl(${stat.accentColor} / 0.1)` }}>
                      <Icon size={14} style={{ color: `hsl(${stat.accentColor})` }} />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <span className="text-[11px] font-semibold" style={{ color: stat.changeColor }}>
                    {stat.change}
                  </span>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* ─── ENGAGEMENT CHART ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <h2 className="text-sm font-heading font-bold text-foreground">Engagement</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-sm" style={{ background: "hsl(160 100% 45%)" }} /> Viewers
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-sm" style={{ background: "hsl(160 100% 30%)" }} /> Engagement
                </span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(0 0% 35%)", fontSize: 10 }}
                    interval={3}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(210 15% 8%)",
                      border: "1px solid hsl(0 0% 15%)",
                      borderRadius: "10px",
                      fontSize: 11,
                      color: "hsl(0 0% 88%)",
                    }}
                    cursor={{ fill: "hsl(0 0% 100% / 0.03)" }}
                  />
                  <Bar dataKey="viewers" radius={[3, 3, 0, 0]} maxBarSize={18}>
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill="hsl(160 100% 45%)" fillOpacity={0.7 + Math.random() * 0.3} />
                    ))}
                  </Bar>
                  <Bar dataKey="engagement" radius={[3, 3, 0, 0]} maxBarSize={18}>
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill="hsl(160 60% 28%)" fillOpacity={0.6 + Math.random() * 0.3} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── STREAM FEATURES ─── */}
        <DashboardFeatures />

        {/* ─── RECENT ACTIVITY FEED ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-6"
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <h2 className="text-sm font-heading font-bold text-foreground">Recent Activity</h2>
              </div>
              {wsConnected ? (
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary absolute inset-0 animate-ping" />
                  </div>
                  <span className="text-[10px] text-primary font-semibold">Live</span>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground">Demo</span>
              )}
            </div>
            <div className="space-y-0.5">
              {wsConnected && tikTokLive.events.length > 0 ? (
                <AnimatePresence initial={false}>
                  {tikTokLive.events.slice(0, 15).map((event, i) => {
                    const cfg = eventIconMap[event.type] || { icon: Activity, color: "0 0% 50%" };
                    const Icon = cfg.icon;
                    const username = String(event.data.username || "Unknown");
                    const action = getEventAction(event.type, event.data);
                    return (
                      <motion.div
                        key={`${event.type}-${event.timestamp}-${i}`}
                        initial={{ opacity: 0, x: -12, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: 12, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(0_0%_100%/0.02)] transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: `hsl(${cfg.color} / 0.1)` }}>
                          <Icon size={12} style={{ color: `hsl(${cfg.color})` }} />
                        </div>
                        <p className="text-[13px] text-foreground flex-1 truncate">
                          <span className="font-semibold">{username}</span>{" "}
                          <span className="text-muted-foreground">{action}</span>
                        </p>
                        <span className="text-[11px] text-muted-foreground/50">{formatTimeAgo(event.timestamp)}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : wsConnected ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Waiting for stream events…
                </div>
              ) : (
                staticEvents.map((event, i) => {
                  const Icon = event.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(0_0%_100%/0.02)] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: `hsl(${event.color} / 0.1)` }}>
                        <Icon size={12} style={{ color: `hsl(${event.color})` }} />
                      </div>
                      <p className="text-[13px] text-foreground flex-1">
                        <span className="font-semibold">{event.user}</span>{" "}
                        <span className="text-muted-foreground">{event.action}</span>
                      </p>
                      <span className="text-[11px] text-muted-foreground/50">{event.time}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── MODERATION ─── */}
        <DashboardModeration />

        {/* ─── RANKINGS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-secondary" />
                <h2 className="text-sm font-heading font-bold text-foreground">TikTok LIVE Rankings</h2>
                <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-md bg-muted/30">Daily · GB</span>
              </div>
              <button onClick={fetchRankings} disabled={rankingsLoading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw size={12} className={rankingsLoading ? "animate-spin" : ""} />
              </button>
            </div>
            {rankingsLoading && rankings.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                <Loader2 size={16} className="animate-spin mr-2" /> Loading…
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No ranking data</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {rankings.slice(0, 8).map((entry, i) => {
                  const medalEmojis = ["🥇", "🥈", "🥉"];
                  const isTop3 = i < 3;
                  const rankColors = ["45 100% 55%", "0 0% 65%", "25 70% 45%"];
                  return (
                    <div
                      key={entry.unique_id || i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(0_0%_100%/0.02)] transition-colors"
                      style={{
                        background: isTop3 ? `linear-gradient(90deg, hsl(${rankColors[i]} / 0.04), transparent)` : undefined,
                        border: isTop3 ? `1px solid hsl(${rankColors[i]} / 0.08)` : "1px solid transparent",
                      }}
                    >
                      <span className="text-sm font-heading font-bold w-6 text-center">
                        {isTop3 ? medalEmojis[i] : <span className="text-[11px] text-muted-foreground">#{entry.rank}</span>}
                      </span>
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.nickname} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                          {entry.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate">{entry.nickname}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{entry.unique_id}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Gem size={11} style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }} />
                        <span className="text-[11px] font-bold" style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }}>
                          {entry.diamonds?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* ─── WHAT'S NEW ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="mb-6">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-bold text-foreground">What's New</h2>
            </div>
            <div className="space-y-0.5">
              {updates.map((update) => {
                const Icon = update.icon;
                return (
                  <div key={update.title}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(0_0%_100%/0.02)] transition-colors cursor-pointer group">
                    <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-foreground truncate">{update.title}</p>
                        {update.tag && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            update.tag === "New" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          }`}>{update.tag}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{update.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── PRO CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <GlassCard className="p-6 relative overflow-hidden" style={{
            background: "linear-gradient(135deg, hsl(280 50% 10% / 0.6), hsl(210 15% 6% / 0.9))",
            border: "1px solid hsl(280 100% 65% / 0.1)",
          }}>
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.06), transparent 70%)" }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={18} className="text-secondary" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Upgrade to TikUp Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Unlimited overlays, priority TTS, custom branding, advanced analytics & priority support.
                </p>
              </div>
              <Link to="/pro" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shrink-0 w-full md:w-auto justify-center">
                Go Pro <ArrowRight size={14} />
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <FeatureGuideModal
        open={showConnectGuide}
        onClose={() => setShowConnectGuide(false)}
        featureKey="connect_live"
        title="Connect Your LIVE"
        steps={connectGuideSteps}
      />
    </AppLayout>
  );
};

export default Index;
