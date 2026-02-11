import AppLayout from "@/components/AppLayout";
import OverlayCard from "@/components/OverlayCard";
import TabNav from "@/components/TabNav";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import { Info, Plus } from "lucide-react";
import { useState } from "react";

const actionsData = {
  "Actions": [
    { title: "Sound Alert on Gift", description: "Play a custom sound effect when a viewer sends any gift." },
    { title: "TTS on Gift", description: "Read out the viewer's name and gift message using Text-to-Speech." },
    { title: "Screen Shake on Gift", description: "Apply a screen shake effect to your overlay on large gifts." },
    { title: "Follow Alert", description: "Show an animated alert when someone follows your stream." },
    { title: "GTA 5 - Spawn Vehicle", description: "Spawn a random vehicle in GTA 5 when a viewer sends a specific gift." },
    { title: "Minecraft - Spawn Mob", description: "Let viewers spawn mobs in Minecraft by sending gifts." },
  ],
  "Event Rules": [
    { title: "Like Milestone Alert", description: "Trigger a special alert at like milestones (1K, 5K, 10K, etc.)." },
    { title: "Gift Combo Bonus", description: "Trigger escalating effects when a viewer sends multiple gifts." },
    { title: "Share Alert", description: "Thank viewers who share your stream with a shoutout." },
    { title: "Subscriber Welcome", description: "Play a welcome message for new subscribers." },
  ],
  "Chat Commands": [
    { title: "Chat Command: !dice", description: "Viewers roll a virtual dice. Result shown on overlay and via TTS." },
    { title: "Chat Highlight", description: "Highlight specific chat messages on your overlay." },
    { title: "Custom HTTP Request", description: "Send a custom webhook when a chat command triggers." },
  ],
  "Advanced": [],
  "Import / Export": [],
};

const tabs = Object.keys(actionsData);

const Actions = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const items = actionsData[activeTab as keyof typeof actionsData];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-in pb-12">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rightAction={
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity">
              <Plus size={14} /> New Action
            </button>
          }
        />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Create <span className="text-primary font-medium">Actions & Events</span> that trigger automatically based on viewer interactions.
            </p>
          </div>
        </div>

        {activeTab === "Advanced" && (
          <FormSection title="Advanced Action Settings" description="Configure global action behavior.">
            <FormField label="Action queue mode" type="select" options={["Sequential", "Parallel", "Priority"]} />
            <FormField label="Max concurrent actions" type="number" value="5" />
            <FormField label="Global cooldown (s)" type="number" value="2" />
            <FormField label="Debug mode" type="toggle" checked={false} />
          </FormSection>
        )}

        {activeTab === "Import / Export" && (
          <FormSection title="Import / Export Actions" description="Backup or share your action configurations.">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                Export Actions (JSON)
              </button>
              <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                Import Actions
              </button>
            </div>
          </FormSection>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((action) => (
              <OverlayCard
                key={action.title}
                title={action.title}
                description={action.description}
                hasPreview={true}
                url="#"
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Actions;
