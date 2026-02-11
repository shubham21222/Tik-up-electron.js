import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Target, Volume2, BarChart3, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import tikupLogo from "@/assets/tikup_logo.png";

const features = [
  { icon: Target, title: "Goal Overlays", desc: "Real-time animated progress bars for likes, follows, shares, and custom goals." },
  { icon: Zap, title: "Event Alerts", desc: "Instant alerts for gifts, follows, likes, and shares with premium animations." },
  { icon: Volume2, title: "Soundboard", desc: "Custom sound effects triggered by gifts, commands, and viewer interactions." },
  { icon: BarChart3, title: "Live Analytics", desc: "Track viewers, engagement, and revenue in real-time on your dashboard." },
  { icon: Shield, title: "Chat Moderation", desc: "Auto-block spam, caps, links, and custom words from your TikTok Live chat." },
  { icon: Sparkles, title: "Custom Widgets", desc: "Leaderboards, polls, giveaways, and more — all OBS-ready." },
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

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={tikupLogo} alt="TikUp" className="w-8 h-8 object-contain" />
            <span className="text-lg font-heading font-bold text-foreground tracking-tight">TIKUP</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/auth" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_0_20px_hsl(160_100%_45%/0.25)]">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.06), transparent 70%)" }} />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-6 tracking-tight leading-[1.1]"
          >
            Dominate Your{" "}
            <span className="text-gradient-primary">TikTok Live</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Professional overlays, real-time engagement tools, and powerful growth features designed for serious TikTok creators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/auth"
              className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_0_30px_hsl(160_100%_45%/0.3)] flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              to="/auth"
              className="px-8 py-3.5 rounded-xl border border-border/60 text-foreground font-semibold text-base hover:-translate-y-0.5 transition-all duration-200 hover:bg-muted/30"
            >
              View Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Everything You Need to Go Live</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Premium tools built specifically for TikTok LIVE creators who want to stand out.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="rounded-2xl p-[1px] group"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div className="rounded-2xl p-6 h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.06)]"
                    style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Pro Plan</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to scale your TikTok Live presence.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <div className="rounded-2xl p-[1px]"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45% / 0.3), hsl(280 100% 65% / 0.15))" }}>
              <div className="rounded-2xl p-8" style={{ background: "rgba(12,16,22,0.9)", backdropFilter: "blur(20px)" }}>
                <div className="text-center mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">TIKUP PRO</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-heading font-bold text-foreground">£10</span>
                    <span className="text-muted-foreground text-sm">per month</span>
                  </div>
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

                <Link
                  to="/auth"
                  className="block w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TIKUP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
