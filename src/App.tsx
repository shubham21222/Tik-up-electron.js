import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import Overlays from "./pages/Overlays";
import GoalOverlays from "./pages/GoalOverlays";
import Actions from "./pages/Actions";
import Sounds from "./pages/Sounds";
import Chat from "./pages/Chat";
import Points from "./pages/Points";
import Song from "./pages/Song";
import Tools from "./pages/Tools";
import Pro from "./pages/Pro";
import Auth from "./pages/Auth";
import ScreenRenderer from "./pages/ScreenRenderer";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/overlays" element={<Overlays />} />
            <Route path="/goal-overlays" element={<GoalOverlays />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/points" element={<Points />} />
            <Route path="/song" element={<Song />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/pro" element={<Pro />} />
            <Route path="/screen/:publicToken" element={<ScreenRenderer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
