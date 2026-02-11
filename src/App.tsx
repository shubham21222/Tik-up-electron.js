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
import Actions from "./pages/Actions";
import Sounds from "./pages/Sounds";
import Chat from "./pages/Chat";
import Points from "./pages/Points";
import Song from "./pages/Song";
import Tools from "./pages/Tools";
import Pro from "./pages/Pro";
import Giveaways from "./pages/Giveaways";
import Auth from "./pages/Auth";
import ScreenRenderer from "./pages/ScreenRenderer";
import TTSOverlayPage from "./pages/TTSOverlayPage";
import TTSRenderer from "./pages/renderers/TTSRenderer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/follower-goal" element={<FollowerGoalOverlay />} />
            <Route path="/viewer-count" element={<ViewerCountOverlay />} />
            <Route path="/leaderboard" element={<LeaderboardOverlay />} />
            <Route path="/stream-timer" element={<StreamTimerOverlay />} />
            <Route path="/custom-text" element={<CustomTextOverlay />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/points" element={<Points />} />
            <Route path="/giveaways" element={<Giveaways />} />
            <Route path="/polls" element={<Giveaways />} />
            <Route path="/chat-commands" element={<Chat />} />
            <Route path="/auto-moderation" element={<Chat />} />
            <Route path="/song" element={<Song />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/pro" element={<Pro />} />
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
            <Route path="/tts" element={<TTSOverlayPage />} />
            <Route path="/overlay/tts/:publicToken" element={<TTSRenderer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
