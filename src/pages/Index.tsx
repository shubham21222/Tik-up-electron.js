import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import UpdateItem from "@/components/UpdateItem";
import {
  MessageSquare, Volume2, Zap, Layers, Gamepad2, Keyboard,
  Timer, Heart, Star, Download, Mic, Globe, Play,
  Crown, ArrowRight, Info
} from "lucide-react";

const updates = [
  { icon: Download, title: "Desktop App Available", description: "TikUp is now available as a Desktop App for Windows with exclusive features and improved stability.", tag: "New" },
  { icon: Mic, title: "Voicemod Integration", description: "Let your viewers change your voice with the Voicemod integration. Available in Actions!", tag: "New" },
  { icon: Heart, title: "Team Member Levels", description: "Give your most loyal viewers additional benefits with Text-to-Speech and Actions & Events!" },
  { icon: Gamepad2, title: "GTA 5 Plugin", description: "Let viewers control your GTA 5 game! Trigger different actions by sending gifts.", tag: "Popular" },
  { icon: Timer, title: "Stream Countdown", description: "Let viewers decide how long you stream. They can extend a countdown with gifts!" },
  { icon: Globe, title: "Streamer.bot Integration", description: "Connect with Streamer.bot to create even more interactive features and connect other platforms." },
];

const tutorials = [
  "How To Use TikUp",
  "How To Add Text to Speech",
  "How To Control Minecraft",
  "How To Set Up Sound Alerts",
  "How To Create Overlays",
  "How To Connect OBS Studio",
  "How To Use Chat Commands",
];

const Index = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome to <span className="text-gradient-primary">TikUp</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-3xl">
            Welcome to the most advanced and powerful streaming tool for <span className="text-primary font-semibold">TikTok LIVE</span>!
            TikUp offers you a wide range of free interactive features for your Live Stream on TikTok. 
            From our most popular features such as Text-to-Speech and Sound Alerts up to IFTTT integrations for Smart Devices.
            We have something for everyone! Join us and transform your TikTok LIVE into a dynamic and immersive adventure!
          </p>
        </div>

        {/* Latest updates */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-primary" />
            <h2 className="text-lg font-heading font-semibold text-primary">The Latest and Greatest</h2>
            <Star size={18} className="text-primary" />
          </div>
          <div className="rounded-xl border border-border bg-card p-2 space-y-1">
            {updates.map((update) => (
              <UpdateItem key={update.title} {...update} />
            ))}
          </div>
        </section>

        {/* How to use + tutorials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-heading font-semibold text-primary mb-4">How to use TikUp?</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-video bg-[hsl(270,60%,15%)] flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
                  <Play size={28} className="text-primary ml-1" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-muted-foreground">Complete TikUp Setup - 2025 TikTok LIVE Alerts & Overlays Tutorial</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-primary mb-4">Video Tutorials</h2>
            <div className="rounded-xl border border-border bg-card p-3 space-y-0.5">
              {tutorials.map((title) => (
                <button
                  key={title}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                >
                  <Play size={14} className="text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pro CTA */}
        <div className="rounded-xl border border-secondary/20 bg-gradient-to-r from-secondary/5 via-card to-primary/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={22} className="text-secondary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Upgrade to TikUp Pro</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Unlock premium features including unlimited overlays, priority TTS, custom branding, advanced analytics, and priority support. Remove all watermarks from your stream.
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0">
              Go Pro <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
