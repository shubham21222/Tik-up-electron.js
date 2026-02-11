import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import TabNav from "@/components/TabNav";
import { Info } from "lucide-react";
import { useState } from "react";

const toolData = {
  "All Tools": [
    { title: "Stream Timer", description: "A configurable countdown or count-up timer. Viewers can extend it with gifts." },
    { title: "QR Code Generator", description: "Generate QR codes linking to your TikTok profile or any URL." },
    { title: "Gift Calculator", description: "Calculate the real-world value of TikTok gifts." },
    { title: "Theme Editor", description: "Customize colors, fonts, and animations for all overlays." },
    { title: "TTS Tester", description: "Preview TTS messages before going live." },
    { title: "Event Simulator", description: "Simulate TikTok events to test actions and overlays." },
  ],
  "Stream": [
    { title: "Stream Timer", description: "Configurable countdown/count-up timer extendable by gifts." },
    { title: "Stream Analytics", description: "Peak viewers, average watch time, gift breakdown, and more." },
    { title: "Chat Logger", description: "Log and export all chat messages from your live stream." },
  ],
  "Analytics": [
    { title: "Stream Analytics", description: "Detailed analytics including viewer engagement and gift breakdown." },
    { title: "Gift Calculator", description: "Track earnings per stream session with detailed breakdowns." },
  ],
  "Development": [
    { title: "Overlay Inspector", description: "Debug and inspect your overlay browser sources." },
    { title: "Event Simulator", description: "Simulate events to test your actions and overlays." },
    { title: "Webhook Tester", description: "Test outgoing webhooks and HTTP requests." },
    { title: "API Documentation", description: "Browse TikUp API docs for custom integrations." },
  ],
  "Utilities": [
    { title: "QR Code Generator", description: "Generate QR codes for your TikTok profile or any URL." },
    { title: "Backup Manager", description: "Create and restore backups of all your settings." },
    { title: "TTS Tester", description: "Preview TTS messages with different voices." },
    { title: "Theme Editor", description: "Customize your overlay themes from one panel." },
  ],
};

const tabs = Object.keys(toolData);

const Tools = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const items = toolData[activeTab as keyof typeof toolData];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>Utility <span className="text-primary font-medium">Tools</span> to enhance your streaming workflow.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((tool) => (
            <OverlayCard key={tool.title} title={tool.title} description={tool.description} hasPreview={false} url="#" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tools;
