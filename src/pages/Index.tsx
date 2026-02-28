import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { devError } from "@/lib/dev-log";
import {
  Eye, Heart, Users, Gift, Star,
  Download, Mic, Gamepad2, Timer, Globe, Crown, ArrowRight,
  Wifi, UserPlus, Radio, CheckCircle2,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTikTokLiveGlobal } from "@/hooks/use-tiktok-live-context";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import FeatureGuideModal, { type GuideStep } from "@/components/FeatureGuideModal";
import tikupLogo from "@/assets/tikup_logo.png";
import DashboardModeration from "@/components/dashboard/DashboardModeration";
import DashboardFeatures from "@/components/dashboard/DashboardFeatures";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConnectionBanner from "@/components/dashboard/ConnectionBanner";
import DashboardStatCards, { type StatCardData } from "@/components/dashboard/DashboardStatCards";
import GiftActivityFeed from "@/components/dashboard/GiftActivityFeed";
import DashboardRankings, { type RankEntry } from "@/components/dashboard/DashboardRankings";
import GlassCard from "@/components/ui/glass-card";

interface LiveStats {
  is_live: boolean;
  username: string;
  viewer_count: number;
  like_count: number;
  share_count: number;
  follower_count: number;
  diamond_count: number;
  session_followers: number;
  room_id: string;
  title: string;
  start_time: number;
  error?: string;
}

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
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

const updates = [
  { icon: Download, title: "Desktop App Available", description: "TikUp is now available as a Desktop App for Windows.", tag: "New" },
  { icon: Mic, title: "Voicemod Integration", description: "Let viewers change your voice with Voicemod.", tag: "New" },
  { icon: Gamepad2, title: "GTA 5 Plugin", description: "Let viewers control your GTA 5 game!", tag: "Popular" },
  { icon: Timer, title: "Stream Countdown", description: "Let viewers extend your stream with gifts!" },
  { icon: Globe, title: "Streamer.bot Integration", description: "Connect with Streamer.bot for more features." },
];

