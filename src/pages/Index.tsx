import AppLayout from "@/components/AppLayout";
import FeatureCard from "@/components/FeatureCard";
import UpdateItem from "@/components/UpdateItem";
import {
  MessageSquare, Volume2, Zap, Layers, Gamepad2, Keyboard,
  Timer, Heart, Star, Download, Mic, Globe, Play,
  Crown, ArrowRight
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Text-to-Speech",
    description: "Let viewers send TTS messages during your LIVE stream with customizable voices.",
    gradient: "primary" as const,
  },
  {
    icon: Volume2,
    title: "Sound Alerts",
    description: "Play custom sound effects when viewers send gifts, follow, or interact.",
    gradient: "primary" as const,
  },
  {
    icon: Layers,
    title: "Overlays",
    description: "Professional stream overlays with alerts, goals, and custom widgets.",
    gradient: "accent" as const,
  },
  {
    icon: Zap,
    title: "Actions & Events",
    description: "Trigger actions based on viewer interactions. IFTTT for your LIVE stream.",
    gradient: "primary" as const,
  },
  {
    icon: Gamepad2,
    title: "Game Integration",
    description: "Let viewers control Minecraft, GTA 5, and more through gifts and commands.",
    gradient: "accent" as const,
  },
  {
    icon: Keyboard,
    title: "Keystroke Control",
    description: "Remote control any Windows application through viewer gifts and interactions.",
    gradient: "primary" as const,
  },
];

const updates = [
  {
    icon: Download,
    title: "Desktop App Available",
    description: "TikUp is now available as a Desktop App for Windows with exclusive features and improved stability.",
    tag: "New",
  },
  {
    icon: Mic,
    title: "Voicemod Integration",
    description: "Let your viewers change your voice with the Voicemod integration. Available in Actions!",
    tag: "New",
  },
  {
    icon: Heart,
    title: "Team Member Levels",
    description: "Give your most loyal viewers additional benefits with Text-to-Speech and Actions & Events!",
  },
  {
    icon: Gamepad2,
    title: "GTA 5 Plugin",
    description: "Let viewers control your GTA 5 game! Trigger different actions by sending gifts.",
    tag: "Popular",
  },
  {
    icon: Timer,
    title: "Stream Countdown",
    description: "Let viewers decide how long you stream. They can extend a countdown with gifts!",
  },
  {
    icon: Globe,
    title: "Streamer.bot Integration",
    description: "Connect with Streamer.bot to create even more interactive features and connect other platforms.",
  },
];

const tutorials = [
  "How To Use TikUp",
  "How To Add Text to Speech",
  "How To Control Minecraft",
  "How To Set Up Sound Alerts",
  "How To Create Overlays",
];

const Index = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome to <span className="text-gradient-primary">TikUp</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            The ultimate streaming toolkit for <span className="text-primary font-semibold">TikTok LIVE</span>. 
            Supercharge your live streams with interactive widgets, sound alerts, 
            professional overlays, and game integrations — all for free.
          </p>
        </div>

        {/* Feature grid */}
        <section className="mb-10">
          <h2 className="text-lg font-heading font-semibold mb-4 text-foreground">Interactive Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* Updates + Tutorials row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Updates */}
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">Latest Updates</h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-2 space-y-1">
              {updates.map((update) => (
                <UpdateItem key={update.title} {...update} />
              ))}
            </div>
          </section>

          {/* Tutorials + Pro */}
          <aside className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Video Tutorials</h2>
              <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                {tutorials.map((title) => (
                  <button
                    key={title}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:surface-raised transition-colors text-left group"
                  >
                    <Play size={14} className="text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro CTA */}
            <div className="rounded-xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-primary/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-secondary" />
                  <h3 className="font-heading font-bold text-foreground">Upgrade to Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock premium features, remove watermarks, and get priority support.
                </p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity w-full justify-center">
                  Go Pro <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
