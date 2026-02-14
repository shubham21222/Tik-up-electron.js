import AppLayout from "@/components/AppLayout";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Eye, Heart, Share2, UserPlus, Radio,
  TrendingUp, ArrowUpRight, Activity, Gift, Star,
  Download, Mic, Gamepad2, Timer, Globe, Crown, ArrowRight,
  Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2, Settings,
  Clock, Gem, RefreshCw, Trophy, Medal, HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import FeatureGuideModal, { type GuideStep } from "@/components/FeatureGuideModal";
import tikupLogo from "@/assets/tikup_logo.png";

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

const Index = () => {
  const { user } = useAuth();
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
  const statsInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Poll live stats every 30s when connected
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

  // Fetch rankings on mount
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
            // First-time user — show guide if never seen
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

  const handleDisconnect = async () => {
    if (!user) return;
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
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width: 5 + Math.random() * 5, height: 5 + Math.random() * 5, background: i % 2 === 0 ? "hsl(160 100% 50% / 0.5)" : "hsl(280 100% 65% / 0.4)" }}
              animate={{ x: [0, (Math.random() - 0.5) * 70], y: [0, (Math.random() - 0.5) * 50], opacity: [0, 0.8, 0] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      ),
    },
    {
      icon: <UserPlus size={20} />,
      title: "Enter Your Username",
      subtitle: "Just type your TikTok @username — that's it!",
      bullets: [
        "Find the connection box on your dashboard",
        "Type your TikTok username (no @ needed)",
        "Hit Connect — done in one click",
        "We'll automatically find your LIVE stream",
      ],
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
              >
                your_username
              </motion.span>
            </motion.div>
            <motion.div className="mt-2 rounded-lg py-2 text-center text-xs font-bold"
              style={{ background: "hsl(160 100% 45%)", color: "black" }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            >
              Connect
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      icon: <Radio size={20} />,
      title: "Go LIVE on TikTok",
      subtitle: "Start your TikTok LIVE stream as usual",
      bullets: [
        "Open TikTok and start a LIVE",
        "TikUp detects your stream automatically",
        "Stats update in real-time on your dashboard",
        "All overlays & alerts activate instantly",
      ],
      visual: (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(160 100% 45% / 0.1)", border: "1px solid hsl(160 100% 45% / 0.2)" }}
              animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0px hsl(160 100% 50% / 0)", "0 0 30px hsl(160 100% 50% / 0.3)", "0 0 0px hsl(160 100% 50% / 0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Radio size={24} style={{ color: "hsl(160 100% 50%)" }} />
            </motion.div>
            <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: "hsl(0 80% 50%)", color: "white" }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ●
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      icon: <Gift size={20} />,
      title: "Add Stream Overlays",
      subtitle: "Make your LIVE stand out with alerts & widgets",
      bullets: [
        "Gift alerts pop up when viewers send gifts",
        "Chat overlay shows messages on screen",
        "Like counters track engagement live",
        "Copy the overlay URL → paste in OBS",
      ],
      visual: (
        <div className="flex items-center justify-center gap-4 h-full">
          {["🎁", "💬", "❤️"].map((emoji, i) => (
            <motion.div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              animate={{ y: [0, -8, 0], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      icon: <CheckCircle2 size={20} />,
      title: "You're All Set! 🎉",
      subtitle: "Your TikTok LIVE is now supercharged",
      bullets: [
        "Dashboard shows live viewer stats",
        "Alerts trigger on every gift & follow",
        "Upgrade to PRO for premium animations",
        "💡 Tip: Check the Overlays page to customize",
      ],
      visual: (
        <div className="flex items-center justify-center h-full">
          <motion.div className="text-5xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚀
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
              style={{ background: ["hsl(280 100% 65%)", "hsl(160 100% 50%)", "hsl(45 100% 60%)"][i % 3] }}
              animate={{ x: [0, (Math.random() - 0.5) * 100], y: [0, (Math.random() - 0.5) * 70], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      ),
    },
  ];

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
              Your Stream HQ
            </h1>
            <button
              onClick={() => setShowConnectGuide(true)}
              className="p-2 rounded-full transition-colors hover:bg-muted/40"
              style={{ color: "hsl(280 100% 70%)" }}
              title="How to connect"
            >
              <HelpCircle size={20} />
            </button>
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
            Everything you need for your next LIVE — all in one place.
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
                    <h2 className="text-xl font-heading font-bold text-foreground">Your TikTok Account</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {connectionStatus === "connected"
                        ? <>Streaming as <span className="text-primary font-semibold">@{tiktokUsername}</span></>
                        : "Enter your TikTok username so we can power your stream effects"}
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
                    Connection Settings
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Discord Banner */}
        <motion.a
          href="https://discord.gg/8S45FFrd"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="mb-8 rounded-2xl p-[1px] block group cursor-pointer"
          style={{ background: "linear-gradient(135deg, hsl(235 86% 65% / 0.35), hsl(235 86% 65% / 0.08))" }}
        >
          <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden flex items-center gap-6"
            style={{ background: "rgba(20,25,35,0.8)", backdropFilter: "blur(24px)" }}>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse, hsl(235 86% 65% / 0.08), transparent 70%)" }} />

            {/* Discord icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(235 86% 65% / 0.15)", border: "1px solid hsl(235 86% 65% / 0.2)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  fill="hsl(235 86% 65%)" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 relative z-10">
              <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">Join the TikUp Discord</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get help, share ideas, and connect with other creators
              </p>
            </div>

            {/* Arrow */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:translate-x-1"
              style={{ background: "hsl(235 86% 65% / 0.1)", border: "1px solid hsl(235 86% 65% / 0.15)" }}>
              <ArrowRight size={18} style={{ color: "hsl(235 86% 65%)" }} />
            </div>
          </div>
        </motion.a>

        {/* Live Stats Grid */}
        {(() => {
          const liveStatsCards = [
            { label: "Watching Now", value: liveStats?.viewer_count ?? 0, icon: Eye, color: "160 100% 45%" },
            { label: "Hearts", value: liveStats?.like_count ?? 0, icon: Heart, color: "350 90% 55%" },
            { label: "Shares", value: liveStats?.share_count ?? 0, icon: Share2, color: "200 100% 55%" },
            { label: "New Followers", value: liveStats?.follower_count ?? 0, icon: UserPlus, color: "160 100% 45%" },
            { label: "Diamonds Earned", value: liveStats?.diamond_count ?? 0, icon: Gem, color: "45 100% 55%" },
          ];

          return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {liveStatsCards.map((stat, i) => {
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
                        {isLive && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
                            <Radio size={10} className="animate-pulse" />
                            LIVE
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-heading font-bold text-foreground mb-0.5">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })()}

        {/* Stream Info Bar */}
        {isLive && liveStats?.title && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4 px-5 py-3 rounded-xl border border-primary/10"
            style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-2 text-xs text-primary font-semibold">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-destructive absolute inset-0 animate-ping" />
              </div>
              LIVE
            </div>
            <p className="text-sm text-foreground font-medium flex-1 truncate">{liveStats.title}</p>
            {streamDuration && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                {streamDuration}
              </div>
            )}
            <button
              onClick={fetchLiveStats}
              disabled={statsLoading}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw size={12} className={statsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </motion.div>
        )}

        {/* TikTok LIVE Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-8 rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
        >
          <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-secondary" />
                <h2 className="text-sm font-heading font-bold text-foreground">TikTok LIVE Rankings</h2>
                <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-md bg-muted/30">Daily · GB</span>
              </div>
              <button
                onClick={fetchRankings}
                disabled={rankingsLoading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw size={12} className={rankingsLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {rankingsLoading && rankings.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                <Loader2 size={16} className="animate-spin mr-2" />
                Loading rankings...
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No ranking data available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {rankings.slice(0, 8).map((entry, i) => {
                  const medalEmojis = ["🥇", "🥈", "🥉"];
                  const isTop3 = i < 3;
                  const rankColors = ["45 100% 55%", "0 0% 65%", "25 70% 45%"];
                  return (
                    <motion.div
                      key={entry.unique_id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/20 transition-colors"
                      style={{
                        background: isTop3
                          ? `linear-gradient(90deg, hsl(${rankColors[i]} / 0.05), transparent)`
                          : "transparent",
                        border: isTop3
                          ? `1px solid hsl(${rankColors[i]} / 0.1)`
                          : "1px solid transparent",
                      }}
                    >
                      <span className="text-sm font-heading font-bold w-6 text-center">
                        {isTop3 ? medalEmojis[i] : (
                          <span className="text-[11px] text-muted-foreground">#{entry.rank}</span>
                        )}
                      </span>
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.nickname}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                          {entry.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate">{entry.nickname}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{entry.unique_id}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Gem size={11} style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }} />
                        <span className="text-[11px] font-bold" style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }}>
                          {entry.diamonds?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

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
