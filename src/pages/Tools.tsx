import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import { Wrench, Info } from "lucide-react";

const tools = [
  { title: "Stream Timer", description: "A configurable countdown or count-up timer. Viewers can extend the timer by sending gifts. Great for subathon-style streams." },
  { title: "QR Code Generator", description: "Generate QR codes linking to your TikTok profile or any custom URL. Display directly on stream as an overlay." },
  { title: "Gift Calculator", description: "Calculate the real-world value of TikTok gifts. Track your total earnings per stream session with detailed breakdowns." },
  { title: "Theme Editor", description: "Customize colors, fonts, borders, and animations for all your overlays and widgets from a single configuration panel." },
  { title: "TTS Tester", description: "Preview how Text-to-Speech messages will sound before going live. Test different voices, speeds, and language settings." },
  { title: "Stream Analytics", description: "View detailed analytics including peak viewers, average watch time, gift breakdown, follower growth, and engagement rates." },
  { title: "Chat Logger", description: "Log and export all chat messages from your live stream. Useful for moderation review and content creation." },
  { title: "Overlay Inspector", description: "Debug and inspect your overlay browser sources. Check connection status, preview rendering, and test events." },
  { title: "Event Simulator", description: "Simulate TikTok events (gifts, follows, likes) to test your actions and overlays without being live." },
  { title: "Webhook Tester", description: "Test outgoing webhooks and HTTP requests. Verify that your integrations are receiving data correctly." },
  { title: "Backup Manager", description: "Create and restore backups of all your settings, overlays, actions, and configurations." },
  { title: "API Documentation", description: "Browse the TikUp API documentation. Learn how to build custom integrations and extend functionality." },
];

const Tools = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
          {["All Tools", "Stream", "Analytics", "Development", "Utilities"].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Utility <span className="text-primary font-medium">Tools</span> to enhance your streaming workflow.
              From analytics and calculators to debug tools and API references. Everything you need to run a professional TikTok LIVE stream.
            </p>
          </div>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <OverlayCard
              key={tool.title}
              title={tool.title}
              description={tool.description}
              hasPreview={false}
              url="#"
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tools;
