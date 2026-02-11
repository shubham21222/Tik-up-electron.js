import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { Settings, Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface PointsConfig {
  currency_name: string;
  points_per_coin: number;
  points_per_coin_enabled: boolean;
  points_per_share: number;
  points_per_share_enabled: boolean;
  points_per_chat_minute: number;
  points_per_chat_minute_enabled: boolean;
  subscriber_bonus_ratio: number;
  level_base_points: number;
  level_multiplier: number;
}

const defaultPointsConfig: PointsConfig = {
  currency_name: "Points",
  points_per_coin: 1,
  points_per_coin_enabled: true,
  points_per_share: 3,
  points_per_share_enabled: false,
  points_per_chat_minute: 0.5,
  points_per_chat_minute_enabled: false,
  subscriber_bonus_ratio: 0,
  level_base_points: 100,
  level_multiplier: 1.5,
};

const tabs = ["Connect TikTok", "Points System", "Integrations", "Advanced"];

const Setup = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Connect TikTok");
  const [username, setUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pointsConfig, setPointsConfig] = useState<PointsConfig>(defaultPointsConfig);
  const [, setPointsLoaded] = useState(false);

  // Load profile and points config on mount
  useEffect(() => {
    if (!user) return;
    // Load TikTok username from profile
    supabase.from("profiles").select("tiktok_username, tiktok_connected").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          if ((data as any).tiktok_username) {
            setUsername((data as any).tiktok_username);
            if ((data as any).tiktok_connected) setConnectionStatus("connected");
          }
        }
      });
    // Load points config
    supabase.from("points_config" as any).select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          setPointsConfig({
            currency_name: d.currency_name || "Points",
            points_per_coin: Number(d.points_per_coin) || 1,
            points_per_coin_enabled: d.points_per_coin_enabled ?? true,
            points_per_share: Number(d.points_per_share) || 3,
            points_per_share_enabled: d.points_per_share_enabled ?? false,
            points_per_chat_minute: Number(d.points_per_chat_minute) || 0.5,
            points_per_chat_minute_enabled: d.points_per_chat_minute_enabled ?? false,
            subscriber_bonus_ratio: Number(d.subscriber_bonus_ratio) || 0,
            level_base_points: Number(d.level_base_points) || 100,
            level_multiplier: Number(d.level_multiplier) || 1.5,
          });
        }
        setPointsLoaded(true);
      });
  }, [user]);

  const handleConnect = useCallback(async () => {
    if (!user) return;
    const clean = username.trim().replace(/^@/, "");
    if (!clean) {
      setConnectionError("Please enter a TikTok username");
      setConnectionStatus("error");
      return;
    }
    setConnectionError("");
    setConnectionStatus("connecting");

    // Save username to profile
    const { error } = await supabase.from("profiles").update({
      tiktok_username: clean,
      tiktok_connected: true,
      tiktok_connected_at: new Date().toISOString(),
    } as any).eq("user_id", user.id);

    if (error) {
      setConnectionError("Failed to save connection. Please try again.");
      setConnectionStatus("error");
      return;
    }

    setUsername(clean);
    setConnectionStatus("connected");
    toast.success(`Connected to @${clean}`);
  }, [username, user]);

  const handleDisconnect = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      tiktok_connected: false,
    } as any).eq("user_id", user.id);
    setConnectionStatus("disconnected");
    toast.info("Disconnected from TikTok");
  };

  const savePointsConfig = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("points_config" as any).upsert({
      user_id: user.id,
      ...pointsConfig,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Points config saved!");
  };

  const updatePoints = (key: keyof PointsConfig, value: any) => {
    setPointsConfig(prev => ({ ...prev, [key]: value }));
  };

  const statusConfig = {
    disconnected: { icon: WifiOff, text: "Not Connected", color: "text-muted-foreground", bg: "bg-muted" },
    connecting: { icon: Loader2, text: "Connecting...", color: "text-primary", bg: "bg-primary/10" },
    connected: { icon: CheckCircle2, text: "Connected", color: "text-green-400", bg: "bg-green-400/10" },
    error: { icon: AlertCircle, text: "Error", color: "text-destructive", bg: "bg-destructive/10" },
  };
  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Settings size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to access Setup.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
          {activeTab === "Connect TikTok" && (
            <>
              {/* TikTok Connection Card */}
              <div className={`rounded-xl border bg-card p-6 transition-all ${connectionStatus === "connected" ? "border-green-400/30 shadow-[0_0_20px_hsl(140_100%_40%/0.06)]" : "border-border"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-base text-primary">Connect TikTok Account</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                    <StatusIcon size={14} className={connectionStatus === "connecting" ? "animate-spin" : ""} />
                    {status.text}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-5">
                  Enter your TikTok username to connect your live stream. Events like gifts, likes, follows, and chat messages will be captured in real-time.
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                      placeholder="your_username"
                      disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
                      className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
                    />
                  </div>
                  {connectionStatus === "connected" ? (
                    <button onClick={handleDisconnect} className="px-5 py-2.5 rounded-lg bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connectionStatus === "connecting"}
                      className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {connectionStatus === "connecting" && <Loader2 size={14} className="animate-spin" />}
                      {connectionStatus === "connecting" ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>

                {connectionError && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    {connectionError}
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="mt-5 p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Wifi size={14} className="text-green-400" />
                      <span className="text-xs font-semibold text-green-400">Live Connection Active</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Your TikTok account <span className="text-foreground font-semibold">@{username}</span> is connected.
                      Events from your live stream will be captured and forwarded to your overlays in real-time.
                    </p>
                  </div>
                )}
              </div>

              {/* How It Works */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading font-semibold text-sm text-primary mb-4">How It Works</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", title: "Enter Username", desc: "Type your TikTok username above and click Connect." },
                    { step: "2", title: "Go Live", desc: "Start a TikTok LIVE stream from your mobile device." },
                    { step: "3", title: "Events Flow", desc: "Gifts, likes, follows, shares, and chat messages are captured and sent to your overlays." },
                    { step: "4", title: "OBS Integration", desc: "Add overlay URLs as Browser Sources in OBS to display on stream." },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Settings */}
              <FormSection title="Connection Settings">
                <FormField label="Auto-Reconnect" type="toggle" checked={true} />
                <FormField label="Retry Interval (seconds)" type="number" value="10" />
              </FormSection>
            </>
          )}

          {activeTab === "Points System" && (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading font-semibold text-base text-primary mb-1">Points System</h3>
                <p className="text-xs text-muted-foreground mb-5">Configure how viewers earn points through interactions.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name of your currency</label>
                    <input
                      value={pointsConfig.currency_name}
                      onChange={e => updatePoints("currency_name", e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Points per action rows */}
                  {([
                    { key: "points_per_coin", enabledKey: "points_per_coin_enabled", label: "Points per coin" },
                    { key: "points_per_share", enabledKey: "points_per_share_enabled", label: "Points per share" },
                    { key: "points_per_chat_minute", enabledKey: "points_per_chat_minute_enabled", label: "Points per chat minute" },
                  ] as const).map(row => (
                    <div key={row.key} className="flex items-center gap-3">
                      <button
                        onClick={() => updatePoints(row.enabledKey, !pointsConfig[row.enabledKey])}
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          pointsConfig[row.enabledKey] ? "bg-primary border-primary text-primary-foreground" : "border-border bg-muted"
                        }`}
                      >
                        {pointsConfig[row.enabledKey] && <CheckCircle2 size={12} />}
                      </button>
                      <span className="text-sm text-foreground flex-1">{row.label}</span>
                      <input
                        type="number"
                        value={pointsConfig[row.key]}
                        onChange={e => updatePoints(row.key, Number(e.target.value))}
                        step="0.1"
                        min="0"
                        className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscriber Bonus */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading font-semibold text-base text-primary mb-1">Subscriber Bonus</h3>
                <p className="text-xs text-muted-foreground mb-5">If you have subscribers, you can set a points multiplier for them. Then your subscribers will get more points for their activities.</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground flex-1">Subscriber Bonus Ratio</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={pointsConfig.subscriber_bonus_ratio}
                      onChange={e => updatePoints("subscriber_bonus_ratio", Number(e.target.value))}
                      min="0"
                      max="500"
                      step="5"
                      className="w-20 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Level Settings */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading font-semibold text-base text-primary mb-1">Level Settings</h3>
                <p className="text-xs text-muted-foreground mb-5">Viewers can increase their level by collecting points. Set how many points are required and the level multiplier.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground flex-1">Base points per level</span>
                    <input
                      type="number"
                      value={pointsConfig.level_base_points}
                      onChange={e => updatePoints("level_base_points", Number(e.target.value))}
                      min="10"
                      className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground flex-1">Level multiplier</span>
                    <input
                      type="number"
                      value={pointsConfig.level_multiplier}
                      onChange={e => updatePoints("level_multiplier", Number(e.target.value))}
                      min="1"
                      step="0.1"
                      className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={savePointsConfig}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : "Save Points Config"}
              </button>
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
              <FormSection title="Connection Mode">
                <FormField label="Connection Mode" type="select" options={["Automatic", "Manual"]} />
                <FormField label="Max actions per second" type="select" options={["Fast", "Normal", "Slow"]} />
              </FormSection>

              <FormSection title="Anti-Spam" description="Limit how often a viewer can trigger actions.">
                <FormField label="Cooldown (s)" type="number" value="5" />
                <FormField label="Max queue size" type="number" value="20" />
              </FormSection>

              <FormSection title="Backup & Export" description="Export or import your settings.">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                    Export Settings (JSON)
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors border border-border">
                    Import from Backup
                  </button>
                </div>
              </FormSection>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Setup;
