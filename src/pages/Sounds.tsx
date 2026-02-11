import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import { Volume2, Info, Upload, Plus } from "lucide-react";

const soundAlerts = [
  { title: "Gift Sound: Rose", description: "Plays a chime sound when a viewer sends a Rose gift. Volume and duration are customizable." },
  { title: "Gift Sound: Lion", description: "Plays a dramatic lion roar sound effect when a viewer sends the Lion gift. High-value alert." },
  { title: "Gift Sound: Universe", description: "Plays an epic galaxy sound effect for the Universe gift. Includes screen shake effect." },
  { title: "Follow Sound", description: "A subtle notification sound that plays when someone new follows your stream during a live session." },
  { title: "TTS Voice: Default", description: "Default Text-to-Speech voice for viewer messages. Supports multiple languages and voice styles." },
  { title: "TTS Voice: Funny", description: "A funny, pitch-shifted voice that reads viewer messages in a comedic style. Popular with audiences." },
  { title: "Sub Alert Sound", description: "A special chime that plays when a subscriber joins your live. Includes animated overlay alert." },
  { title: "Chat Command: !airhorn", description: "Plays an air horn sound when any viewer types !airhorn in chat. Has a 30-second cooldown." },
  { title: "Share Sound Alert", description: "A subtle sound that plays when a viewer shares your stream with friends. Encourages more sharing." },
  { title: "Like Milestone Sound", description: "A celebration sound that plays when you reach like milestones (1K, 5K, 10K, 50K likes)." },
];

const Sounds = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
          {["Sound Alerts", "TTS Settings", "Music Player", "Sound Library"].map((tab, i) => (
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
          <div className="flex-1" />
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity">
            <Upload size={14} />
            Upload Sound
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Configure <span className="text-primary font-medium">Sound Alerts</span> and <span className="text-primary font-medium">Text-to-Speech</span> for your TikTok LIVE stream.
              Each sound can be triggered by specific events like gifts, follows, or chat commands. Upload your own audio files or use the built-in sound library.
            </p>
          </div>
        </div>

        {/* Master settings */}
        <div className="mb-6">
          <FormSection title="Master Audio Settings">
            <FormField label="Master Volume" type="select" options={["25%", "50%", "75%", "100%"]} />
            <FormField label="TTS Enabled" type="toggle" checked={true} />
            <FormField label="TTS Voice" type="select" options={["Default Female", "Default Male", "Funny", "Deep", "Robot"]} />
            <FormField label="TTS Max Length" type="number" value="200" />
          </FormSection>
        </div>

        {/* Sound cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soundAlerts.map((sound) => (
            <OverlayCard
              key={sound.title}
              title={sound.title}
              description={sound.description}
              hasPreview={false}
              url="#"
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Sounds;