const Index = () => {
  const { user } = useAuth();
  const tikTokLive = useTikTokLiveGlobal();

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
  const [rankingsRegion, setRankingsRegion] = useState("gb");
  const [showConnectGuide, setShowConnectGuide] = useState(false);
  const prevStatsRef = useRef<{ viewers: number; likes: number; followers: number; gifts: number }>({ viewers: 0, likes: 0, followers: 0, gifts: 0 });
  const peakStatsRef = useRef<{ likes: number; gifts: number; followers: number }>({ likes: 0, gifts: 0, followers: 0 });
  const statsInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch logic ──
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
      devError("Failed to fetch live stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const fetchRankings = useCallback(async (region?: string) => {
    if (!user) return;
    const r = region || rankingsRegion;
    setRankingsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-rankings?region=${encodeURIComponent(r)}`,
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
      devError("Failed to fetch rankings:", err);
    } finally {
      setRankingsLoading(false);
    }
  }, [user, rankingsRegion]);

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
    setLiveStats(null);
    peakStatsRef.current = { likes: 0, gifts: 0, followers: 0 };
    prevStatsRef.current = { viewers: 0, likes: 0, followers: 0, gifts: 0 };
    setConnectionStatus("connected");
    toast.success(`Connected to @${clean}`);
  }, [inputUsername, user]);

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
    setLiveStats(null);
    peakStatsRef.current = { likes: 0, gifts: 0, followers: 0 };
    prevStatsRef.current = { viewers: 0, likes: 0, followers: 0, gifts: 0 };
    toast.info("Disconnected from TikTok");
  };

  const handleRankingsRegionChange = useCallback((region: string) => {
    setRankingsRegion(region);
    fetchRankings(region);
  }, [fetchRankings]);

  // ── Connect guide steps ──
  const connectGuideSteps: GuideStep[] = [
    {
      icon: <Wifi size={20} />,
      title: "Welcome to TikUp!",
      subtitle: "Let's connect your TikTok LIVE in under 30 seconds 💜",
      bullets: ["See real-time viewer stats on your dashboard", "Trigger alerts when viewers send gifts", "Add overlays to your LIVE stream", "No developer account needed!"],
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

  // ── Merged stats ──
  const wsConnected = tikTokLive.status === "connected";
  const pollingViewers = liveStats?.viewer_count ?? 0;
  const pollingLikes = liveStats?.like_count ?? 0;
  const pollingFollowers = liveStats?.follower_count ?? 0;
  const pollingGifts = liveStats?.diamond_count ?? 0;
  const sessionFollowersFromDB = liveStats?.session_followers ?? 0;

  const mergedViewers = Math.max(tikTokLive.stats.viewerCount, pollingViewers);
  const rawLikes = Math.max(tikTokLive.stats.likeCount, pollingLikes);
  const rawGifts = Math.max(tikTokLive.stats.giftCoins, pollingGifts);
  const rawFollowers = pollingFollowers > 0 ? pollingFollowers : 0;
  const rawSessionFollowers = Math.max(sessionFollowersFromDB, tikTokLive.stats.followerCount);

  peakStatsRef.current.likes = Math.max(peakStatsRef.current.likes, rawLikes);
  peakStatsRef.current.gifts = Math.max(peakStatsRef.current.gifts, rawGifts);
  peakStatsRef.current.followers = Math.max(peakStatsRef.current.followers, rawFollowers);

  const mergedLikes = peakStatsRef.current.likes;
  const mergedGifts = peakStatsRef.current.gifts;
  const mergedFollowers = peakStatsRef.current.followers;

  useEffect(() => {
    if (wsConnected && (mergedViewers > 0 || mergedLikes > 0)) {
      const timer = setTimeout(() => {
        prevStatsRef.current = { viewers: mergedViewers, likes: mergedLikes, followers: mergedFollowers, gifts: mergedGifts };
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [wsConnected, mergedViewers, mergedLikes, mergedFollowers, mergedGifts]);

  const calcChange = (current: number, previous: number): string => {
    if (!wsConnected) return "—";
    if (previous === 0 && current === 0) return "—";
    if (previous === 0) return `+${current}`;
    const pct = ((current - previous) / previous) * 100;
    if (pct === 0) return "—";
    return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous: number): string => {
    if (previous === 0 || current === previous) return "hsl(0 0% 50%)";
    return current > previous ? "hsl(160 100% 45%)" : "hsl(0 70% 55%)";
  };

  const statCards: StatCardData[] = [
    {
      label: "Viewers",
      value: mergedViewers,
      icon: Eye,
      change: wsConnected ? (mergedViewers > 0 ? `⚡ ${mergedViewers} watching` : "⚡ Live") : "—",
      changeColor: wsConnected ? "hsl(160 100% 45%)" : "hsl(0 0% 40%)",
      accentColor: "160 100% 45%",
    },
    {
      label: "Likes",
      value: mergedLikes,
      icon: Heart,
      change: wsConnected ? calcChange(mergedLikes, prevStatsRef.current.likes) : "—",
      changeColor: wsConnected ? getChangeColor(mergedLikes, prevStatsRef.current.likes) : "hsl(0 0% 40%)",
      accentColor: "350 90% 55%",
    },
    {
      label: "Followers",
      value: mergedFollowers,
      icon: Users,
      change: wsConnected ? (rawSessionFollowers > 0 ? `+${rawSessionFollowers} this stream` : "⚡ Live") : "—",
      changeColor: wsConnected ? "hsl(45 100% 55%)" : "hsl(0 0% 40%)",
      accentColor: "200 100% 55%",
    },
    {
      label: "Gifts",
      value: mergedGifts,
      icon: Gift,
      change: wsConnected ? (mergedGifts > 0 ? `💎 ${formatCompact(mergedGifts)} diamonds earned` : "⚡ Waiting for gifts") : "—",
      changeColor: wsConnected ? "hsl(280 100% 65%)" : "hsl(0 0% 40%)",
      accentColor: "280 100% 65%",
      prefix: "💎 ",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto relative z-10 pb-12">
        <DashboardHeader
          isLive={isLive}
          streamDuration={streamDuration}
          connectionStatus={connectionStatus}
          tiktokUsername={tiktokUsername}
          statsLoading={statsLoading}
          onRefresh={fetchLiveStats}
          onShowGuide={() => setShowConnectGuide(true)}
        />

        {/* ─── DISCORD BANNER ─── */}
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

        <ConnectionBanner
          connectionStatus={connectionStatus}
          tiktokUsername={tiktokUsername}
          inputUsername={inputUsername}
          connectionError={connectionError}
          isLive={isLive}
          streamTitle={liveStats?.title}
          onInputChange={setInputUsername}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        <DashboardStatCards statCards={statCards} />

        <DashboardFeatures />

        <GiftActivityFeed
          wsConnected={wsConnected}
          events={tikTokLive.events}
        />

        <DashboardModeration />

        <DashboardRankings
          rankings={rankings}
          rankingsLoading={rankingsLoading}
          rankingsRegion={rankingsRegion}
          onRegionChange={handleRankingsRegionChange}
          onRefresh={() => fetchRankings()}
        />

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
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors cursor-pointer group">
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
          <GlassCard className="p-6 relative overflow-hidden dark:border-[hsl(280_100%_65%/0.1)]" style={{
            background: undefined,
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
