import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Send, ExternalLink, Webhook, ChevronDown, ChevronUp, Zap, Bell, Gift, Users, Trophy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIntegrations, type Integration } from "@/hooks/use-integrations";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingRow from "@/components/overlays/settings/SettingRow";

/* ─── single webhook card ─── */
const WebhookCard = ({
  integration,
  onUpdate,
  onDelete,
  onTest,
}: {
  integration: Integration;
  onUpdate: (id: string, u: Partial<Integration>) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const masked = integration.webhook_url
    ? integration.webhook_url.slice(0, 45) + "••••••"
    : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-border/40 overflow-hidden"
      style={{ background: "hsl(var(--card))" }}
    >
      {/* header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "hsl(235 86% 65% / 0.12)",
            border: "1px solid hsl(235 86% 65% / 0.2)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.175 13.175 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"
              fill="hsl(235 86% 65%)"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent text-foreground font-semibold text-sm focus:outline-none w-full truncate"
            value={integration.name}
            onChange={(e) => onUpdate(integration.id, { name: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {integration.last_triggered_at
              ? `Last sent ${new Date(integration.last_triggered_at).toLocaleString()}`
              : "Never triggered"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SettingToggle
            checked={integration.is_enabled}
            onChange={(v) => onUpdate(integration.id, { is_enabled: v })}
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* expanded settings */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border/30 pt-4">
              {/* webhook URL */}
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Webhook URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showUrl ? "text" : "password"}
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-xs font-mono bg-muted/40 border border-border/40 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={integration.webhook_url}
                      onChange={(e) =>
                        onUpdate(integration.id, { webhook_url: e.target.value })
                      }
                    />
                    <button
                      onClick={() => setShowUrl(!showUrl)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showUrl ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={() => onTest(integration.id)}
                    className="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      background: "hsl(var(--primary) / 0.12)",
                      color: "hsl(var(--primary))",
                      border: "1px solid hsl(var(--primary) / 0.2)",
                    }}
                  >
                    <Send size={12} /> Test
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  Go to Discord → Server Settings → Integrations → Webhooks → New
                  Webhook → Copy URL
                </p>
              </div>

              {/* event filters */}
              <div>
                <p className="text-xs font-medium text-foreground mb-3">
                  Notification Events
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EventToggle
                    icon={<Zap size={14} />}
                    label="Go Live"
                    description="When your stream starts"
                    checked={integration.notify_go_live}
                    onChange={(v) => onUpdate(integration.id, { notify_go_live: v })}
                    color="0 90% 60%"
                  />
                  <EventToggle
                    icon={<Gift size={14} />}
                    label="Gifts"
                    description="When viewers send gifts"
                    checked={integration.notify_gifts}
                    onChange={(v) => onUpdate(integration.id, { notify_gifts: v })}
                    color="280 100% 65%"
                  />
                  <EventToggle
                    icon={<Users size={14} />}
                    label="Follows"
                    description="When viewers follow you"
                    checked={integration.notify_follows}
                    onChange={(v) => onUpdate(integration.id, { notify_follows: v })}
                    color="160 100% 45%"
                  />
                  <EventToggle
                    icon={<Trophy size={14} />}
                    label="Milestones"
                    description="Follower & diamond milestones"
                    checked={integration.notify_milestones}
                    onChange={(v) =>
                      onUpdate(integration.id, { notify_milestones: v })
                    }
                    color="45 100% 55%"
                  />
                </div>
              </div>

              {/* gift minimum */}
              {integration.notify_gifts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SettingRow label="Min Gift Value (coins)">
                    <SettingSlider
                      value={integration.notify_gift_min_coins}
                      onChange={(v) =>
                        onUpdate(integration.id, { notify_gift_min_coins: v })
                      }
                      min={0}
                      max={1000}
                      suffix=" coins"
                    />
                  </SettingRow>
                </motion.div>
              )}

              {/* embed color */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-foreground">
                  Embed Color
                </label>
                <input
                  type="color"
                  className="w-8 h-8 rounded-lg border border-border/40 cursor-pointer bg-transparent"
                  value={`#${integration.embed_color}`}
                  onChange={(e) =>
                    onUpdate(integration.id, {
                      embed_color: e.target.value.replace("#", ""),
                    })
                  }
                />
                <span className="text-[11px] font-mono text-muted-foreground">
                  #{integration.embed_color}
                </span>
              </div>

              {/* danger zone */}
              <div className="flex justify-end pt-2 border-t border-border/20">
                <button
                  onClick={() => onDelete(integration.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={13} /> Delete Webhook
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── event toggle card ─── */
const EventToggle = ({
  icon,
  label,
  description,
  checked,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
      checked
        ? "border-primary/20 bg-primary/[0.04]"
        : "border-border/30 bg-muted/20 opacity-60"
    }`}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{
        background: `hsl(${color} / 0.12)`,
        color: `hsl(${color})`,
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground truncate">{description}</p>
    </div>
    <div
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "border-primary bg-primary" : "border-muted-foreground/30"
      }`}
    >
      {checked && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
      )}
    </div>
  </button>
);

/* ─── placeholder cards for future integrations ─── */
const ComingSoonCard = ({
  name,
  icon,
  description,
  color,
}: {
  name: string;
  icon: string;
  description: string;
  color: string;
}) => (
  <div
    className="rounded-2xl border border-border/20 px-5 py-4 flex items-center gap-4 opacity-50"
    style={{ background: "hsl(var(--card) / 0.5)" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
      style={{
        background: `hsl(${color} / 0.08)`,
        border: `1px solid hsl(${color} / 0.15)`,
      }}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">
      SOON
    </span>
  </div>
);

/* ─── main page ─── */
const Integrations = () => {
  const { user } = useAuth();
  const {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testWebhook,
  } = useIntegrations();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Webhook size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">
              Sign in to manage integrations
            </h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse, hsl(235 86% 65% / 0.04), transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
              Integrations
            </h1>
            <p className="text-muted-foreground text-sm">
              Connect Discord webhooks to get notified about your stream events.
            </p>
          </div>
          <button
            onClick={createIntegration}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, hsl(235 86% 65%), hsl(260 80% 60%))",
              color: "white",
              boxShadow: "0 0 25px hsl(235 86% 65% / 0.25)",
            }}
          >
            <Plus size={16} /> Add Webhook
          </button>
        </motion.div>

        {/* webhook list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-20 bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border border-border/30"
            style={{
              background: "hsl(var(--card) / 0.5)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Webhook
              size={48}
              className="text-muted-foreground/20 mx-auto mb-4"
            />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">
              No webhooks yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Add a Discord webhook to receive real-time notifications when you
              go live, receive gifts, or hit milestones.
            </p>
            <button
              onClick={createIntegration}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{
                background:
                  "linear-gradient(135deg, hsl(235 86% 65%), hsl(260 80% 60%))",
                color: "white",
              }}
            >
              <Plus size={16} /> Add Discord Webhook
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {integrations.map((i) => (
                <WebhookCard
                  key={i.id}
                  integration={i}
                  onUpdate={updateIntegration}
                  onDelete={deleteIntegration}
                  onTest={testWebhook}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* how it works */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 rounded-2xl border border-border/30 p-6"
          style={{
            background: "hsl(var(--card) / 0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h3 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell size={14} className="text-primary" /> How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Create Webhook",
                desc: "Go to your Discord server → Settings → Integrations → Webhooks → New Webhook",
              },
              {
                step: "2",
                title: "Paste URL",
                desc: "Copy the webhook URL and paste it above. Choose which events trigger notifications.",
              },
              {
                step: "3",
                title: "Go Live",
                desc: "Events from your TikTok LIVE will automatically post to your Discord channel.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: "hsl(var(--primary) / 0.12)",
                    color: "hsl(var(--primary))",
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* coming soon integrations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-sm font-heading font-bold text-foreground mb-4">
            More Integrations
          </h3>
          <div className="space-y-3">
            <ComingSoonCard
              name="Spotify"
              icon="🎵"
              description="Display now playing track on your stream"
              color="120 80% 45%"
            />
            <ComingSoonCard
              name="StreamElements"
              icon="⚡"
              description="Sync alerts and tips with StreamElements"
              color="200 100% 55%"
            />
            <ComingSoonCard
              name="Custom API"
              icon="🔗"
              description="Send events to any HTTP endpoint"
              color="45 100% 55%"
            />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Integrations;
