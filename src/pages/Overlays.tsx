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
    { title: "Text-to-Speech (TTS)", description: "Floating notification bubble with soundwave animation. Premium glassmorphism design.", hasPreview: true, color: "160 100% 45%", route: "/tts", category: "stream" },
    { title: "TikTok Chat Overlay", description: "Stacked chat messages with smooth slide-in animations and fading effects.", hasPreview: true, color: "200 100% 55%", route: "/chat-overlay", category: "stream" },
    { title: "Sound Alert Overlay", description: "Center-screen animated alert with expanding neon rings and particle effects.", hasPreview: true, color: "350 90% 55%", route: "/sounds", category: "stream" },
    { title: "Notifications Ticker", description: "Scrolling event ticker bar showing follows, likes, gifts in real-time.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/ticker", category: "stream" },

    // Alert Overlays
    { title: "Like/Follow Overlay", description: "Elegant floating notifications with heart particle animations.", hasPreview: true, color: "350 90% 55%", route: "/like-alerts", category: "alerts" },
    { title: "Gift Alert Overlay", description: "Animated gift alerts with glow pulse and ring expansion effects.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/gift-alerts", category: "alerts" },
    { title: "Follow Alert", description: "Clean notification when a new user follows. Slide-in animation with avatar display.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/follow-alerts", category: "alerts" },
    { title: "Share Alert", description: "Stream share notification with animated share icon and username display.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/share-alerts", category: "alerts" },
    { title: "Like Alert", description: "Floating hearts animation triggered by viewer likes with particle burst.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/like-alerts", category: "alerts" },
    { title: "Super Gift Combo", description: "Stacking combo counter with escalating tiers: Combo, Super, Epic, Legendary.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/gift-combo", category: "alerts" },
    { title: "Gift Firework", description: "Cinematic firework explosions triggered by gifts with particle trails and username tags.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/gift-firework", category: "alerts" },

    // Goals & Progress
    { title: "Goal Progress Bar", description: "Animated progress bars for likes, follows, shares & stars with shimmer effects.", hasPreview: true, color: "45 100% 55%", route: "/goal-overlays", category: "goals" },
    { title: "Follower Goal", description: "Animated follower goal bar with milestone markers and completion celebration.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/follower-goal", category: "goals" },
    { title: "Coin Jar", description: "Watch the jar fill with gifts. A fun, visual way to track your gift goal in real-time.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/coin-jar", category: "goals" },
    { title: "Progress Race", description: "Multiple teams race to the finish line powered by gifts and likes in real-time.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/progress-race", category: "goals" },

    // Widgets & Counters
    { title: "Viewer Count", description: "Live viewer count display with spike animations, peak tracking, and mini graph mode.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/viewer-count", category: "widgets" },
    { title: "Like Counter", description: "Real-time like counter with progress ring, bar, and animated digit modes.", hasPreview: true, color: "350 90% 55%", pro: true, route: "/like-counter", category: "widgets" },
    { title: "Leaderboard", description: "Live top gifters/fans leaderboard with animated ranking transitions.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/leaderboard", category: "widgets" },
    { title: "Stream Timer", description: "Digital countdown/count-up timer with segment display. Extendable by gifts.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/stream-timer", category: "widgets" },
    { title: "Custom Text", description: "Dynamic text overlay supporting real-time variable binding ({viewers}, {likes}, etc).", hasPreview: true, color: "160 100% 45%", pro: true, route: "/custom-text", category: "widgets" },
    { title: "Social Media Rotator", description: "Animated 3D carousel of your social media links with glow effects and smooth rotation.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/social-rotator", category: "widgets" },
    { title: "Sound Reactive", description: "Audio visualizer with peak meters and waveform backgrounds synced to stream audio.", hasPreview: true, color: "200 100% 55%", pro: true, route: "/sound-reactive", category: "widgets" },

    // Gift Actions & In-Game
    { title: "Gift Actions Slider", description: "Scrolling carousel showing which gifts trigger which actions. Easy to edit.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/gift-actions", category: "actions" },
    { title: "Spin Wheel", description: "Viewers trigger spins with gifts. Land on custom dares, prizes, or actions.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/spin-wheel", category: "actions" },
    { title: "Battle Royale", description: "Viewers enter by gifting — avatars fight on screen, last one standing wins.", hasPreview: true, color: "350 80% 55%", pro: true, route: "/battle-royale", category: "actions" },
    { title: "Slot Machine", description: "Gift-triggered 3-reel slot machine with customizable jackpot rewards.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/slot-machine", category: "actions" },
    { title: "Vote Battle", description: "Two-sided animated vote bar. Viewers power their team with gifts.", hasPreview: true, color: "200 80% 55%", pro: true, route: "/vote-battle", category: "actions" },
    { title: "Stream Buddies", description: "Animated pixel-art avatars of your top supporters that walk, jump, and react to gifts and chat in real-time.", hasPreview: true, color: "45 100% 55%", pro: true, route: "/stream-buddies", category: "actions" },
    { title: "Pac-Man LIVE", description: "Interactive Pac-Man game controlled by chat commands. Gifts trigger power-ups, speed boosts, and shields!", hasPreview: true, color: "160 100% 45%", pro: true, route: "/pacman", category: "actions" },

    // Banners & Stream Design
    { title: "Promo Overlay", description: "Branded promo overlay with logo, animated rings, and follow CTA.", hasPreview: true, color: "160 100% 45%", route: "/promo-overlay", category: "design" },
    { title: "Stream Border", description: "10 premium animated transparent borders: Neon Pulse, Gold Metallic, Glitch & more.", hasPreview: true, color: "210 100% 55%", pro: true, route: "/stream-border", category: "design" },
    { title: "Webcam Frame", description: "10 premium animated webcam frames. Neon, Gold, Circuit, Holographic & more.", hasPreview: true, color: "180 100% 50%", pro: true, route: "/webcam-frame", category: "design" },
    { title: "Video Cam Frame", description: "Animated WebM video webcam frame with glow and color options.", hasPreview: true, color: "160 100% 45%", pro: true, route: "/video-cam-frame", category: "design" },
    { title: "Video Label Bar", description: "Animated WebM label bar overlay. Color customizable transparent loop.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/video-label-bar", category: "design" },
    { title: "Animated Background", description: "Looping animated backgrounds: gradients, particles, aurora, grid, waves.", hasPreview: true, color: "280 100% 65%", pro: true, route: "/animated-bg", category: "design" },
    { title: "Studio Backgrounds", description: "10 premium animated room backgrounds with customizable LED signs. Sofa scenes for every vibe.", hasPreview: false, color: "40 95% 55%", pro: true, route: "/backgrounds", category: "design" },
  ],
  "Alert Overlays": [
    { title: "Gift Alert", description: "Animated gift celebration with sender name, gift icon, and value display. Supports custom sounds per gift tier.", hasPreview: false, color: "280 100% 65%", pro: true, route: "/gift-alerts", tags: ["Gift", "Sound"] },
    { title: "Follow Alert", description: "Clean notification when a new user follows. Slide-in animation with avatar display.", hasPreview: false, color: "160 100% 45%", pro: true, route: "/follow-alerts", tags: ["Follow"] },
    { title: "Like Alert", description: "Floating hearts animation triggered by viewer likes with particle burst.", hasPreview: false, color: "350 90% 55%", pro: true, route: "/like-alerts", tags: ["Like", "Particles"] },
    { title: "Share Alert", description: "Stream share notification with animated share icon and username display.", hasPreview: false, color: "200 100% 55%", pro: true, route: "/share-alerts", tags: ["Share"] },
    { title: "Subscriber Alert", description: "Premium subscriber welcome alert with confetti and badge animation.", hasPreview: false, color: "45 100% 55%", pro: true, tags: ["Sub", "Premium"] },
    { title: "Raid Alert", description: "Epic raid announcement with viewer count and animated entrance.", hasPreview: false, color: "280 100% 65%", pro: true, tags: ["Raid"] },
    { title: "Milestone Alert", description: "Celebration overlay for follower/like milestones (1K, 5K, 10K, 100K).", hasPreview: false, color: "45 100% 55%", tags: ["Milestone", "Celebration"] },
    { title: "Combo Alert", description: "Stacking gift combo counter with multiplier animation and escalating effects.", hasPreview: false, color: "350 90% 55%", pro: true, route: "/gift-combo", tags: ["Gift", "Combo"] },
  ],
  "Widgets": [
    { title: "Viewer Count", description: "Live viewer count display with spike animations, peak tracking, and mini graph mode.", hasPreview: false, color: "45 100% 55%", pro: true, route: "/viewer-count", tags: ["Live", "Counter"] },
    { title: "Like Counter", description: "Real-time like counter with progress ring, bar, and animated digit modes.", hasPreview: false, color: "350 90% 55%", pro: true, route: "/like-counter", tags: ["Counter", "Like"] },
    { title: "Follower Goal", description: "Animated follower goal bar with milestone markers and completion celebration.", hasPreview: false, color: "160 100% 45%", pro: true, route: "/follower-goal", tags: ["Goal", "Follow"] },
    { title: "Leaderboard", description: "Live top gifters/fans leaderboard with animated ranking transitions.", hasPreview: false, color: "280 100% 65%", pro: true, route: "/leaderboard", tags: ["Ranking", "Gifters"] },
    { title: "Stream Timer", description: "Digital countdown/count-up timer with segment display. Extendable by gifts.", hasPreview: false, color: "200 100% 55%", pro: true, route: "/stream-timer", tags: ["Timer", "Countdown"] },
    { title: "Custom Text", description: "Dynamic text overlay supporting real-time variable binding ({viewers}, {likes}, etc).", hasPreview: false, color: "160 100% 45%", pro: true, route: "/custom-text", tags: ["Text", "Variables"] },
    { title: "Now Playing", description: "Display currently playing song with album art, artist name, and progress bar.", hasPreview: false, color: "141 73% 42%", pro: true, tags: ["Music", "Spotify"] },
    { title: "Chat Word Cloud", description: "Real-time word cloud generated from chat messages with dynamic sizing.", hasPreview: false, color: "200 100% 55%", tags: ["Chat", "Visual"] },
    { title: "Emote Wall", description: "Display emotes and stickers sent by viewers in an animated grid.", hasPreview: false, color: "45 100% 55%", tags: ["Emotes", "Chat"] },
    { title: "QR Code Overlay", description: "Display a QR code linking to your TikTok profile or any custom URL.", hasPreview: false, color: "0 0% 70%", tags: ["Utility"] },
    { title: "Notifications Ticker", description: "Scrolling event ticker bar showing follows, likes, gifts in real-time.", hasPreview: false, color: "200 100% 55%", pro: true, route: "/ticker", tags: ["Ticker", "Events"] },
    { title: "Animated Background", description: "Looping animated backgrounds: gradients, particles, aurora, grid, waves.", hasPreview: false, color: "280 100% 65%", pro: true, route: "/animated-bg", tags: ["Background", "Loop"] },
    { title: "Sound Reactive", description: "Audio visualizer with peak meters and waveform backgrounds synced to stream audio.", hasPreview: false, color: "200 100% 55%", pro: true, route: "/sound-reactive", tags: ["Audio", "Visual"] },
  ],
  "Interactive": [
    { title: "Poll Overlay", description: "Interactive polls where viewers vote through chat. Real-time animated bar chart results.", hasPreview: false, color: "200 100% 55%", pro: true, tags: ["Polls", "Interactive"] },
    { title: "Wheel Spin", description: "Spinning wheel triggered by gifts with custom prizes and sound effects.", hasPreview: false, color: "280 100% 65%", pro: true, tags: ["Game", "Gift"] },
    { title: "Giveaway Overlay", description: "Display active giveaway with entry count, requirements, and winner announcement.", hasPreview: false, color: "45 100% 55%", pro: true, tags: ["Giveaway"] },
    { title: "Trivia Quiz", description: "Interactive trivia game overlay. Viewers answer via chat to earn points.", hasPreview: false, color: "160 100% 45%", pro: true, tags: ["Game", "Quiz"] },
    { title: "Battle Royale", description: "Viewer vs viewer battle system triggered by gifts. Animated fight sequences.", hasPreview: false, color: "350 90% 55%", pro: true, tags: ["Game", "PvP"] },
    { title: "Prediction Overlay", description: "Viewers predict outcomes and compete. Animated reveal of correct answer.", hasPreview: false, color: "200 100% 55%", pro: true, tags: ["Game", "Predict"] },
  ],
  "Quick Setup": [
    { title: "Starter Pack", description: "Pre-configured set with chat, alerts, and TTS. One-click setup for beginners.", hasPreview: false, color: "160 100% 45%", tags: ["Bundle"] },
    { title: "Pro Gaming Pack", description: "Overlay set optimized for gaming streams with game integration alerts.", hasPreview: false, color: "280 100% 65%", pro: true, tags: ["Bundle", "Gaming"] },
    { title: "Music Pack", description: "Song request overlay, now playing widget, and music-themed alerts.", hasPreview: false, color: "141 73% 42%", pro: true, tags: ["Bundle", "Music"] },
    { title: "IRL Stream Pack", description: "Lightweight overlays for IRL streams. Chat box, location tag, and timer.", hasPreview: false, color: "45 100% 55%", tags: ["Bundle", "IRL"] },
    { title: "Full Suite", description: "Every overlay included. Complete streaming toolkit with all widgets and alerts.", hasPreview: false, color: "350 90% 55%", pro: true, tags: ["Bundle", "All"] },
  ],
  "Browser Sources": [
    { title: "Chat Source", description: "Copy this URL into OBS as a Browser Source to display live chat.", hasPreview: false, color: "200 100% 55%" },
    { title: "Alert Source", description: "Browser source URL for gift, follow, and like alerts.", hasPreview: false, color: "350 90% 55%" },
    { title: "TTS Source", description: "Browser source for Text-to-Speech overlay rendering.", hasPreview: false, color: "160 100% 45%" },
    { title: "Leaderboard Source", description: "Browser source for the top gifters leaderboard widget.", hasPreview: false, color: "280 100% 65%" },
    { title: "Goal Source", description: "Browser source for goal progress overlays.", hasPreview: false, color: "45 100% 55%" },
    { title: "Timer Source", description: "Browser source for the stream timer widget.", hasPreview: false, color: "200 100% 55%" },
    { title: "Viewer Count Source", description: "Browser source for live viewer count display.", hasPreview: false, color: "45 100% 55%" },
    { title: "Custom Text Source", description: "Browser source for custom text overlays.", hasPreview: false, color: "160 100% 45%" },
  ],
};

const categoryTabs = ["All", ...OVERLAY_CATEGORIES.map(c => c.label)];
const allItems = overlayData["Overlays"];

const Overlays = () => {
  const [activeTab, setActiveTab] = useState(categoryTabs[0]);
  const [fullscreenOverlay, setFullscreenOverlay] = useState<string | null>(null);
  const FullscreenComponent = fullscreenOverlay ? overlayPreviews[fullscreenOverlay] : null;
  const activeCat = OVERLAY_CATEGORIES.find(c => c.label === activeTab);
  const filteredItems = activeCat ? allItems.filter(o => o.category === activeCat.id) : allItems;

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
                  <div className="relative h-[280px] overflow-hidden">
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
