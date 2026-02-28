import { motion, useMotionValue, useTransform, animate, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Check, ArrowRight, Zap, Target, Volume2, BarChart3, Shield, Sparkles,
  Heart, Gift, UserPlus, Eye, Share2, Brain, Rocket, Crown, Star,
  Monitor, Play, Download, User
} from "lucide-react";
import { Link } from "react-router-dom";
import tikupLogo from "@/assets/tikup_logo.png";

/* ─── Data ─── */
const features = [
  { icon: Target, title: "Stream Goals", desc: "Set a follower, like, or gift goal and your viewers see it update in real-time on screen." },
  { icon: Zap, title: "Instant Reactions", desc: "When someone sends a gift or follows, your stream reacts instantly with animations and sounds." },
  { icon: Volume2, title: "Sound Effects", desc: "Viewers trigger sound effects with gifts and chat commands. You pick the sounds." },
  { icon: BarChart3, title: "See Who's Watching", desc: "Track viewers, likes, shares, and diamonds as they happen. All on one screen." },
  { icon: Shield, title: "Chat Protection", desc: "Auto-block spam, caps, and toxic messages so you can focus on creating." },
  { icon: Sparkles, title: "Ready-Made Effects", desc: "Leaderboards, polls, giveaways, all plug-and-play. No setup required." },
];

const liveEvents = [
  { icon: Heart, text: "+1,245 Likes", color: "350 90% 55%" },
  { icon: Gift, text: "🎁 Rose Gift", color: "280 100% 65%" },
  { icon: UserPlus, text: "+1 Follower", color: "160 100% 45%" },
  { icon: Eye, text: "Viewers: 342", color: "45 100% 55%" },
  { icon: Share2, text: "+3 Shares", color: "200 100% 55%" },
  { icon: Star, text: "⭐ 5 Stars", color: "45 100% 55%" },
  { icon: Heart, text: "+892 Likes", color: "350 90% 55%" },
  { icon: Gift, text: "🎁 Lion Gift", color: "280 100% 65%" },
];

const whyChoose = [
  { icon: Zap, title: "60-Second Setup", desc: "Enter your TikTok username, pick a preset, and your stream effects are live. That's it." },
  { icon: Brain, title: "No Tech Skills Needed", desc: "We don't make you build logic diagrams. Just choose what happens when viewers interact." },
  { icon: Rocket, title: "Works Everywhere", desc: "Copy one link into OBS or TikTok Live Studio. No plugins, no downloads, no friction." },
];

const proFeatures = [
  "Real-time TikTok overlays",
  "OBS & TikTok Live Studio integration",
  "Custom alerts & animations",
  "Goal overlays with 5 style presets",
  "Engagement tracking dashboard",
  "Unlimited custom goals",
  "Soundboard with unlimited sounds",
  "Chat commands & auto-moderation",
  "Priority support",
];

const freeFeatures = [
  "3 basic overlays",
  "Standard alerts",
  "Basic chat commands",
  "Community support",
];

/* ─── Animated Counter ─── */
const AnimNum = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `${Math.round(v).toLocaleString()}${suffix}`);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2.5, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
};

/* ─── Floating Particles ─── */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 2 + Math.random() * 3,
          height: 2 + Math.random() * 3,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `hsl(160 100% 45% / ${0.08 + Math.random() * 0.12})`,
        }}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          x: [0, (Math.random() - 0.5) * 20, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ─── Grid Pattern ─── */
const GridPattern = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.03 }}>
    <svg width="100%" height="100%">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

