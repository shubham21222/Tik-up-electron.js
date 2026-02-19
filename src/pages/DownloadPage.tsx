import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Monitor, Apple, Terminal, Download, ArrowLeft, Check, Zap, Volume2, Gamepad2, Shield } from "lucide-react";
import tikupLogo from "@/assets/tikup_logo.png";

type Platform = "windows" | "mac" | "linux" | "unknown";

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux")) return "linux";
  return "unknown";
};

const platforms = [
  {
    id: "windows" as Platform,
    name: "Windows",
    icon: Monitor,
    file: "TikUp-Desktop-Setup.exe",
    size: "~85 MB",
    req: "Windows 10+",
  },
  {
    id: "mac" as Platform,
    name: "macOS",
    icon: Apple,
    file: "TikUp-Desktop.dmg",
    size: "~90 MB",
    req: "macOS 11+",
  },
  {
    id: "linux" as Platform,
    name: "Linux",
    icon: Terminal,
    file: "TikUp-Desktop.AppImage",
    size: "~80 MB",
    req: "Ubuntu 20.04+",
  },
];

const desktopFeatures = [
  { icon: Volume2, title: "Virtual Audio Routing", desc: "Route TTS directly into TikTok LIVE Studio as a mic input via VB-Audio Cable or BlackHole." },
  { icon: Gamepad2, title: "Keystroke Triggers", desc: "Gifts trigger real keyboard inputs for in-game effects like GTA actions." },
  { icon: Shield, title: "System Tray Mode", desc: "Runs quietly in the background — no browser tab needed." },
  { icon: Zap, title: "Persistent Connection", desc: "Stable Supabase Realtime channel that never drops, even during long streams." },
];

const DownloadPage = () => {
  const [detected, setDetected] = useState<Platform>("unknown");

  useEffect(() => {
    setDetected(detectPlatform());
  }, []);

  const detectedPlatform = platforms.find((p) => p.id === detected);
  const otherPlatforms = platforms.filter((p) => p.id !== detected);

  // TODO: Replace with actual GitHub Releases URL
  const downloadUrl = (file: string) =>
    `https://github.com/YOUR_ORG/tikup-desktop/releases/latest/download/${file}`;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid hsl(0 0% 10% / 0.6)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/auth" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all duration-300">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.06), transparent 65%)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="inline-block mb-6">
            <img src={tikupLogo} alt="TikUp" className="w-20 h-20 object-contain mx-auto drop-shadow-[0_0_30px_hsl(160,100%,45%,0.3)]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-primary" style={{ background: "hsl(160 100% 45% / 0.06)", border: "1px solid hsl(160 100% 45% / 0.12)" }}>
              <Monitor size={12} />
              Desktop Companion App
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="text-5xl md:text-7xl font-heading font-extrabold text-foreground mb-6 tracking-tighter">
            TikUp for{" "}
            <span className="text-gradient-primary">Desktop</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg text-muted-foreground max-w-xl mx-auto mb-12">
            Route TTS audio directly into your stream, trigger keystrokes from gifts, and keep everything running in the background.
          </motion.p>

          {/* Primary download (detected platform) */}
          {detectedPlatform && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <a
                href={downloadUrl(detectedPlatform.file)}
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_40px_hsl(160_100%_45%/0.35)] relative overflow-hidden"
              >
                <Download size={18} />
                Download for {detectedPlatform.name}
                <motion.div className="absolute inset-0 z-0" style={{ background: "linear-gradient(90deg, transparent, hsl(160 100% 80% / 0.15), transparent)" }} animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }} />
              </a>
              <p className="text-xs text-muted-foreground/50 mt-3">{detectedPlatform.req} · {detectedPlatform.size}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Other platforms */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-6">
            Also available for
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(detected === "unknown" ? platforms : otherPlatforms).map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.a
                  key={p.id}
                  href={downloadUrl(p.file)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl p-[1px] group block"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div className="rounded-2xl p-5 h-full flex items-center gap-4" style={{ background: "rgba(14,18,26,0.7)", backdropFilter: "blur(20px)" }}>
                    <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-bold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground/50">{p.req} · {p.size}</p>
                    </div>
                    <Download size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Desktop-only features */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">Desktop Exclusive</span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">Features Only the Desktop App Can Do</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">These require native system access that browsers can't provide.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {desktopFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-[1px] group"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                >
                  <div className="rounded-2xl p-6 h-full" style={{ background: "rgba(14,18,26,0.7)", backdropFilter: "blur(20px)" }}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-heading font-bold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup steps */}
      <section className="py-24 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 block">Setup</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">Up and Running in 3 Steps</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { step: "1", title: "Download & Install", desc: "Download the installer for your platform and run it. Takes under a minute." },
              { step: "2", title: "Sign In", desc: "Use your TikUp account to sign in. Your overlays, settings, and sounds sync automatically." },
              { step: "3", title: "Select Audio Device", desc: "Pick your virtual audio cable (VB-Audio, BlackHole) and hit Connect. TTS now routes directly into your stream." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-[1px]"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
              >
                <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: "rgba(14,18,26,0.7)", backdropFilter: "blur(20px)" }}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-heading font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-foreground mb-0.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={tikupLogo} alt="TikUp" className="w-6 h-6 object-contain opacity-50" />
            <span className="text-sm text-muted-foreground/50 font-heading font-semibold">TIKUP</span>
          </div>
          <p className="text-xs text-muted-foreground/40">© {new Date().getFullYear()} TIKUP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DownloadPage;
