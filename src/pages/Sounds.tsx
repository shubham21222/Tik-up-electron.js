import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { Info, Upload } from "lucide-react";
import { useState } from "react";

const soundData = {
  "Sound Alerts": [
    { title: "Gift Sound: Rose", description: "Plays a chime sound when a viewer sends a Rose gift." },
    { title: "Gift Sound: Lion", description: "Plays a dramatic lion roar for the Lion gift." },
    { title: "Gift Sound: Universe", description: "Epic galaxy sound for the Universe gift." },
    { title: "Follow Sound", description: "Notification sound when someone follows during live." },
    { title: "Sub Alert Sound", description: "Special chime when a subscriber joins." },
    { title: "Chat Command: !airhorn", description: "Plays air horn when !airhorn is typed in chat." },
    { title: "Share Sound Alert", description: "Sound when a viewer shares your stream." },
    { title: "Like Milestone Sound", description: "Celebration sound at like milestones." },
  ],
  "TTS Settings": [],
  "Music Player": [],
  "Sound Library": [
    { title: "Chime Pack", description: "A collection of clean, modern chime sounds for alerts." },
    { title: "Retro 8-Bit Pack", description: "Pixel-art style sound effects, great for gaming streams." },
    { title: "Epic Orchestral Pack", description: "Cinematic sounds for high-value gift alerts." },
    { title: "Funny SFX Pack", description: "Comedy sound effects like boing, fart, and record scratch." },
  ],
};

const tabs = Object.keys(soundData);

const Sounds = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const items = soundData[activeTab as keyof typeof soundData];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rightAction={
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity">
              <Upload size={14} /> Upload Sound
            </button>
          }
        />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Configure <span className="text-primary font-medium">Sound Alerts</span> and <span className="text-primary font-medium">Text-to-Speech</span> for your stream.
            </p>
          </div>
        </div>

        {(activeTab === "TTS Settings" || activeTab === "Sound Alerts") && (
          <div className="mb-6">
            <FormSection title={activeTab === "TTS Settings" ? "Text-to-Speech Configuration" : "Master Audio Settings"}>
              {activeTab === "TTS Settings" ? (
                <>
                  <FormField label="TTS Enabled" type="toggle" checked={true} />
                  <FormField label="TTS Voice" type="select" options={["Default Female", "Default Male", "Funny", "Deep", "Robot"]} />
                  <FormField label="TTS Speed" type="select" options={["Slow", "Normal", "Fast"]} />
                  <FormField label="TTS Max Length" type="number" value="200" />
                  <FormField label="Min gift for TTS" type="number" value="1" />
                  <FormField label="Filter profanity" type="toggle" checked={true} />
                </>
              ) : (
                <>
                  <FormField label="Master Volume" type="select" options={["25%", "50%", "75%", "100%"]} />
                  <FormField label="TTS Enabled" type="toggle" checked={true} />
                </>
              )}
            </FormSection>
          </div>
        )}

        {activeTab === "Music Player" && (
          <FormSection title="Music Player Settings" description="Configure the built-in music player for your stream.">
            <FormField label="Music volume" type="select" options={["25%", "50%", "75%", "100%"]} />
            <FormField label="Auto-duck for TTS" type="toggle" checked={true} />
            <FormField label="Allow song requests" type="toggle" checked={true} />
          </FormSection>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((sound) => (
              <OverlayCard key={sound.title} title={sound.title} description={sound.description} hasPreview={false} url="#" />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Sounds;
