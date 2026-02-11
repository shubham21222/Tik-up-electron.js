import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import { Zap, Info } from "lucide-react";

const actions = [
  { title: "Sound Alert on Gift", description: "Play a custom sound effect when a viewer sends any gift. Assign different sounds to different gift values." },
  { title: "TTS on Gift", description: "Read out the viewer's name and gift message using Text-to-Speech when they send a gift worth more than a threshold." },
  { title: "Screen Shake on Gift", description: "Apply a screen shake effect to your overlay when a viewer sends a large gift. Intensity scales with gift value." },
  { title: "Follow Alert", description: "Show an animated alert when someone follows your stream. Includes custom images, sounds, and text." },
  { title: "GTA 5 - Spawn Vehicle", description: "When a viewer sends a specific gift, spawn a random vehicle in GTA 5 near the player. Uses TikUp's GTA Plugin." },
  { title: "Minecraft - Spawn Mob", description: "Let viewers spawn friendly or hostile mobs in your Minecraft world by sending gifts during the stream." },
  { title: "Chat Command: !dice", description: "Viewers can type !dice in chat to roll a virtual dice. The result is displayed on the overlay and read via TTS." },
  { title: "Like Milestone Alert", description: "Trigger a special alert when your stream reaches certain like milestones (1K, 5K, 10K, etc.)." },
  { title: "Gift Combo Bonus", description: "When a viewer sends multiple gifts in a row, trigger escalating effects — bigger sounds, more animations, bonus points." },
  { title: "Share Alert", description: "Thank viewers who share your stream to friends with a personalized shoutout and on-screen notification." },
  { title: "Keystroke: Toggle Scene", description: "Simulate a keystroke in OBS or another application when a specific gift is received. Great for scene switching." },
  { title: "Subscriber Welcome", description: "Play a special welcome message and animation when a subscriber joins your live stream for the first time." },
  { title: "Voicemod: Change Voice", description: "Let viewers change your voice filter by sending specific gifts. Integrates with Voicemod voice changer." },
  { title: "Random Event Wheel", description: "Trigger a random event wheel spin when a viewer sends a high-value gift. Prizes include TTS, sounds, and game actions." },
  { title: "Chat Highlight", description: "Highlight specific chat messages on your overlay when they contain certain keywords or are from specific users." },
  { title: "Custom HTTP Request", description: "Send a custom HTTP webhook request when an event triggers. Connect to any external service or API." },
];

const Actions = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
          {["Actions", "Event Rules", "Chat Commands", "Advanced", "Import / Export"].map((tab, i) => (
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
              Create <span className="text-primary font-medium">Actions & Events</span> that trigger automatically based on viewer interactions.
              Combine event triggers (gifts, follows, chat commands) with effects (sounds, TTS, game control, keystrokes).
              Actions are fully customizable and can be chained together for complex interactions.
            </p>
          </div>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <OverlayCard
              key={action.title}
              title={action.title}
              description={action.description}
              hasPreview={true}
              url="#"
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Actions;
