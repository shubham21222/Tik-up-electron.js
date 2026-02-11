import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import { Settings, CheckSquare, Square } from "lucide-react";
import { useState } from "react";

const eventTriggers = [
  { name: "Gifts Received", points: "✓", enabled: true },
  { name: "Likes", points: "—", enabled: true },
  { name: "New Followers", points: "✓", enabled: true },
  { name: "New Subscribers", points: "✓", enabled: false },
  { name: "Share to Friends", points: "✓", enabled: true },
  { name: "Join Stream", points: "—", enabled: false },
  { name: "Viewers & Battles", points: "—", enabled: true },
  { name: "Chat Messages", points: "✓", enabled: true },
  { name: "Emote Reactions", points: "—", enabled: true },
  { name: "Gift Combos", points: "✓", enabled: false },
  { name: "Top Viewer Updates", points: "—", enabled: false },
  { name: "Goal Reached Events", points: "✓", enabled: true },
  { name: "Total Unique Viewers", points: "✓", enabled: true },
  { name: "Stream Timer Events", points: "✓", enabled: false },
  { name: "TikTok Live Ability", points: "Manual", enabled: true },
  { name: "Battle Results", points: "—", enabled: false },
  { name: "Gift History", points: "✓", enabled: true },
  { name: "Pinned Messages", points: "—", enabled: false },
  { name: "Chat Commands", points: "✓", enabled: true },
  { name: "TikTok Live API", points: "Beta", enabled: true },
];

const Setup = () => {
  const [triggers, setTriggers] = useState(eventTriggers);

  const toggleTrigger = (index: number) => {
    setTriggers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t))
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-slide-in pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Setup</h1>
          </div>
          <p className="text-muted-foreground text-sm">Here you can define the main settings.</p>
        </div>

        <div className="space-y-5">
          {/* TikTok Connection */}
          <FormSection title="TikTok LIVE Connection" description="Enter your TikTok username to connect to your live stream. You must be live for the connection to work.">
            <FormField label="TikTok Username" placeholder="@username" />
            <FormField label="Connection Mode" type="select" options={["Automatic", "Manual"]} />
          </FormSection>

          {/* Master Settings */}
          <FormSection title="Master Settings">
            <FormField label="Max actions per second" type="select" options={["Fast", "Normal", "Slow"]} />
            <FormField label="Text-to-Speech" type="toggle" checked={true} />
            <FormField label="Sound alerts" type="toggle" checked={true} />
            <FormField label="Chat overlay" type="toggle" checked={false} />
            <FormField label="Master volume" type="select" options={["25%", "50%", "75%", "100%"]} />
          </FormSection>

          {/* Subscriber Settings */}
          <FormSection title="Subscriber Settings" description="Grant free subscribers extra control and access. If you want to reward your subscribers, you can give them permissions.">
            <FormField label="Min subscriber weeks" type="select" options={["All", "1 Week", "2 Weeks", "1 Month", "3 Months"]} />
          </FormSection>

          {/* Anti-Spam */}
          <FormSection title="Anti-Spam" description="These settings let you limit how often a specific viewer is able to trigger actions. This helps prevent spam abuse and ensures everyone gets to participate.">
            <FormField label="Cooldown (s)" type="number" value="5" />
            <FormField label="Max queue size" type="number" value="20" />
          </FormSection>

          {/* OBS Connection */}
          <FormSection
            title="OBS Connection"
            accent
            description="This requires the OBS WebSocket plugin to be installed and running. Use the connection settings below to connect TikUp to your OBS instance."
          >
            <FormField label="IP" value="127.0.0.1" />
            <FormField label="Port" value="4455" />
            <FormField label="Password" type="password" placeholder="OBS WebSocket Password" />
          </FormSection>

          {/* Streamer.bot Connection */}
          <FormSection
            title="Streamer.bot Connection"
            accent
            description="Connect to Streamer.bot to add even more powerful actions. Make sure Streamer.bot WebSocket Server is enabled."
          >
            <FormField label="IP" value="127.0.0.1" />
            <FormField label="Port" value="8080" />
            <FormField label="Endpoint" value="/ws" />
          </FormSection>

          {/* Overlay Dimensions */}
          <FormSection title="Overlay Dimensions" description="Customize the default overlay resolution. This should match your streaming software's canvas size.">
            <FormField label="Width" type="number" value="1920" />
            <FormField label="Height" type="number" value="1080" />
          </FormSection>

          {/* Auto-Reconnect */}
          <FormSection title="Auto-Reconnect Settings" description="If you are disconnected, TikUp can automatically try to reconnect to your TikTok LIVE stream.">
            <FormField label="Auto-Reconnect" type="toggle" checked={true} />
            <FormField label="Retry interval (s)" type="number" value="10" />
          </FormSection>

          {/* Sharp Points */}
          <FormSection title="Sharp Points" description="Sharp Points is TikUp's built-in loyalty system. Viewers earn points by watching, sending gifts, and interacting with your stream. You can use points for rewards, special actions, and leaderboards.">
            <FormField label="Points per watch minute" type="number" value="1" />
            <FormField label="Bonus for subscribers" type="toggle" checked={true} />
          </FormSection>

          {/* Event Triggers */}
          <FormSection title="Event Triggers" description="Select which TikTok events should trigger actions. Use the following list to enable or disable event categories.">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_60px] gap-2 px-4 py-2 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Event Name</span>
                <span className="text-center">Points</span>
                <span className="text-center">Enabled</span>
              </div>
              {triggers.map((trigger, i) => (
                <div
                  key={trigger.name}
                  className="grid grid-cols-[1fr_80px_60px] gap-2 px-4 py-2.5 border-t border-border items-center hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm text-foreground">{trigger.name}</span>
                  <span className={`text-xs text-center ${trigger.points === "Beta" ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                    {trigger.points}
                  </span>
                  <div className="flex justify-center">
                    <button onClick={() => toggleTrigger(i)} className="text-primary">
                      {trigger.enabled ? <CheckSquare size={18} /> : <Square size={18} className="text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Save
              </button>
              <button className="px-4 py-2 rounded-md bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">
                Reset to Defaults
              </button>
            </div>
          </FormSection>

          {/* Backup / Export */}
          <FormSection title="Backup & Export" description="If you want to backup your settings and overlay configurations, you can export them here. You can also import settings from a previous backup.">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                Export Settings (JSON)
              </button>
              <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                Import from Backup
              </button>
            </div>
          </FormSection>

          {/* Legal / Privacy */}
          <FormSection title="Legal & Privacy" description="Your data is stored locally and never shared with third parties. TikUp does not store any TikTok credentials.">
            <FormField label="Send anonymous usage data" type="toggle" checked={false} />
          </FormSection>
        </div>
      </div>
    </AppLayout>
  );
};

export default Setup;
