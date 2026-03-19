import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { TikTokLiveProvider } from "@/hooks/use-tiktok-live-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ElectronTitleBar } from "@/components/ElectronTitleBar";
import { isElectron } from "@/lib/electron";
import { toast } from "sonner";

// ── Lazy page imports ───────────────────────────────────────
const Index = lazy(() => import("./pages/Index"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Setup = lazy(() => import("./pages/Setup"));
const Overlays = lazy(() => import("./pages/Overlays"));
const GoalOverlays = lazy(() => import("./pages/GoalOverlays"));
const GoalOverlayRenderer = lazy(() => import("./pages/GoalOverlayRenderer"));
const GiftAlertOverlay = lazy(() => import("./pages/GiftAlertOverlay"));
const ChatBoxOverlay = lazy(() => import("./pages/ChatBoxOverlay"));
const LikeAlertOverlay = lazy(() => import("./pages/LikeAlertOverlay"));
const FollowAlertOverlay = lazy(() => import("./pages/FollowAlertOverlay"));
const ShareAlertOverlay = lazy(() => import("./pages/ShareAlertOverlay"));
const LikeCounterOverlay = lazy(() => import("./pages/LikeCounterOverlay"));
const FollowerGoalOverlay = lazy(() => import("./pages/FollowerGoalOverlay"));
const ViewerCountOverlay = lazy(() => import("./pages/ViewerCountOverlay"));
const LeaderboardOverlay = lazy(() => import("./pages/LeaderboardOverlay"));
const StreamTimerOverlay = lazy(() => import("./pages/StreamTimerOverlay"));
const CustomTextOverlay = lazy(() => import("./pages/CustomTextOverlay"));
const Actions = lazy(() => import("./pages/Actions"));
const Sounds = lazy(() => import("./pages/Sounds"));
const Chat = lazy(() => import("./pages/Chat"));
const Points = lazy(() => import("./pages/Points"));
const Song = lazy(() => import("./pages/Song"));
const Tools = lazy(() => import("./pages/Tools"));
const Pro = lazy(() => import("./pages/Pro"));
const ChatCommands = lazy(() => import("./pages/ChatCommands"));
const AutoModeration = lazy(() => import("./pages/AutoModeration"));
const RecentActivity = lazy(() => import("./pages/RecentActivity"));
const Widgets = lazy(() => import("./pages/Widgets"));
const Integrations = lazy(() => import("./pages/Integrations"));
const BrandSettings = lazy(() => import("./pages/BrandSettings"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ScreenRenderer = lazy(() => import("./pages/ScreenRenderer"));
const TTSOverlayPage = lazy(() => import("./pages/TTSOverlayPage"));
const GiftComboOverlay = lazy(() => import("./pages/GiftComboOverlay"));
const TickerOverlay = lazy(() => import("./pages/TickerOverlay"));
const AnimatedBgOverlay = lazy(() => import("./pages/AnimatedBgOverlay"));
const SoundReactiveOverlay = lazy(() => import("./pages/SoundReactiveOverlay"));
const SocialRotatorOverlay = lazy(() => import("./pages/SocialRotatorOverlay"));
const GiftFireworkOverlay = lazy(() => import("./pages/GiftFireworkOverlay"));
const PromoOverlay = lazy(() => import("./pages/PromoOverlay"));
const StreamBorderOverlay = lazy(() => import("./pages/StreamBorderOverlay"));
const WebcamFrameOverlay = lazy(() => import("./pages/WebcamFrameOverlay"));
const StreamPresets = lazy(() => import("./pages/StreamPresets"));
const KeystrokeTriggers = lazy(() => import("./pages/KeystrokeTriggers"));
const GTATriggers = lazy(() => import("./pages/GTATriggers"));
const PresetDetail = lazy(() => import("./pages/PresetDetail"));
const VideoCamFrameOverlay = lazy(() => import("./pages/VideoCamFrameOverlay"));
const VideoLabelBarOverlay = lazy(() => import("./pages/VideoLabelBarOverlay"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BackgroundsPage = lazy(() => import("./pages/BackgroundsPage"));
const CoinJarOverlay = lazy(() => import("./pages/CoinJarOverlay"));
const SpinWheelOverlay = lazy(() => import("./pages/SpinWheelOverlay"));
const GiftActionsOverlay = lazy(() => import("./pages/GiftActionsOverlay"));
const BattleRoyaleOverlay = lazy(() => import("./pages/BattleRoyaleOverlay"));
const SlotMachineOverlay = lazy(() => import("./pages/SlotMachineOverlay"));
const VoteBattleOverlay = lazy(() => import("./pages/VoteBattleOverlay"));
const ProgressRaceOverlay = lazy(() => import("./pages/ProgressRaceOverlay"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const AgencyCreate = lazy(() => import("./pages/AgencyCreate"));
const AgencyDetail = lazy(() => import("./pages/AgencyDetail"));
const EnterpriseDashboard = lazy(() => import("./pages/EnterpriseDashboard"));
const StreamBuddies = lazy(() => import("./pages/StreamBuddies"));
const PacManOverlay = lazy(() => import("./pages/PacManOverlay"));
const DownloadPage = lazy(() => import("./pages/DownloadPage"));
const NeonEventListOverlay = lazy(() => import("./pages/NeonEventListOverlay"));
const GlowAlertPopupOverlay = lazy(() => import("./pages/GlowAlertPopupOverlay"));
const CircularProfileWidgetOverlay = lazy(() => import("./pages/CircularProfileWidgetOverlay"));
const ElectricGiftAlertOverlay = lazy(() => import("./pages/ElectricGiftAlertOverlay"));

// ── Lazy renderer imports ───────────────────────────────────
const GiftAlertRenderer = lazy(() => import("./pages/renderers/GiftAlertRenderer"));
const ChatBoxRenderer = lazy(() => import("./pages/renderers/ChatBoxRenderer"));
const LikeAlertRenderer = lazy(() => import("./pages/renderers/LikeAlertRenderer"));
const FollowAlertRenderer = lazy(() => import("./pages/renderers/FollowAlertRenderer"));
const ShareAlertRenderer = lazy(() => import("./pages/renderers/ShareAlertRenderer"));
const LikeCounterRenderer = lazy(() => import("./pages/renderers/LikeCounterRenderer"));
const FollowerGoalRenderer = lazy(() => import("./pages/renderers/FollowerGoalRenderer"));
const ViewerCountRenderer = lazy(() => import("./pages/renderers/ViewerCountRenderer"));
const LeaderboardRenderer = lazy(() => import("./pages/renderers/LeaderboardRenderer"));
const StreamTimerRenderer = lazy(() => import("./pages/renderers/StreamTimerRenderer"));
const CustomTextRenderer = lazy(() => import("./pages/renderers/CustomTextRenderer"));
const TTSRenderer = lazy(() => import("./pages/renderers/TTSRenderer"));
const GiftComboRenderer = lazy(() => import("./pages/renderers/GiftComboRenderer"));
const TickerRenderer = lazy(() => import("./pages/renderers/TickerRenderer"));
const AnimatedBgRenderer = lazy(() => import("./pages/renderers/AnimatedBgRenderer"));
const SoundReactiveRenderer = lazy(() => import("./pages/renderers/SoundReactiveRenderer"));
const SocialRotatorRenderer = lazy(() => import("./pages/renderers/SocialRotatorRenderer"));
const GiftFireworkRenderer = lazy(() => import("./pages/renderers/GiftFireworkRenderer"));
const PromoOverlayRenderer = lazy(() => import("./pages/renderers/PromoOverlayRenderer"));
const StreamBorderRenderer = lazy(() => import("./pages/renderers/StreamBorderRenderer"));
const WebcamFrameRenderer = lazy(() => import("./pages/renderers/WebcamFrameRenderer"));
const EventFeedRenderer = lazy(() => import("./pages/renderers/EventFeedRenderer"));
const BackgroundRenderer = lazy(() => import("./pages/renderers/BackgroundRenderer"));
const CoinJarRenderer = lazy(() => import("./pages/renderers/CoinJarRenderer"));
const SpinWheelRenderer = lazy(() => import("./pages/renderers/SpinWheelRenderer"));
const GiftActionsRenderer = lazy(() => import("./pages/renderers/GiftActionsRenderer"));
const BattleRoyaleRenderer = lazy(() => import("./pages/renderers/BattleRoyaleRenderer"));
const SlotMachineRenderer = lazy(() => import("./pages/renderers/SlotMachineRenderer"));
const VoteBattleRenderer = lazy(() => import("./pages/renderers/VoteBattleRenderer"));
const ProgressRaceRenderer = lazy(() => import("./pages/renderers/ProgressRaceRenderer"));
const VideoCamFrameRenderer = lazy(() => import("./pages/renderers/VideoCamFrameRenderer"));
const VideoLabelBarRenderer = lazy(() => import("./pages/renderers/VideoLabelBarRenderer"));
const StreamBuddiesRenderer = lazy(() => import("./pages/renderers/StreamBuddiesRenderer"));
const PacManRenderer = lazy(() => import("./pages/renderers/PacManRenderer"));
const NeonEventListRenderer = lazy(() => import("./pages/renderers/NeonEventListRenderer"));
const GlowAlertPopupRenderer = lazy(() => import("./pages/renderers/GlowAlertPopupRenderer"));
const CircularProfileWidgetRenderer = lazy(() => import("./pages/renderers/CircularProfileWidgetRenderer"));
const ElectricGiftAlertRenderer = lazy(() => import("./pages/renderers/ElectricGiftAlertRenderer"));

// ── Suspense fallback (invisible — overlays must not flash) ─
const Fallback = () => null;

// Helper to wrap protected routes
const P = ({ children }: { children: React.ReactNode }) => <ProtectedRoute>{children}</ProtectedRoute>;

const queryClient = new QueryClient();

function ElectronUpdateNotifier() {
  useEffect(() => {
    if (!isElectron()) return;
    window.electronAPI?.updater?.onUpdateDownloaded(() => {
      toast("Update Ready", {
        description: "A new version of TikUp Pro has been downloaded.",
        action: {
          label: "Restart & Install",
          onClick: () => window.electronAPI?.updater?.install(),
        },
        duration: Infinity,
      });
    });
  }, []);
  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ElectronUpdateNotifier />
      <ElectronTitleBar />
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Public overlay renderer routes - NO auth provider, no login required */}
          <Route path="/screen/:publicToken" element={<ScreenRenderer />} />
          <Route path="/overlay/goal/:publicToken" element={<GoalOverlayRenderer />} />
          <Route path="/overlay/gift-alert/:publicToken" element={<GiftAlertRenderer />} />
          <Route path="/overlay/chat-box/:publicToken" element={<ChatBoxRenderer />} />
          <Route path="/overlay/like-alert/:publicToken" element={<LikeAlertRenderer />} />
          <Route path="/overlay/follow-alert/:publicToken" element={<FollowAlertRenderer />} />
          <Route path="/overlay/share-alert/:publicToken" element={<ShareAlertRenderer />} />
          <Route path="/overlay/like-counter/:publicToken" element={<LikeCounterRenderer />} />
          <Route path="/overlay/follower-goal/:publicToken" element={<FollowerGoalRenderer />} />
          <Route path="/overlay/viewer-count/:publicToken" element={<ViewerCountRenderer />} />
          <Route path="/overlay/leaderboard/:publicToken" element={<LeaderboardRenderer />} />
          <Route path="/overlay/stream-timer/:publicToken" element={<StreamTimerRenderer />} />
          <Route path="/overlay/custom-text/:publicToken" element={<CustomTextRenderer />} />
          <Route path="/overlay/tts/:publicToken" element={<TTSRenderer />} />
          <Route path="/overlay/gift-combo/:publicToken" element={<GiftComboRenderer />} />
          <Route path="/overlay/ticker/:publicToken" element={<TickerRenderer />} />
          <Route path="/overlay/animated-bg/:publicToken" element={<AnimatedBgRenderer />} />
          <Route path="/overlay/sound-reactive/:publicToken" element={<SoundReactiveRenderer />} />
          <Route path="/overlay/social-rotator/:publicToken" element={<SocialRotatorRenderer />} />
          <Route path="/overlay/gift-firework/:publicToken" element={<GiftFireworkRenderer />} />
          <Route path="/overlay/promo/:publicToken" element={<PromoOverlayRenderer />} />
          <Route path="/overlay/stream-border/:publicToken" element={<StreamBorderRenderer />} />
          <Route path="/overlay/webcam-frame/:publicToken" element={<WebcamFrameRenderer />} />
          <Route path="/overlay/event-feed/:publicToken" element={<EventFeedRenderer />} />
          <Route path="/overlay/coin-jar/:publicToken" element={<CoinJarRenderer />} />
          <Route path="/overlay/spin-wheel/:publicToken" element={<SpinWheelRenderer />} />
          <Route path="/overlay/gift-actions/:publicToken" element={<GiftActionsRenderer />} />
          <Route path="/overlay/battle-royale/:publicToken" element={<BattleRoyaleRenderer />} />
          <Route path="/overlay/slot-machine/:publicToken" element={<SlotMachineRenderer />} />
          <Route path="/overlay/vote-battle/:publicToken" element={<VoteBattleRenderer />} />
          <Route path="/overlay/progress-race/:publicToken" element={<ProgressRaceRenderer />} />
          <Route path="/overlay/video-cam-frame/:publicToken" element={<VideoCamFrameRenderer />} />
          <Route path="/overlay/video-label-bar/:publicToken" element={<VideoLabelBarRenderer />} />
          <Route path="/overlay/stream-buddies/:publicToken" element={<StreamBuddiesRenderer />} />
          <Route path="/overlay/pacman/:publicToken" element={<PacManRenderer />} />
          <Route path="/overlay/neon-event-list/:publicToken" element={<NeonEventListRenderer />} />
          <Route path="/overlay/glow-alert-popup/:publicToken" element={<GlowAlertPopupRenderer />} />
          <Route path="/overlay/circular-profile-widget/:publicToken" element={<CircularProfileWidgetRenderer />} />
          <Route path="/overlay/electric-gift-alert/:publicToken" element={<ElectricGiftAlertRenderer />} />
          <Route path="/overlay/backgrounds/:theme" element={<BackgroundRenderer />} />
          <Route path="/widget/backgrounds/:theme" element={<BackgroundRenderer />} />

          {/* All other routes wrapped in AuthProvider */}
          <Route path="/*" element={
            <AuthProvider>
              <TikTokLiveProvider>
              <Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<P><Index /></P>} />
                <Route path="/setup" element={<P><Setup /></P>} />
                <Route path="/overlays" element={<P><Overlays /></P>} />
                <Route path="/goal-overlays" element={<P><GoalOverlays /></P>} />
                <Route path="/gift-alerts" element={<P><GiftAlertOverlay /></P>} />
                <Route path="/chat-overlay" element={<P><ChatBoxOverlay /></P>} />
                <Route path="/like-alerts" element={<P><LikeAlertOverlay /></P>} />
                <Route path="/follow-alerts" element={<P><FollowAlertOverlay /></P>} />
                <Route path="/share-alerts" element={<P><ShareAlertOverlay /></P>} />
                <Route path="/like-counter" element={<P><LikeCounterOverlay /></P>} />
                <Route path="/follower-goal" element={<P><FollowerGoalOverlay /></P>} />
                <Route path="/viewer-count" element={<P><ViewerCountOverlay /></P>} />
                <Route path="/leaderboard" element={<P><LeaderboardOverlay /></P>} />
                <Route path="/stream-timer" element={<P><StreamTimerOverlay /></P>} />
                <Route path="/custom-text" element={<P><CustomTextOverlay /></P>} />
                <Route path="/actions" element={<P><Actions /></P>} />
                <Route path="/sounds" element={<P><Sounds /></P>} />
                <Route path="/sound-alerts" element={<Navigate to="/actions" replace />} />
                <Route path="/chat" element={<P><Chat /></P>} />
                <Route path="/points" element={<P><Points /></P>} />
                <Route path="/chat-commands" element={<P><ChatCommands /></P>} />
                <Route path="/auto-moderation" element={<P><AutoModeration /></P>} />
                <Route path="/recent-activity" element={<P><RecentActivity /></P>} />
                <Route path="/widgets" element={<P><Widgets /></P>} />
                <Route path="/integrations" element={<P><Integrations /></P>} />
                <Route path="/brand-settings" element={<P><BrandSettings /></P>} />
                <Route path="/admin" element={<P><Admin /></P>} />
                <Route path="/song" element={<P><Song /></P>} />
                <Route path="/tools" element={<P><Tools /></P>} />
                <Route path="/pro" element={<P><Pro /></P>} />
                <Route path="/tts" element={<P><TTSOverlayPage /></P>} />
                <Route path="/gift-combo" element={<P><GiftComboOverlay /></P>} />
                <Route path="/ticker" element={<P><TickerOverlay /></P>} />
                <Route path="/animated-bg" element={<P><AnimatedBgOverlay /></P>} />
                <Route path="/sound-reactive" element={<P><SoundReactiveOverlay /></P>} />
                <Route path="/social-rotator" element={<P><SocialRotatorOverlay /></P>} />
                <Route path="/gift-firework" element={<P><GiftFireworkOverlay /></P>} />
                <Route path="/promo-overlay" element={<P><PromoOverlay /></P>} />
                <Route path="/stream-border" element={<P><StreamBorderOverlay /></P>} />
                <Route path="/webcam-frame" element={<P><WebcamFrameOverlay /></P>} />
                <Route path="/gift-browser" element={<Navigate to="/actions" replace />} />
                <Route path="/keystroke-triggers" element={<P><KeystrokeTriggers /></P>} />
                <Route path="/gta-triggers" element={<P><GTATriggers /></P>} />
                <Route path="/presets" element={<P><StreamPresets /></P>} />
                <Route path="/presets/:presetId" element={<P><PresetDetail /></P>} />
                <Route path="/video-cam-frame" element={<P><VideoCamFrameOverlay /></P>} />
                <Route path="/video-label-bar" element={<P><VideoLabelBarOverlay /></P>} />
                <Route path="/backgrounds" element={<P><BackgroundsPage /></P>} />
                <Route path="/coin-jar" element={<P><CoinJarOverlay /></P>} />
                <Route path="/spin-wheel" element={<P><SpinWheelOverlay /></P>} />
                <Route path="/gift-actions" element={<P><GiftActionsOverlay /></P>} />
                <Route path="/battle-royale" element={<P><BattleRoyaleOverlay /></P>} />
                <Route path="/slot-machine" element={<P><SlotMachineOverlay /></P>} />
                <Route path="/vote-battle" element={<P><VoteBattleOverlay /></P>} />
                <Route path="/progress-race" element={<P><ProgressRaceOverlay /></P>} />
                <Route path="/agencies" element={<P><AgencyDashboard /></P>} />
                <Route path="/agency/new" element={<P><AgencyCreate /></P>} />
                <Route path="/agency/:id" element={<P><AgencyDetail /></P>} />
                <Route path="/stream-buddies" element={<P><StreamBuddies /></P>} />
                <Route path="/pacman" element={<P><PacManOverlay /></P>} />
                <Route path="/neon-event-list" element={<P><NeonEventListOverlay /></P>} />
                <Route path="/glow-alert-popup" element={<P><GlowAlertPopupOverlay /></P>} />
                <Route path="/circular-profile-widget" element={<P><CircularProfileWidgetOverlay /></P>} />
                <Route path="/electric-gift-alert" element={<P><ElectricGiftAlertOverlay /></P>} />
                <Route path="/enterprise" element={<P><EnterpriseDashboard /></P>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </TikTokLiveProvider>
            </AuthProvider>
          } />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
