import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import TabNav from "@/components/TabNav";
import { Info, Eye } from "lucide-react";
import { useState } from "react";

const overlayData = {
  "Overlays": [
    { title: "Text-to-Speech (TTS)", description: "Shows text-to-speech messages on your stream with customizable voices.", hasPreview: true },
    { title: "TikTok Chat Overlay", description: "Display live chat messages as an overlay with themes and animations.", hasPreview: true },
    { title: "Sound Alert Overlay", description: "Animated alerts when sound effects are triggered by viewer gifts.", hasPreview: true },
    { title: "Like/Follow Overlay", description: "Animations when viewers like or follow your stream.", hasPreview: true },
    { title: "Gift Alert Overlay", description: "Animated alerts when viewers send gifts during your live.", hasPreview: true },
    { title: "Top Gifters Widget", description: "Real-time leaderboard showing your top gift senders.", hasPreview: true },
  ],
  "Quick Setup": [
    { title: "Starter Pack", description: "Pre-configured set with chat, alerts, and TTS — one-click setup for new streamers.", hasPreview: true },
    { title: "Pro Gaming Pack", description: "Overlay set optimized for gaming streams with game integration alerts.", hasPreview: true },
    { title: "Music Pack", description: "Song request overlay, now playing widget, and music-themed alerts.", hasPreview: true },
  ],
  "Browser Sources": [
    { title: "Chat Source", description: "Copy this URL into OBS as a Browser Source to display live chat.", hasPreview: false },
    { title: "Alert Source", description: "Browser source URL for gift, follow, and like alerts.", hasPreview: false },
    { title: "TTS Source", description: "Browser source for Text-to-Speech overlay rendering.", hasPreview: false },
    { title: "Leaderboard Source", description: "Browser source for the top gifters leaderboard widget.", hasPreview: false },
  ],
  "All Overlays": [
    { title: "Goal Progress Bar", description: "Set gift or follower goals with animated progress bars.", hasPreview: true },
    { title: "Stream Countdown", description: "A countdown timer extendable by gifts. Great for subathons.", hasPreview: true },
    { title: "Chat Word Cloud", description: "Real-time word cloud from chat messages.", hasPreview: true },
    { title: "Emote Wall", description: "Display emotes and stickers sent by viewers.", hasPreview: true },
    { title: "Poll Overlay", description: "Interactive polls where viewers vote through chat.", hasPreview: true },
    { title: "Wheel Spin", description: "Spinning wheel triggered by gifts with custom prizes.", hasPreview: true },
    { title: "Queue System", description: "Let viewers join a queue for games or activities.", hasPreview: true },
    { title: "Viewer Count Widget", description: "Animated current viewer count widget.", hasPreview: true },
  ],
};

const tabs = Object.keys(overlayData);

const MockOverlayPreview = ({ type }: { type: string }) => {
  if (type.includes("Chat")) {
    return (
      <div className="space-y-1.5 p-3">
        {["StreamFan: Love this! 🔥", "GiftKing: Sent a Rose 🌹", "NewViewer: Hello!"].map((msg, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="text-primary font-semibold">{msg.split(":")[0]}:</span>
            <span className="text-muted-foreground">{msg.split(":")[1]}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type.includes("Gift") || type.includes("Alert")) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-1">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
          <span className="text-lg">🎁</span>
        </div>
        <span className="text-[10px] text-secondary font-semibold">GiftKing sent Rose!</span>
      </div>
    );
  }
  if (type.includes("Leaderboard") || type.includes("Top")) {
    return (
      <div className="space-y-1 p-3 text-[10px]">
        {["#1 GiftKing — 12.5K", "#2 StreamLover — 8.2K", "#3 TikPro — 6.8K"].map((row, i) => (
          <div key={i} className={`flex justify-between ${i === 0 ? "text-secondary font-bold" : "text-muted-foreground"}`}>
            <span>{row.split("—")[0]}</span>
            <span>{row.split("—")[1]}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-4">
      <Eye size={20} className="text-muted-foreground/30" />
    </div>
  );
};

const Overlays = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [previewOverlay, setPreviewOverlay] = useState<string | null>(null);
  const items = overlayData[activeTab as keyof typeof overlayData];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              {activeTab === "Browser Sources"
                ? "Copy these URLs and add them as Browser Sources in OBS Studio, TikTok LIVE Studio, or Streamlabs."
                : <>Here you will find all available <span className="text-primary font-medium">Overlay Widgets</span>. Each overlay provides a browser source URL for your streaming software.</>}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((overlay) => (
            <div key={overlay.title}>
              <OverlayCard
                title={overlay.title}
                description={overlay.description}
                hasPreview={overlay.hasPreview}
                url="#"
              />
              {previewOverlay === overlay.title && (
                <div className="mt-1 rounded-lg border border-primary/20 bg-card overflow-hidden">
                  <MockOverlayPreview type={overlay.title} />
                </div>
              )}
              {overlay.hasPreview && (
                <button
                  onClick={() => setPreviewOverlay(previewOverlay === overlay.title ? null : overlay.title)}
                  className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Eye size={12} /> {previewOverlay === overlay.title ? "Hide" : "Show"} Preview
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Overlays;
