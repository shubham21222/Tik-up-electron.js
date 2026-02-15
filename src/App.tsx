import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Setup from "./pages/Setup";
import Overlays from "./pages/Overlays";
import GoalOverlays from "./pages/GoalOverlays";
import GoalOverlayRenderer from "./pages/GoalOverlayRenderer";
import GiftAlertOverlay from "./pages/GiftAlertOverlay";
import ChatBoxOverlay from "./pages/ChatBoxOverlay";
import LikeAlertOverlay from "./pages/LikeAlertOverlay";
import FollowAlertOverlay from "./pages/FollowAlertOverlay";
import ShareAlertOverlay from "./pages/ShareAlertOverlay";
import LikeCounterOverlay from "./pages/LikeCounterOverlay";
import FollowerGoalOverlay from "./pages/FollowerGoalOverlay";
import ViewerCountOverlay from "./pages/ViewerCountOverlay";
import LeaderboardOverlay from "./pages/LeaderboardOverlay";
import StreamTimerOverlay from "./pages/StreamTimerOverlay";
import CustomTextOverlay from "./pages/CustomTextOverlay";
import GiftAlertRenderer from "./pages/renderers/GiftAlertRenderer";
import ChatBoxRenderer from "./pages/renderers/ChatBoxRenderer";
import LikeAlertRenderer from "./pages/renderers/LikeAlertRenderer";
import FollowAlertRenderer from "./pages/renderers/FollowAlertRenderer";
import ShareAlertRenderer from "./pages/renderers/ShareAlertRenderer";
import LikeCounterRenderer from "./pages/renderers/LikeCounterRenderer";
import FollowerGoalRenderer from "./pages/renderers/FollowerGoalRenderer";
import ViewerCountRenderer from "./pages/renderers/ViewerCountRenderer";
import LeaderboardRenderer from "./pages/renderers/LeaderboardRenderer";
import StreamTimerRenderer from "./pages/renderers/StreamTimerRenderer";
import CustomTextRenderer from "./pages/renderers/CustomTextRenderer";
import GiftComboRenderer from "./pages/renderers/GiftComboRenderer";
import TickerRenderer from "./pages/renderers/TickerRenderer";
import AnimatedBgRenderer from "./pages/renderers/AnimatedBgRenderer";
import SoundReactiveRenderer from "./pages/renderers/SoundReactiveRenderer";
import BackgroundRenderer from "./pages/renderers/BackgroundRenderer";
import Actions from "./pages/Actions";
import Sounds from "./pages/Sounds";
import Chat from "./pages/Chat";
import Points from "./pages/Points";
import Song from "./pages/Song";
import Tools from "./pages/Tools";
import Pro from "./pages/Pro";

