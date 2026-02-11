import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import { Layers, Info } from "lucide-react";

const overlays = [
  { title: "Text-to-Speech (TTS)", description: "Shows text-to-speech messages on your stream. Viewers can send messages that are read aloud with customizable voices.", hasPreview: true },
  { title: "TikTok Chat Overlay", description: "Display live chat messages as an overlay. Fully customizable with different themes, font sizes, and animation styles.", hasPreview: true },
  { title: "Sound Alert Overlay", description: "Visual overlay that shows animated alerts when sound effects are triggered by viewer gifts.", hasPreview: true },
  { title: "Like/Follow Overlay", description: "A customizable overlay that shows animations when viewers like or follow your stream.", hasPreview: true },
  { title: "Gift Alert Overlay", description: "Beautiful animated alerts that appear on screen when viewers send gifts during your live.", hasPreview: true },
  { title: "Top Gifters Widget", description: "Display a real-time leaderboard showing your top gift senders with animated transitions.", hasPreview: true },
  { title: "Goal Progress Bar", description: "Set gift or follower goals and display animated progress bars on your stream overlay.", hasPreview: true },
  { title: "Stream Countdown", description: "A countdown timer that viewers can extend by sending gifts. Great for subathon-style streams.", hasPreview: true },
  { title: "Custom Alert Box", description: "Create fully customizable alert boxes with your own images, sounds, and animation effects.", hasPreview: true },
  { title: "Viewer Count Widget", description: "Display your current viewer count with a clean animated widget on your stream.", hasPreview: true },
  { title: "Chat Word Cloud", description: "Generate a real-time word cloud from your chat messages. Shows trending words and phrases.", hasPreview: true },
  { title: "Emote Wall", description: "Display a wall of emotes and stickers sent by your viewers. Fun and interactive visual overlay.", hasPreview: true },
  { title: "Poll Overlay", description: "Create interactive polls where viewers can vote through chat. Results displayed in real-time on stream.", hasPreview: true },
  { title: "Wheel Spin", description: "A spinning wheel that can be triggered by gifts. Add custom prizes and let viewers try their luck!", hasPreview: true },
  { title: "Sub Emote Overlay", description: "Display subscriber emotes as animated overlays when subscribers interact with your stream.", hasPreview: true },
  { title: "Queue System", description: "Let viewers join a queue for games, duets, or other interactive activities during your live stream.", hasPreview: true },
];

const Overlays = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        {/* Top tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
          {["Overlays", "Quick Setup", "Browser Sources", "All Overlays"].map((tab, i) => (
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

        {/* Info block */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Here you will find all available <span className="text-primary font-medium">Overlay Widgets</span> for your TikTok LIVE stream.
              Each overlay provides a unique browser source URL that you can add to OBS Studio, TikTok LIVE Studio, or Streamlabs.
              Simply copy the URL and add it as a browser source in your streaming software.
            </p>
          </div>
        </div>

        {/* Overlay grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overlays.map((overlay) => (
            <OverlayCard
              key={overlay.title}
              title={overlay.title}
              description={overlay.description}
              hasPreview={overlay.hasPreview}
              url="#"
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Overlays;
