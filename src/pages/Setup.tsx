import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { Settings, CheckSquare, Square, Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

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

const tabs = ["Connection", "General", "Events", "Integrations", "Advanced"];

const Setup = () => {
  const [activeTab, setActiveTab] = useState("Connection");
  const [triggers, setTriggers] = useState(eventTriggers);
  const [username, setUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState("");

  const toggleTrigger = (index: number) => {
    setTriggers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleConnect = useCallback(() => {
    if (!username.trim()) {
      setConnectionError("Please enter a TikTok username");
      setConnectionStatus("error");
      return;
    }
    setConnectionError("");
    setConnectionStatus("connecting");
    // Simulate connection
    setTimeout(() => {
      if (username.startsWith("@")) {
        setConnectionStatus("connected");
      } else {
        setConnectionError("Username must start with @. Example: @username");
        setConnectionStatus("error");
      }
    }, 2500);
  }, [username]);

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setConnectionError("");
  };

  const statusConfig = {
    disconnected: { icon: WifiOff, text: "Not Connected", color: "text-muted-foreground", bg: "bg-muted" },
    connecting: { icon: Loader2, text: "Connecting...", color: "text-primary", bg: "bg-primary/10" },
    connected: { icon: CheckCircle2, text: "Connected", color: "text-green-400", bg: "bg-green-400/10" },
    error: { icon: AlertCircle, text: "Connection Failed", color: "text-destructive", bg: "bg-destructive/10" },
  };

  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-slide-in pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Setup</h1>
          </div>
          <p className="text-muted-foreground text-sm">Configure your TikTok LIVE connection and settings.</p>
        </div>

        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="space-y-5">
          {activeTab === "Connection" && (
            <>
              {/* Connection Status Card */}
              <div className={`rounded-xl border border-border bg-card p-5 ${connectionStatus === "connected" ? "border-green-400/30" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-sm text-primary">TikTok LIVE Connection</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                    <StatusIcon size={14} className={connectionStatus === "connecting" ? "animate-spin" : ""} />
                    {status.text}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Enter your TikTok username to connect to your live stream. You must be live for the connection to work.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
                    className="flex-1 bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                  {connectionStatus === "connected" ? (
                    <button onClick={handleDisconnect} className="px-5 py-2.5 rounded-md bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connectionStatus === "connecting"}
                      className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {connectionStatus === "connecting" && <Loader2 size={14} className="animate-spin" />}
                      {connectionStatus === "connecting" ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>

                {connectionError && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    <AlertCircle size={14} />
                    {connectionError}
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Viewers", value: "1,247" },
                      { label: "Likes", value: "34.2K" },
                      { label: "Uptime", value: "01:24:35" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/50 rounded-lg px-3 py-2.5 text-center">
                        <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormSection title="Connection Mode">
                <FormField label="Connection Mode" type="select" options={["Automatic", "Manual"]} />
                <FormField label="Auto-Reconnect" type="toggle" checked={true} />
                <FormField label="Retry interval (s)" type="number" value="10" />
              </FormSection>
            </>
          )}

          {activeTab === "General" && (
            <>
              <FormSection title="Master Settings">
                <FormField label="Max actions per second" type="select" options={["Fast", "Normal", "Slow"]} />
                <FormField label="Text-to-Speech" type="toggle" checked={true} />
                <FormField label="Sound alerts" type="toggle" checked={true} />
                <FormField label="Chat overlay" type="toggle" checked={false} />
                <FormField label="Master volume" type="select" options={["25%", "50%", "75%", "100%"]} />
              </FormSection>

              <FormSection title="Subscriber Settings" description="Grant subscribers extra control and access.">
                <FormField label="Min subscriber weeks" type="select" options={["All", "1 Week", "2 Weeks", "1 Month", "3 Months"]} />
              </FormSection>

              <FormSection title="Anti-Spam" description="Limit how often a viewer can trigger actions.">
                <FormField label="Cooldown (s)" type="number" value="5" />
                <FormField label="Max queue size" type="number" value="20" />
              </FormSection>

              <FormSection title="Overlay Dimensions" description="Match your streaming software's canvas size.">
                <FormField label="Width" type="number" value="1920" />
                <FormField label="Height" type="number" value="1080" />
              </FormSection>

              <FormSection title="Sharp Points" description="Built-in loyalty system. Viewers earn points by interacting.">
                <FormField label="Points per watch minute" type="number" value="1" />
                <FormField label="Bonus for subscribers" type="toggle" checked={true} />
              </FormSection>
            </>
          )}

          {activeTab === "Events" && (
            <>
              <FormSection title="Event Triggers" description="Select which TikTok events should trigger actions.">
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
            </>
          )}

          {activeTab === "Integrations" && (
            <>
              <FormSection title="OBS Connection" accent description="Requires OBS WebSocket plugin.">
                <FormField label="IP" value="127.0.0.1" />
                <FormField label="Port" value="4455" />
                <FormField label="Password" type="password" placeholder="OBS WebSocket Password" />
              </FormSection>

              <FormSection title="Streamer.bot Connection" accent description="Connect to Streamer.bot for advanced actions.">
                <FormField label="IP" value="127.0.0.1" />
                <FormField label="Port" value="8080" />
                <FormField label="Endpoint" value="/ws" />
              </FormSection>
            </>
          )}

          {activeTab === "Advanced" && (
            <>
              <FormSection title="Backup & Export" description="Export or import your settings.">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                    Export Settings (JSON)
                  </button>
                  <button className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                    Import from Backup
                  </button>
                </div>
              </FormSection>

              <FormSection title="Legal & Privacy" description="Your data is stored locally and never shared.">
                <FormField label="Send anonymous usage data" type="toggle" checked={false} />
              </FormSection>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Setup;
