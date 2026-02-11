import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import TabNav from "@/components/TabNav";
import { Info, Eye, Maximize2, X } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TTSOverlay = lazy(() => import("@/components/overlays/TTSOverlay"));
const ChatOverlay = lazy(() => import("@/components/overlays/ChatOverlay"));
const SoundAlertOverlay = lazy(() => import("@/components/overlays/SoundAlertOverlay"));
const LikeFollowOverlay = lazy(() => import("@/components/overlays/LikeFollowOverlay"));

const overlayPreviews: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  "Text-to-Speech (TTS)": TTSOverlay,
  "TikTok Chat Overlay": ChatOverlay,
  "Sound Alert Overlay": SoundAlertOverlay,
  "Like/Follow Overlay": LikeFollowOverlay,
  "Gift Alert Overlay": SoundAlertOverlay,
};

const overlayData = {
  "Overlays": [
    { title: "Text-to-Speech (TTS)", description: "Floating notification bubble with soundwave animation. Premium glassmorphism design.", hasPreview: true },
    { title: "TikTok Chat Overlay", description: "Stacked chat messages with smooth slide-in animations and fading effects.", hasPreview: true },
    { title: "Sound Alert Overlay", description: "Center-screen animated alert with expanding neon rings and particle effects.", hasPreview: true },
    { title: "Like/Follow Overlay", description: "Elegant floating notifications with heart particle animations.", hasPreview: true },
    { title: "Gift Alert Overlay", description: "Animated gift alerts with glow pulse and ring expansion effects.", hasPreview: true },
    { title: "Top Gifters Widget", description: "Real-time leaderboard showing your top gift senders with animated transitions.", hasPreview: false },
  ],
  "Quick Setup": [
    { title: "Starter Pack", description: "Pre-configured set with chat, alerts, and TTS — one-click setup.", hasPreview: false },
    { title: "Pro Gaming Pack", description: "Overlay set optimized for gaming streams with game integration alerts.", hasPreview: false },
    { title: "Music Pack", description: "Song request overlay, now playing widget, and music-themed alerts.", hasPreview: false },
  ],
  "Browser Sources": [
    { title: "Chat Source", description: "Copy this URL into OBS as a Browser Source to display live chat.", hasPreview: false },
    { title: "Alert Source", description: "Browser source URL for gift, follow, and like alerts.", hasPreview: false },
    { title: "TTS Source", description: "Browser source for Text-to-Speech overlay rendering.", hasPreview: false },
    { title: "Leaderboard Source", description: "Browser source for the top gifters leaderboard widget.", hasPreview: false },
  ],
  "All Overlays": [
    { title: "Goal Progress Bar", description: "Set gift or follower goals with animated progress bars.", hasPreview: false },
    { title: "Stream Countdown", description: "A countdown timer extendable by gifts. Great for subathons.", hasPreview: false },
    { title: "Chat Word Cloud", description: "Real-time word cloud from chat messages.", hasPreview: false },
    { title: "Emote Wall", description: "Display emotes and stickers sent by viewers.", hasPreview: false },
    { title: "Poll Overlay", description: "Interactive polls where viewers vote through chat.", hasPreview: false },
    { title: "Wheel Spin", description: "Spinning wheel triggered by gifts with custom prizes.", hasPreview: false },
  ],
};

const tabs = Object.keys(overlayData);

const Overlays = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [fullscreenOverlay, setFullscreenOverlay] = useState<string | null>(null);
  const items = overlayData[activeTab as keyof typeof overlayData];

  const FullscreenComponent = fullscreenOverlay ? overlayPreviews[fullscreenOverlay] : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              {activeTab === "Overlays"
                ? <>Live preview of your <span className="text-primary font-medium">Overlay Widgets</span>. Click the preview to see them in action — each overlay is a browser source URL for OBS.</>
                : activeTab === "Browser Sources"
                ? "Copy these URLs and add them as Browser Sources in OBS Studio or Streamlabs."
                : <>Browse all available <span className="text-primary font-medium">Overlay Widgets</span> for your TikTok LIVE stream.</>}
            </p>
          </div>
        </div>

        {/* Live Preview Grid for main Overlays tab */}
        {activeTab === "Overlays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {items.filter(o => overlayPreviews[o.title]).map((overlay) => {
              const PreviewComponent = overlayPreviews[overlay.title];
              return (
                <motion.div
                  key={overlay.title}
                  layout
                  className="group rounded-2xl border border-border bg-card overflow-hidden"
                >
                  {/* Preview viewport */}
                  <div className="relative h-[240px] bg-gradient-to-br from-[hsl(0,0%,2%)] to-[hsl(0,0%,5%)] overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "24px 24px"
                      }}
                    />
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Loading...</div>
                    }>
                      <PreviewComponent />
                    </Suspense>

                    {/* Fullscreen button */}
                    <button
                      onClick={() => setFullscreenOverlay(overlay.title)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-heading font-semibold text-foreground">{overlay.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Live</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{overlay.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Regular cards for non-preview overlays */}
        {activeTab === "Overlays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(o => !overlayPreviews[o.title]).map((overlay) => (
              <OverlayCard key={overlay.title} title={overlay.title} description={overlay.description} hasPreview={overlay.hasPreview} url="#" />
            ))}
          </div>
        )}

        {activeTab !== "Overlays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((overlay) => (
              <OverlayCard key={overlay.title} title={overlay.title} description={overlay.description} hasPreview={overlay.hasPreview} url="#" />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay modal */}
      <AnimatePresence>
        {fullscreenOverlay && FullscreenComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px"
              }}
            />

            <Suspense fallback={null}>
              <FullscreenComponent />
            </Suspense>

            {/* Close */}
            <button
              onClick={() => setFullscreenOverlay(null)}
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-xs text-white/50 font-medium">{fullscreenOverlay} — Live Preview</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Overlays;