import Polls from "./pages/Polls";
import ChatCommands from "./pages/ChatCommands";
import AutoModeration from "./pages/AutoModeration";
import RecentActivity from "./pages/RecentActivity";
import Widgets from "./pages/Widgets";
import Integrations from "./pages/Integrations";
import BrandSettings from "./pages/BrandSettings";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ScreenRenderer from "./pages/ScreenRenderer";
import TTSOverlayPage from "./pages/TTSOverlayPage";
import TTSRenderer from "./pages/renderers/TTSRenderer";
import GiftComboOverlay from "./pages/GiftComboOverlay";
import TickerOverlay from "./pages/TickerOverlay";
import AnimatedBgOverlay from "./pages/AnimatedBgOverlay";
import SoundReactiveOverlay from "./pages/SoundReactiveOverlay";
import SocialRotatorOverlay from "./pages/SocialRotatorOverlay";
import GiftFireworkOverlay from "./pages/GiftFireworkOverlay";
import PromoOverlay from "./pages/PromoOverlay";
import StreamBorderOverlay from "./pages/StreamBorderOverlay";
import WebcamFrameOverlay from "./pages/WebcamFrameOverlay";
import SocialRotatorRenderer from "./pages/renderers/SocialRotatorRenderer";
import GiftFireworkRenderer from "./pages/renderers/GiftFireworkRenderer";
import PromoOverlayRenderer from "./pages/renderers/PromoOverlayRenderer";
import StreamBorderRenderer from "./pages/renderers/StreamBorderRenderer";
import WebcamFrameRenderer from "./pages/renderers/WebcamFrameRenderer";
import EventFeedRenderer from "./pages/renderers/EventFeedRenderer";
import GiftBrowser from "./pages/GiftBrowser";
import StreamPresets from "./pages/StreamPresets";
import KeystrokeTriggers from "./pages/KeystrokeTriggers";
import PresetDetail from "./pages/PresetDetail";
import VideoCamFrameOverlay from "./pages/VideoCamFrameOverlay";
import VideoLabelBarOverlay from "./pages/VideoLabelBarOverlay";
import NotFound from "./pages/NotFound";
import BackgroundsPage from "./pages/BackgroundsPage";
import CoinJarOverlay from "./pages/CoinJarOverlay";
import CoinJarRenderer from "./pages/renderers/CoinJarRenderer";
import SpinWheelOverlay from "./pages/SpinWheelOverlay";
import SpinWheelRenderer from "./pages/renderers/SpinWheelRenderer";
import GiftActionsOverlay from "./pages/GiftActionsOverlay";
import GiftActionsRenderer from "./pages/renderers/GiftActionsRenderer";
import BattleRoyaleOverlay from "./pages/BattleRoyaleOverlay";
import BattleRoyaleRenderer from "./pages/renderers/BattleRoyaleRenderer";
import SlotMachineOverlay from "./pages/SlotMachineOverlay";
import SlotMachineRenderer from "./pages/renderers/SlotMachineRenderer";
import VoteBattleOverlay from "./pages/VoteBattleOverlay";
import VoteBattleRenderer from "./pages/renderers/VoteBattleRenderer";
import ProgressRaceOverlay from "./pages/ProgressRaceOverlay";
import ProgressRaceRenderer from "./pages/renderers/ProgressRaceRenderer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/overlay/backgrounds/:theme" element={<BackgroundRenderer />} />
          <Route path="/widget/backgrounds/:theme" element={<BackgroundRenderer />} />

          {/* All other routes wrapped in AuthProvider */}
          <Route path="/*" element={
            <AuthProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/overlays" element={<Overlays />} />
                <Route path="/goal-overlays" element={<GoalOverlays />} />
                <Route path="/gift-alerts" element={<GiftAlertOverlay />} />
                <Route path="/chat-overlay" element={<ChatBoxOverlay />} />
                <Route path="/like-alerts" element={<LikeAlertOverlay />} />
                <Route path="/follow-alerts" element={<FollowAlertOverlay />} />
                <Route path="/share-alerts" element={<ShareAlertOverlay />} />
                <Route path="/like-counter" element={<LikeCounterOverlay />} />
                {/* /follower-goal removed — covered by /goal-overlays */}
                <Route path="/viewer-count" element={<ViewerCountOverlay />} />
                <Route path="/leaderboard" element={<LeaderboardOverlay />} />
                <Route path="/stream-timer" element={<StreamTimerOverlay />} />
                <Route path="/custom-text" element={<CustomTextOverlay />} />
                <Route path="/actions" element={<Actions />} />
                <Route path="/sounds" element={<Sounds />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/points" element={<Points />} />
                
                <Route path="/polls" element={<Polls />} />
                <Route path="/chat-commands" element={<ChatCommands />} />
                <Route path="/auto-moderation" element={<AutoModeration />} />
                <Route path="/recent-activity" element={<RecentActivity />} />
                <Route path="/widgets" element={<Widgets />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/brand-settings" element={<BrandSettings />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/song" element={<Song />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/pro" element={<Pro />} />
                <Route path="/tts" element={<TTSOverlayPage />} />
                <Route path="/gift-combo" element={<GiftComboOverlay />} />
                <Route path="/ticker" element={<TickerOverlay />} />
                <Route path="/animated-bg" element={<AnimatedBgOverlay />} />
                <Route path="/sound-reactive" element={<SoundReactiveOverlay />} />
                <Route path="/social-rotator" element={<SocialRotatorOverlay />} />
                <Route path="/gift-firework" element={<GiftFireworkOverlay />} />
                <Route path="/promo-overlay" element={<PromoOverlay />} />
                <Route path="/stream-border" element={<StreamBorderOverlay />} />
                <Route path="/webcam-frame" element={<WebcamFrameOverlay />} />
                <Route path="/gift-browser" element={<GiftBrowser />} />
                <Route path="/keystroke-triggers" element={<KeystrokeTriggers />} />
                <Route path="/presets" element={<StreamPresets />} />
                <Route path="/presets/:presetId" element={<PresetDetail />} />
                <Route path="/video-cam-frame" element={<VideoCamFrameOverlay />} />
                <Route path="/video-label-bar" element={<VideoLabelBarOverlay />} />
                <Route path="/backgrounds" element={<BackgroundsPage />} />
                <Route path="/coin-jar" element={<CoinJarOverlay />} />
                <Route path="/spin-wheel" element={<SpinWheelOverlay />} />
                <Route path="/gift-actions" element={<GiftActionsOverlay />} />
                <Route path="/battle-royale" element={<BattleRoyaleOverlay />} />
                <Route path="/slot-machine" element={<SlotMachineOverlay />} />
                <Route path="/vote-battle" element={<VoteBattleOverlay />} />
                <Route path="/progress-race" element={<ProgressRaceOverlay />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