/* ─── Live Event Strip ─── */
const LiveEventStrip = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % liveEvents.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 overflow-hidden h-10">
      {liveEvents.map((event, i) => {
        const Icon = event.icon;
        const isVisible = i === visibleIndex || i === (visibleIndex + 1) % liveEvents.length || i === (visibleIndex + 2) % liveEvents.length || i === (visibleIndex + 3) % liveEvents.length;
        if (!isVisible) return null;
        return (
          <motion.div
            key={`${event.text}-${i}`}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-4 py-2 rounded-full flex-shrink-0"
            style={{
              background: `hsl(${event.color} / 0.08)`,
              border: `1px solid hsl(${event.color} / 0.15)`,
            }}
          >
            <Icon size={14} style={{ color: `hsl(${event.color})` }} />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{event.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Dashboard Mockup ─── */
const DashboardMockup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const springRotate = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ perspective: 1000 }} className="relative">
      {/* Glow behind */}
      <div className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(160 100% 45% / 0.06), transparent 70%)" }} />

      <motion.div
        style={{ rotateX: springRotate, scale: springScale }}
        className="rounded-2xl p-[1px] relative"
      >
        <div className="absolute -inset-[1px] rounded-2xl"
          style={{ background: "linear-gradient(135deg, hsl(160 100% 45% / 0.2), hsl(280 100% 65% / 0.08), hsl(160 100% 45% / 0.05))" }} />

        <div className="relative rounded-2xl overflow-hidden" style={{ background: "rgba(8,12,18,0.95)", backdropFilter: "blur(20px)" }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(45 100% 55% / 0.6)" }} />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-[11px] text-muted-foreground/40 font-mono ml-3">tikup.app/dashboard</span>
          </div>

          {/* Mock dashboard content */}
          <div className="p-6">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Viewers", val: "1,247", change: "+12%", color: "160 100% 45%" },
                { label: "Likes", val: "84.3K", change: "+8.4%", color: "350 90% 55%" },
                { label: "Followers", val: "892", change: "+15%", color: "200 100% 55%" },
                { label: "Revenue", val: "$324", change: "+5.2%", color: "45 100% 55%" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <p className="text-[10px] text-muted-foreground/50 mb-1">{stat.label}</p>
                  <p className="text-lg font-heading font-bold text-foreground">{stat.val}</p>
                  <p className="text-[10px] font-medium" style={{ color: `hsl(${stat.color})` }}>{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Mock chart area */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <div className="flex items-end gap-1 h-20">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{ background: `hsl(160 100% 45% / ${0.15 + Math.random() * 0.35})` }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${20 + Math.random() * 80}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
            </div>

            {/* Mock events */}
            <div className="space-y-1.5">
              {["StreamFan42 sent a Rose", "NightOwl just followed", "GiftKing liked the stream"].map((e, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.015)" }}>
                  <div className="w-5 h-5 rounded-full bg-primary/10" />
                  <span className="text-[11px] text-muted-foreground/60">{e}</span>
                  <span className="text-[9px] text-muted-foreground/30 ml-auto">{i + 1}s ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Sticky Navbar ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.5)",
          backdropFilter: "blur(24px)",
          borderBottom: scrolled ? "1px solid hsl(0 0% 100% / 0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Link
              to="/download"
              className="h-9 px-4 text-[13px] font-medium tracking-wide text-muted-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] whitespace-nowrap"
            >
              <Download size={13} strokeWidth={2} />
              Download
            </Link>
            <Link
              to="/auth"
              className="h-9 px-4 text-[13px] font-medium tracking-wide text-muted-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] whitespace-nowrap"
            >
              <User size={13} strokeWidth={2} />
              Log in
            </Link>
            <Link
              to="/auth"
              className="h-9 px-5 text-[13px] font-semibold tracking-wide text-primary-foreground flex items-center gap-1.5 rounded-lg bg-primary hover:brightness-110 transition-all duration-200 whitespace-nowrap"
            >
              Sign Up
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden min-h-[85vh] flex items-center">
        <GridPattern />
        <FloatingParticles />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.08), transparent 65%)" }} />
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse, hsl(280 100% 65%), transparent 70%)" }}
        />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          {/* Hero Logo with Stars */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-block mb-4"
          >
            {/* Radial glow behind logo */}
            <motion.div
              className="absolute inset-0 -m-16 rounded-full pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "radial-gradient(circle, hsl(160 100% 45% / 0.12), hsl(280 100% 65% / 0.04) 50%, transparent 70%)" }}
            />

            {/* Orbiting stars */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * 360;
              const radius = 90 + (i % 3) * 25;
              const size = [10, 14, 8, 12, 6, 16, 9, 11, 7, 13, 10, 8][i];
              const delay = i * 0.3;
              const duration = 2.5 + (i % 4) * 0.5;
              return (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: size,
                    height: size,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0.6, 1, 0],
                    scale: [0, 1.2, 0.8, 1, 0],
                    x: [0, Math.cos((angle * Math.PI) / 180) * radius, Math.cos(((angle + 30) * Math.PI) / 180) * (radius + 20)],
                    y: [0, Math.sin((angle * Math.PI) / 180) * radius, Math.sin(((angle + 30) * Math.PI) / 180) * (radius + 20)],
                  }}
                  transition={{
                    duration,
                    delay: delay,
                    repeat: Infinity,
                    repeatDelay: 1 + (i % 3),
                    ease: "easeOut",
                  }}
                >
                  <Star
                    size={size}
                    className="drop-shadow-[0_0_6px_hsl(160,100%,60%)]"
                    fill="hsl(160 100% 55%)"
                    color="hsl(160 100% 70%)"
                  />
                </motion.div>
              );
            })}

            {/* Secondary sparkle particles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 360 + 22;
              const radius = 70 + (i % 2) * 40;
              const delay = 0.5 + i * 0.4;
              return (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: 4,
                    height: 4,
                    background: i % 2 === 0 ? "hsl(280 100% 75%)" : "hsl(45 100% 70%)",
                    boxShadow: i % 2 === 0
                      ? "0 0 8px hsl(280 100% 65%), 0 0 16px hsl(280 100% 65% / 0.3)"
                      : "0 0 8px hsl(45 100% 60%), 0 0 16px hsl(45 100% 60% / 0.3)",
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: [0, Math.cos((angle * Math.PI) / 180) * radius],
                    y: [0, Math.sin((angle * Math.PI) / 180) * radius],
                  }}
                  transition={{
                    duration: 2,
                    delay,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeOut",
                  }}
                />
              );
            })}

            {/* The logo */}
            <motion.img
              src={tikupLogo}
              alt="TikUp"
              className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] object-contain relative z-10 drop-shadow-[0_0_60px_hsl(160,100%,45%,0.35)]"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px hsl(160 100% 45% / 0.2))",
                  "drop-shadow(0 0 40px hsl(160 100% 45% / 0.35))",
                  "drop-shadow(0 0 20px hsl(160 100% 45% / 0.2))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Micro-text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-3"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-primary"
              style={{ background: "hsl(160 100% 45% / 0.06)", border: "1px solid hsl(160 100% 45% / 0.12)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Built for Creators, Not Developers
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-heading font-extrabold text-foreground mb-7 tracking-tighter leading-[0.95]"
          >
            Dominate Your{" "}
            <span className="relative inline-block">
              <span className="text-gradient-primary">TikTok Live</span>
              {/* Shimmer effect */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(160 100% 80% / 0.15) 50%, transparent 100%)",
                  WebkitBackgroundClip: "text",
                }}
                animate={{ x: ["-150%", "150%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
              {/* Soft glow behind text */}
              <div className="absolute -inset-4 -z-10 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.1), transparent 70%)" }} />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Set up live effects in under 60 seconds. No downloads, no wiring or tech skills needed. Just pick a vibe and go live.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Link
              to="/auth"
              className="group px-9 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_40px_hsl(160_100%_45%/0.35),0_0_80px_hsl(160_100%_45%/0.1)] flex items-center gap-2.5 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                See Your Stream Effects in 60 Seconds
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              {/* Button shimmer */}
              <motion.div
                className="absolute inset-0 z-0"
                style={{ background: "linear-gradient(90deg, transparent, hsl(160 100% 80% / 0.15), transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
              />
            </Link>
            <Link
              to="/auth"
              className="group px-9 py-4 rounded-xl font-bold text-base text-foreground hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Play size={14} className="text-primary" />
              View Demo
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground/50 font-medium"
          >
            Join <span className="text-muted-foreground">2,000+</span> creators who grew their streams with TikUp
          </motion.p>
        </div>
      </section>

      {/* ── Live Demo Strip ── */}
      <section className="py-8 px-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, hsl(0 0% 2% / 0.5), transparent)" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(90deg, hsl(160 100% 45% / 0.12), hsl(280 100% 65% / 0.06), hsl(160 100% 45% / 0.12))" }}
          >
            <div className="rounded-2xl px-4 md:px-6 py-4 overflow-x-auto scrollbar-hide"
              style={{ background: "rgba(8,12,18,0.8)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-4 md:gap-6 min-w-max">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary absolute inset-0 animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Live Preview</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LiveEventStrip />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-28 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">What You Get</span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">Choose What Viewers Make Happen</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">When someone sends a gift, follows, or likes, you decide what happens on your stream.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="rounded-2xl p-[1px] group cursor-default"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div
                    className="rounded-2xl p-7 h-full transition-all duration-400 group-hover:shadow-[0_0_40px_hsl(160_100%_45%/0.08)] relative overflow-hidden"
                    style={{ background: "rgba(14,18,26,0.7)", backdropFilter: "blur(20px)" }}
                  >
                    {/* Hover glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "radial-gradient(circle, hsl(160 100% 45% / 0.06), transparent 70%)" }} />

                    <div className="relative z-10">
                      {/* Icon with glow */}
                      <div className="relative w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                        <Icon size={22} className="text-primary group-hover:drop-shadow-[0_0_8px_hsl(160,100%,50%)] transition-all duration-300" />
                        <div className="absolute -inset-2 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: "radial-gradient(circle, hsl(160 100% 45% / 0.08), transparent 70%)" }} />
                      </div>
                      <h3 className="text-base font-heading font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Why Choose ── */}
      <section className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">Why TikUp</span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">Stop Wiring Tools Together. Just Use TikUp.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center relative"
                    style={{ background: "hsl(160 100% 45% / 0.06)", border: "1px solid hsl(160 100% 45% / 0.1)" }}>
                    <Icon size={24} className="text-primary" />
                    <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: "radial-gradient(circle, hsl(160 100% 45% / 0.08), transparent)" }} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, hsl(160 100% 45% / 0.03), transparent 60%)" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">One Dashboard</span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">One Account. One Dashboard. Zero Headaches.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Your phone is just a remote control for the same system. No separate apps to manage.</p>
          </motion.div>

          <DashboardMockup />
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="py-28 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.03), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Start free. Upgrade when you're ready to unlock full creator power.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-[1px]"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
            >
              <div className="rounded-2xl p-7 h-full" style={{ background: "rgba(14,18,26,0.7)", backdropFilter: "blur(20px)" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Free</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold text-foreground">£0</span>
                  <span className="text-muted-foreground text-sm">forever</span>
                </div>
                <div className="space-y-3 mb-8">
                  {freeFeatures.map(feature => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/auth"
                  className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center text-foreground transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Get Started Free
                </Link>
              </div>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-[1px] relative"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45% / 0.3), hsl(280 100% 65% / 0.15), hsl(160 100% 45% / 0.1))" }}
            >
              {/* Pro glow */}
              <div className="absolute -inset-2 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.06), transparent 70%)" }} />

              <div className="relative rounded-2xl p-7 h-full" style={{ background: "rgba(8,12,18,0.92)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">TIKUP PRO</p>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary flex items-center gap-1">
                    <Crown size={10} /> POPULAR
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold text-foreground">£10</span>
                  <span className="text-muted-foreground text-sm">per month</span>
                </div>
                <div className="space-y-3 mb-8">
                  {proFeatures.map(feature => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/auth"
                  className="block w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_30px_hsl(160_100%_45%/0.3)]">
                  Upgrade to Pro
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(160 100% 45% / 0.04), transparent 60%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-5 tracking-tight">
            Ready to Level Up Your Stream?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Join 2,000+ creators already using TikUp to grow their TikTok LIVE audience.
          </p>
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_40px_hsl(160_100%_45%/0.35),0_0_80px_hsl(160_100%_45%/0.1)]"
          >
            Start For Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={tikupLogo} alt="TikUp" className="w-6 h-6 object-contain opacity-50" />
            <span className="text-sm text-muted-foreground/50 font-heading font-semibold">TIKUP</span>
          </div>
          <p className="text-xs text-muted-foreground/40">
            © {new Date().getFullYear()} TIKUP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
