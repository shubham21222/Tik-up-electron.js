import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import TabNav from "@/components/TabNav";
import { Info, Eye, Maximize2, X, Target, Copy, ExternalLink, Settings, Crown, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

const TTSOverlay = lazy(() => import("@/components/overlays/TTSOverlay"));
const ChatOverlay = lazy(() => import("@/components/overlays/ChatOverlay"));
const SoundAlertOverlay = lazy(() => import("@/components/overlays/SoundAlertOverlay"));
const LikeFollowOverlay = lazy(() => import("@/components/overlays/LikeFollowOverlay"));
const GoalProgressOverlay = lazy(() => import("@/components/overlays/GoalProgressOverlay"));
const GiftComboPreview = lazy(() => import("@/components/overlays/previews/GiftComboPreview"));
const TickerPreview = lazy(() => import("@/components/overlays/previews/TickerPreview"));
const AnimatedBgPreview = lazy(() => import("@/components/overlays/previews/AnimatedBgPreview"));
const SoundReactivePreview = lazy(() => import("@/components/overlays/previews/SoundReactivePreview"));
const FollowAlertPreview = lazy(() => import("@/components/overlays/previews/FollowAlertPreview"));
const ShareAlertPreview = lazy(() => import("@/components/overlays/previews/ShareAlertPreview"));
const ViewerCountPreview = lazy(() => import("@/components/overlays/previews/ViewerCountPreview"));
const LikeCounterPreview = lazy(() => import("@/components/overlays/previews/LikeCounterPreview"));
const FollowerGoalPreview = lazy(() => import("@/components/overlays/previews/FollowerGoalPreview"));
const LeaderboardPreview = lazy(() => import("@/components/overlays/previews/LeaderboardPreview"));
const StreamTimerPreview = lazy(() => import("@/components/overlays/previews/StreamTimerPreview"));
const CustomTextPreview = lazy(() => import("@/components/overlays/previews/CustomTextPreview"));
const GiftAlertPreview = lazy(() => import("@/components/overlays/previews/GiftAlertPreview"));
const LikeAlertPreview = lazy(() => import("@/components/overlays/previews/LikeAlertPreview"));
const ChatBoxPreview = lazy(() => import("@/components/overlays/previews/ChatBoxPreview"));
const SocialRotatorPreview = lazy(() => import("@/components/overlays/previews/SocialRotatorPreview"));
const GiftFireworkPreview = lazy(() => import("@/components/overlays/previews/GiftFireworkPreview"));
const PromoOverlayPreview = lazy(() => import("@/components/overlays/previews/PromoOverlayPreview"));
const StreamBorderPreview = lazy(() => import("@/components/overlays/previews/StreamBorderPreview"));
const WebcamFramePreview = lazy(() => import("@/components/overlays/previews/WebcamFramePreview"));
const VideoCamFramePreview = lazy(() => import("@/components/overlays/previews/VideoCamFramePreview"));
const VideoLabelBarPreview = lazy(() => import("@/components/overlays/previews/VideoLabelBarPreview"));
const CoinJarPreview = lazy(() => import("@/components/overlays/previews/CoinJarPreview"));
const SpinWheelPreview = lazy(() => import("@/components/overlays/previews/SpinWheelPreview"));
const GiftActionsPreview = lazy(() => import("@/components/overlays/previews/GiftActionsPreview"));
const BattleRoyalePreview = lazy(() => import("@/components/overlays/previews/BattleRoyalePreview"));
const SlotMachinePreview = lazy(() => import("@/components/overlays/previews/SlotMachinePreview"));
const VoteBattlePreview = lazy(() => import("@/components/overlays/previews/VoteBattlePreview"));
const ProgressRacePreview = lazy(() => import("@/components/overlays/previews/ProgressRacePreview"));
const StreamBuddiesPreview = lazy(() => import("@/components/overlays/previews/StreamBuddiesPreview"));
const PacManPreview = lazy(() => import("@/components/overlays/previews/PacManPreview"));
const NeonEventListPreview = lazy(() => import("@/components/overlays/previews/NeonEventListPreview"));
const GlowAlertPopupPreview = lazy(() => import("@/components/overlays/previews/GlowAlertPopupPreview"));
const CircularProfileWidgetPreview = lazy(() => import("@/components/overlays/previews/CircularProfileWidgetPreview"));

const overlayPreviews: Record<string, React.LazyExoticComponent<any>> = {
  "Text-to-Speech (TTS)": TTSOverlay,
  "TikTok Chat Overlay": ChatOverlay,
  "Sound Alert Overlay": SoundAlertOverlay,
  "Like/Follow Overlay": LikeFollowOverlay,
  "Gift Alert Overlay": GiftAlertPreview,
  "Goal Progress Bar": GoalProgressOverlay,
  "Super Gift Combo": GiftComboPreview,
  "Notifications Ticker": TickerPreview,
  "Animated Background": AnimatedBgPreview,
  "Sound Reactive": SoundReactivePreview,
  "Follow Alert": FollowAlertPreview,
  "Share Alert": ShareAlertPreview,
  "Viewer Count": ViewerCountPreview,
  "Like Counter": LikeCounterPreview,
  "Follower Goal": FollowerGoalPreview,
  "Leaderboard": LeaderboardPreview,
  "Stream Timer": StreamTimerPreview,
  "Custom Text": CustomTextPreview,
  "Like Alert": LikeAlertPreview,
  "Social Media Rotator": SocialRotatorPreview,
  "Gift Firework": GiftFireworkPreview,
  "Promo Overlay": PromoOverlayPreview,
  "Stream Border": StreamBorderPreview,
  "Webcam Frame": WebcamFramePreview,
  "Video Cam Frame": VideoCamFramePreview,
  "Video Label Bar": VideoLabelBarPreview,
  "Coin Jar": CoinJarPreview,
  "Spin Wheel": SpinWheelPreview,
  "Gift Actions Slider": GiftActionsPreview,
  "Battle Royale": BattleRoyalePreview,
  "Slot Machine": SlotMachinePreview,
  "Vote Battle": VoteBattlePreview,
  "Progress Race": ProgressRacePreview,
  "Stream Buddies": StreamBuddiesPreview,
  "Pac-Man LIVE": PacManPreview,
  "Neon Event List": NeonEventListPreview,
  "Glow Alert Popup": GlowAlertPopupPreview,
  "Circular Profile Widget": CircularProfileWidgetPreview,
};


interface OverlayItem {
  title: string;
  description: string;
  hasPreview: boolean;
  color: string;
  pro?: boolean;
  route?: string;
  tags?: string[];
  category?: string;
  featureKey?: string;
  isNew?: boolean;
}

/* ── Category definitions for the main Overlays tab ── */
const OVERLAY_CATEGORIES = [
  { id: "stream", label: "🎬 Stream Essentials", description: "Core overlays every streamer needs" },
  { id: "alerts", label: "🔔 Alert Overlays", description: "Notifications for gifts, follows, likes & shares" },
  { id: "goals", label: "🎯 Goals & Progress", description: "Track milestones and viewer goals" },
  { id: "widgets", label: "📊 Widgets & Counters", description: "Live stats, timers, and display widgets" },
  { id: "actions", label: "🎁 Gift Actions & In-Game", description: "Map gifts to actions and interactive games" },
  { id: "design", label: "🎨 Banners & Stream Design", description: "Frames, borders, backgrounds & branding" },
];

const overlayData: Record<string, OverlayItem[]> = {
  "Overlays": [
    // Stream Essentials
    { title: "Text-to-Speech (TTS)", description: "Floating notification bubble with soundwave animation. Premium glassmorphism design.", hasPreview: true, color: "160 100% 45%", route: "/tts", category: "stream", featureKey: "/tts-overlay" },
    { title: "TikTok Chat Overlay", description: "Stacked chat messages with smooth slide-in animations and fading effects.", hasPreview: true, color: "200 100% 55%", route: "/chat-overlay", category: "stream", featureKey: "/chat-overlay-widget" },
    { title: "Sound Alert Overlay", description: "Center-screen animated alert with expanding neon rings and particle effects.", hasPreview: true, color: "350 90% 55%", route: "/sounds", category: "stream", featureKey: "/sound-alert-overlay" },
    { title: "Notifications Ticker", description: "Scrolling event ticker bar showing follows, likes, gifts in real-time.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/ticker", category: "stream", featureKey: "/ticker-overlay" },

    // Alert Overlays
    { title: "Like/Follow Overlay", description: "Elegant floating notifications with heart particle animations.", hasPreview: true, color: "350 90% 55%", route: "/like-alerts", category: "alerts", featureKey: "/like-follow-overlay" },
    { title: "Gift Alert Overlay", description: "Animated gift alerts with glow pulse and ring expansion effects.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/gift-alerts", category: "alerts", featureKey: "/gift-alert-overlay" },
    { title: "Follow Alert", description: "Clean notification when a new user follows. Slide-in animation with avatar display.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/follow-alerts", category: "alerts", featureKey: "/follow-alert-overlay" },
    { title: "Share Alert", description: "Stream share notification with animated share icon and username display.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/share-alerts", category: "alerts", featureKey: "/share-alert-overlay" },
    { title: "Like Alert", description: "Floating hearts animation triggered by viewer likes with particle burst.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/like-alerts", category: "alerts", featureKey: "/like-alert-overlay" },
    { title: "Super Gift Combo", description: "Stacking combo counter with escalating tiers: Combo, Super, Epic, Legendary.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/gift-combo", category: "alerts", featureKey: "/gift-combo-overlay" },
    { title: "Gift Firework", description: "Cinematic firework explosions triggered by gifts with particle trails and username tags.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/gift-firework", category: "alerts", featureKey: "/gift-firework-overlay" },

    // Goals & Progress
    { title: "Goal Progress Bar", description: "Animated progress bars for likes, follows, shares & stars with shimmer effects.", hasPreview: true, color: "45 100% 55%", route: "/goal-overlays", category: "goals", featureKey: "/goal-progress-overlay" },
    { title: "Follower Goal", description: "Animated follower goal bar with milestone markers and completion celebration.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/follower-goal", category: "goals", featureKey: "/follower-goal-overlay" },
    { title: "Coin Jar", description: "Watch the jar fill with gifts. A fun, visual way to track your gift goal in real-time.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/coin-jar", category: "goals", featureKey: "/coin-jar-overlay" },
    { title: "Progress Race", description: "Multiple teams race to the finish line powered by gifts and likes in real-time.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/progress-race", category: "goals", featureKey: "/progress-race-overlay" },

    // Widgets & Counters
    { title: "Viewer Count", description: "Live viewer count display with spike animations, peak tracking, and mini graph mode.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/viewer-count", category: "widgets", featureKey: "/viewer-count-overlay" },
    { title: "Like Counter", description: "Real-time like counter with progress ring, bar, and animated digit modes.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/like-counter", category: "widgets", featureKey: "/like-counter-overlay" },
    { title: "Leaderboard", description: "Live top gifters/fans leaderboard with animated ranking transitions.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/leaderboard", category: "widgets", featureKey: "/leaderboard-overlay" },
    { title: "Stream Timer", description: "Digital countdown/count-up timer with segment display. Extendable by gifts.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/stream-timer", category: "widgets", featureKey: "/stream-timer-overlay" },
    { title: "Custom Text", description: "Dynamic text overlay supporting real-time variable binding ({viewers}, {likes}, etc).", hasPreview: true, color: "160 100% 45%", pro: true, route: "/custom-text", category: "widgets", featureKey: "/custom-text-overlay" },
    { title: "Social Media Rotator", description: "Animated 3D carousel of your social media links with glow effects and smooth rotation.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/social-rotator", category: "widgets", featureKey: "/social-rotator-overlay" },
    { title: "Sound Reactive", description: "Audio visualizer with peak meters and waveform backgrounds synced to stream audio.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/sound-reactive", category: "widgets", featureKey: "/sound-reactive-overlay" },

    // Gift Actions & In-Game
    { title: "Gift Actions Slider", description: "Scrolling carousel showing which gifts trigger which actions. Easy to edit.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/gift-actions", category: "actions", featureKey: "/gift-actions-overlay" },
    { title: "Spin Wheel", description: "Viewers trigger spins with gifts. Land on custom dares, prizes, or actions.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/spin-wheel", category: "actions", featureKey: "/spin-wheel-overlay" },
    { title: "Battle Royale", description: "Viewers enter by gifting — avatars fight on screen, last one standing wins.", hasPreview: true, color: "350 80% 55%", pro: true, route: "/battle-royale", category: "actions", featureKey: "/battle-royale-overlay" },
    { title: "Slot Machine", description: "Gift-triggered 3-reel slot machine with customizable jackpot rewards.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/slot-machine", category: "actions", featureKey: "/slot-machine-overlay" },
    { title: "Vote Battle", description: "Two-sided animated vote bar. Viewers power their team with gifts.", hasPreview: true, color: "200 80% 55%", pro: true, route: "/vote-battle", category: "actions", featureKey: "/vote-battle-overlay" },
    { title: "Stream Buddies", description: "Animated pixel-art avatars of your top supporters that walk, jump, and react to gifts and chat in real-time.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/stream-buddies", category: "actions", featureKey: "/stream-buddies-overlay" },
    { title: "Pac-Man LIVE", description: "Interactive Pac-Man game controlled by chat commands. Gifts trigger power-ups, speed boosts, and shields!", hasPreview: true, color: "160 100% 45%", pro: true, route: "/pacman", category: "actions", featureKey: "/pacman-overlay" },

    // Banners & Stream Design
    { title: "Promo Overlay", description: "Branded promo overlay with logo, animated rings, and follow CTA.", hasPreview: true, color: "160 100% 45%", route: "/promo-overlay", category: "design", featureKey: "/promo-overlay" },
    { title: "Stream Border", description: "10 premium animated transparent borders: Neon Pulse, Gold Metallic, Glitch & more.", hasPreview: true, color: "210 100% 55%", pro: true, route: "/stream-border", category: "design", featureKey: "/stream-border-overlay" },
    { title: "Webcam Frame", description: "10 premium animated webcam frames. Neon, Gold, Circuit, Holographic & more.", hasPreview: true, color: "180 100% 50%", pro: true, route: "/webcam-frame", category: "design", featureKey: "/webcam-frame-overlay" },
    { title: "Video Cam Frame", description: "Animated WebM video webcam frame with glow and color options.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/video-cam-frame", category: "design", featureKey: "/video-cam-frame-overlay" },
    { title: "Video Label Bar", description: "Animated WebM label bar overlay. Color customizable transparent loop.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/video-label-bar", category: "design", featureKey: "/video-label-bar-overlay" },
    { title: "Animated Background", description: "Looping animated backgrounds: gradients, particles, aurora, grid, waves.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/animated-bg", category: "design", featureKey: "/animated-bg-overlay" },
    { title: "Studio Backgrounds", description: "10 premium animated room backgrounds with customizable LED signs. Sofa scenes for every vibe.", hasPreview: false, color: "40 95% 55%", pro: true, route: "/backgrounds", category: "design", featureKey: "/studio-bg-overlay" },

    // Premium UI Frames
    { title: "Neon Event List", description: "Real-time scrolling event feed with glowing tech-corner borders. Gifts, follows, and likes animate in sequentially.", hasPreview: true, color: "200 100% 60%", pro: true, route: "/gift-alerts", category: "design", tags: ["new"] },
    { title: "Glow Alert Popup", description: "High-impact pop-in notification box with animated glow border, scan-line effect, and icon ring. Perfect for gifts and follows.", hasPreview: true, color: "350 90% 60%", pro: true, route: "/gift-alerts", category: "alerts", tags: ["new"] },
    { title: "Circular Profile Widget", description: "Rotating circular widget showing top gifters with animated ring, segmented wheel, and glow corner markers.", hasPreview: true, color: "45 100% 58%", pro: true, route: "/leaderboard", category: "widgets", tags: ["new"] },
  ],
};

const categoryTabs = ["All", ...OVERLAY_CATEGORIES.map(c => c.label)];
const allItems = overlayData["Overlays"];

/* ── Per-gift animated card ── */
interface GiftData { gift: string; emoji: string; img: string; color: string; coins: number; vibe: string; }

const GiftAnimCard = ({ gift: g, index }: { gift: GiftData; index: number }) => {
  const [active, setActive] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);

  const trigger = () => {
    setActive(true);
    setParticles([...Array(8)].map((_, i) => i));
    setTimeout(() => { setActive(false); setParticles([]); }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className="relative rounded-2xl border overflow-hidden cursor-pointer group"
      style={{ borderColor: `hsl(${g.color} / 0.2)`, background: `hsl(${g.color} / 0.04)` }}
      onClick={trigger}
    >
      {/* Ambient bg glow */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 30%, hsl(${g.color} / ${active ? 0.22 : 0.06}), transparent 70%)` }} />

      <div className="relative p-4 flex flex-col items-center gap-2 min-h-[160px] justify-center">
        {/* Expanding ring on trigger */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ border: `1px solid hsl(${g.color} / 0.5)`, width: 56, height: 56 }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 3.5, opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Particles */}
        <AnimatePresence>
          {active && particles.map(i => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{ background: `hsl(${g.color})`, top: "50%", left: "50%" }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * 45) * Math.PI / 180) * (55 + Math.random() * 25),
                y: Math.sin((i * 45) * Math.PI / 180) * (55 + Math.random() * 25),
                opacity: 0, scale: 0,
              }}
              transition={{ duration: 1 + Math.random() * 0.4, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Gift icon */}
        <motion.div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: `hsl(${g.color} / 0.1)`, border: `1px solid hsl(${g.color} / 0.25)` }}
          animate={active ? { scale: [1, 1.35, 1], rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Glow behind icon */}
          <motion.div
            className="absolute inset-0 rounded-2xl blur-lg"
            style={{ background: `hsl(${g.color} / 0.3)` }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <img src={g.img} alt={g.gift} className="w-9 h-9 object-contain relative z-10 drop-shadow-lg" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          {/* Fallback emoji */}
          <span className="text-2xl relative z-10">{g.emoji}</span>
        </motion.div>

        {/* Gift name */}
        <motion.p
          className="text-[11px] font-bold text-center leading-tight"
          style={{ color: `hsl(${g.color})` }}
          animate={active ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          {g.gift}
        </motion.p>
        <p className="text-[9px] text-muted-foreground text-center">{g.vibe}</p>

        {/* Coin badge */}
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: `hsl(${g.color} / 0.12)`, color: `hsl(${g.color})`, border: `1px solid hsl(${g.color} / 0.2)` }}>
          🪙 {g.coins.toLocaleString()}
        </span>

        {/* Tap hint */}
        <span className="absolute bottom-2 right-2 text-[8px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">Tap to preview</span>
      </div>

      {/* Active flash */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ border: `1px solid hsl(${g.color} / 0.6)`, boxShadow: `0 0 20px hsl(${g.color} / 0.3), inset 0 0 20px hsl(${g.color} / 0.05)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Overlays = () => {
  const [activeTab, setActiveTab] = useState(categoryTabs[0]);
  const [fullscreenOverlay, setFullscreenOverlay] = useState<string | null>(null);
  const FullscreenComponent = fullscreenOverlay ? overlayPreviews[fullscreenOverlay] : null;
  const { isVisible } = useFeatureFlags();
  const activeCat = OVERLAY_CATEGORIES.find(c => c.label === activeTab);
  const visibleItems = allItems.filter(o => !o.featureKey || isVisible(o.featureKey));
  const filteredItems = activeCat ? visibleItems.filter(o => o.category === activeCat.id) : visibleItems;

  return (
    <AppLayout>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Overlays</h1>
            <PageHelpButton featureKey="overlays" />
          </div>
          <p className="text-muted-foreground text-sm">Choose what happens when viewers interact with your stream. Each effect gets a link you paste into OBS.</p>
        </motion.div>

        {/* Goal Overlays CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Link
            to="/goal-overlays"
            className="flex items-center gap-4 p-4 rounded-2xl border border-primary/15 bg-primary/5 hover:bg-primary/8 mb-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(160_100%_45%/0.08)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:shadow-[0_0_15px_hsl(160_100%_45%/0.2)] transition-shadow">
              <Target size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-heading font-bold text-foreground">Goal Overlay Builder</h3>
              <p className="text-xs text-muted-foreground">Create dynamic live goals with animated progress bars</p>
            </div>
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
          </Link>
        </motion.div>

        <TabNav tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Premium Gift Animations Section ── */}
        {(activeTab === categoryTabs[0] || activeTab === "🔔 Alert Overlays") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <h2 className="text-base font-heading font-bold text-foreground">Premium Gift Animations</h2>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full border border-secondary/20">
                  <Crown size={8} /> PRO
                </span>
              </div>
              <div className="flex-1 h-px bg-border/40" />
              <Link to="/gift-alerts" className="text-xs text-primary hover:underline font-medium">Configure All →</Link>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Each TikTok gift triggers its own luxury animated overlay — with particle effects, glow, and sound — in real time. Paste one URL into OBS and every gift is handled automatically.</p>

            {/* Gift animation cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { gift: "Rose", emoji: "🌹", img: "/gifts/rose.png", color: "350 90% 60%", coins: 1, vibe: "Elegant & romantic" },
                { gift: "Flame Heart", emoji: "❤️‍🔥", img: "/gifts/flame_heart.png", color: "20 100% 58%", coins: 500, vibe: "Fiery & passionate" },
                { gift: "Fluffy Heart", emoji: "☁️", img: "/gifts/fluffy_heart.png", color: "200 80% 65%", coins: 1000, vibe: "Soft & dreamy" },
                { gift: "Love You So Much", emoji: "💖", img: "/gifts/love_you_so_much.png", color: "320 100% 65%", coins: 2000, vibe: "Explosive love burst" },
                { gift: "Morning Bloom", emoji: "🌸", img: "/gifts/morning_bloom.png", color: "30 100% 65%", coins: 50, vibe: "Fresh & bright" },
                { gift: "Wink Wink", emoji: "😉", img: "/gifts/wink_wink.png", color: "55 100% 60%", coins: 200, vibe: "Playful & cheeky" },
                { gift: "You're Awesome", emoji: "⭐", img: "/gifts/youre_awesome.png", color: "45 100% 58%", coins: 100, vibe: "Golden & triumphant" },
                { gift: "Blow a Kiss", emoji: "💋", img: "/gifts/blow_a_kiss.png", color: "340 100% 62%", coins: 30, vibe: "Sweet & flirtatious" },
              ].map((g, i) => (
                <GiftAnimCard key={g.gift} gift={g} index={i} />
              ))}
            </div>

            {/* Pipeline info strip */}
            <div className="mt-4 p-4 rounded-2xl border border-primary/10 bg-primary/[0.03] flex flex-wrap gap-6 items-center">
              {[
                { step: "1", label: "Gift received", icon: "🎁" },
                { step: "2", label: "Gift matched", icon: "⚡" },
                { step: "3", label: "Animation plays", icon: "✨" },
                { step: "4", label: "Auto-queued", icon: "🔄" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center border border-primary/20">{s.step}</span>
                  <span className="text-[10px] text-muted-foreground">{s.icon} {s.label}</span>
                  {i < 3 && <span className="text-muted-foreground/30 text-xs">→</span>}
                </div>
              ))}
              <div className="ml-auto">
                <Link to="/gift-alerts" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-colors">
                  <Settings size={11} /> Configure Gifts
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.filter(o => overlayPreviews[o.title]).map((overlay, i) => {
            const PreviewComponent = overlayPreviews[overlay.title];
            return (
              <motion.div
                key={overlay.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group rounded-2xl cursor-default overlay-market-card"
              >
                <div className="rounded-2xl overflow-hidden">
                  <div className="relative h-[340px] overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Loading...</div>}>
                      <PreviewComponent />
                    </Suspense>
                    <button
                      onClick={() => setFullscreenOverlay(overlay.title)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Maximize2 size={14} />
                    </button>
                    {overlay.pro && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[9px] font-bold text-secondary bg-secondary/15 backdrop-blur-sm px-2 py-1 rounded-lg border border-secondary/20">
                        <Crown size={9} /> PRO
                      </span>
                    )}
                    {overlay.tags?.includes("new") && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/15 backdrop-blur-sm px-2 py-1 rounded-lg border border-primary/20" style={{ left: overlay.pro ? "64px" : "12px" }}>
                        ✦ NEW
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-heading font-semibold text-foreground">{overlay.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{overlay.description}</p>
                    {overlay.route && (
                      <div className="flex items-center gap-2 mt-3">
                        <Link to={overlay.route} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
                          <Settings size={11} /> Configure & Copy URL
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <Suspense fallback={null}>
              <FullscreenComponent />
            </Suspense>
            <button
              onClick={() => setFullscreenOverlay(null)}
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-xs text-white/50 font-medium">{fullscreenOverlay} · Live Preview</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Overlays;
