import AppLayout from "@/components/AppLayout";
import { Layers, Plus, Image, BarChart3, Target, MessageSquare, Trophy } from "lucide-react";

const overlayTypes = [
  { icon: MessageSquare, title: "Chat Overlay", description: "Display live chat messages on your stream with custom styling and animations.", count: 0 },
  { icon: Target, title: "Alert Box", description: "Show animated alerts for follows, gifts, shares, and other viewer actions.", count: 0 },
  { icon: BarChart3, title: "Goal Widget", description: "Set gift or follower goals and display progress bars on your stream.", count: 0 },
  { icon: Trophy, title: "Leaderboard", description: "Show top gifters, most active chatters, and viewer rankings in real time.", count: 0 },
  { icon: Image, title: "Custom Widget", description: "Create fully custom HTML/CSS widgets and embed them in your stream overlay.", count: 0 },
];

const Overlays = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Layers size={28} className="text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Overlays</h1>
            </div>
            <p className="text-muted-foreground">Add professional overlays and widgets to your TikTok LIVE stream.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} />
            New Overlay
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overlayTypes.map((overlay) => (
            <div
              key={overlay.title}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <overlay.icon size={20} />
                  </div>
                  <span className="text-xs text-muted-foreground">{overlay.count} active</span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{overlay.title}</h3>
                <p className="text-sm text-muted-foreground">{overlay.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Overlays;
