import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, ExternalLink, AlertTriangle, CheckCircle2, Link2, Monitor, Tv } from "lucide-react";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { getOverlayBaseUrl } from "@/lib/overlay-url";

const overlayTypeLabels: Record<string, { label: string; icon: string }> = {
  gift_alert: { label: "Gift Alert", icon: "🎁" },
  like_alert: { label: "Like Alert", icon: "❤️" },
  follow_alert: { label: "Follow Alert", icon: "👋" },
  share_alert: { label: "Share Alert", icon: "🔗" },
  chat_box: { label: "Chat Box", icon: "💬" },
  like_counter: { label: "Like Counter", icon: "🔢" },
  follower_goal: { label: "Follower Goal", icon: "🎯" },
  viewer_count: { label: "Viewer Count", icon: "👁" },
  leaderboard: { label: "Leaderboard", icon: "🏆" },
  stream_timer: { label: "Stream Timer", icon: "⏱" },
  gift_combo: { label: "Gift Combo", icon: "🔥" },
  ticker: { label: "Ticker", icon: "📰" },
  tts: { label: "TTS Overlay", icon: "🎙" },
  custom_text: { label: "Custom Text", icon: "✏️" },
  animated_bg: { label: "Animated BG", icon: "🌈" },
  stream_border: { label: "Stream Border", icon: "🖼" },
  webcam_frame: { label: "Webcam Frame", icon: "📷" },
  gift_firework: { label: "Gift Firework", icon: "🎆" },
  promo_overlay: { label: "Promo Banner", icon: "📌" },
  sound_reactive: { label: "Sound Reactive", icon: "🎵" },
  social_rotator: { label: "Social Rotator", icon: "🔄" },
};

const requiredFeatures = [
  { key: "gift_alert", label: "Gift Alert Overlay", check: (widgets: any[]) => widgets.some(w => w.widget_type === "gift_alert") },
  { key: "chat_box", label: "Chat Box Overlay", check: (widgets: any[]) => widgets.some(w => w.widget_type === "chat_box") },
  { key: "stream_timer", label: "Stream Timer", check: (widgets: any[]) => widgets.some(w => w.widget_type === "stream_timer") },
  { key: "like_alert", label: "Like Alert Overlay", check: (widgets: any[]) => widgets.some(w => w.widget_type === "like_alert") },
  { key: "leaderboard", label: "Top Gifter Leaderboard", check: (widgets: any[]) => widgets.some(w => w.widget_type === "leaderboard") },
];

const OverlayUrlsTab = () => {
  const { widgets, loading } = useOverlayWidgets();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const baseUrl = getOverlayBaseUrl();

  const handleCopy = (token: string, type: string, id: string) => {
    const url = `${baseUrl}/overlay/${type}/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const missingFeatures = requiredFeatures.filter(f => !f.check(widgets));
  const configuredFeatures = requiredFeatures.filter(f => f.check(widgets));

  return (
    <motion.div
      key="overlays"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Checklist section */}
      <div className="rounded-2xl p-[1px] mb-6" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
        <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
          <h2 className="text-sm font-heading font-bold text-foreground flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-primary" /> Stream Setup Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {requiredFeatures.map(feat => {
              const done = configuredFeatures.some(f => f.key === feat.key);
              return (
                <div key={feat.key} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors ${
                  done ? "border-primary/15 bg-primary/5" : "border-border/20 bg-muted/10"
                }`}>
                  {done ? (
                    <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {feat.label}
                  </span>
                </div>
              );
            })}
          </div>
          {missingFeatures.length > 0 && (
            <p className="text-[11px] text-muted-foreground/60 mt-3">
              Missing {missingFeatures.length} recommended overlay{missingFeatures.length > 1 ? "s" : ""}. Create them from the Overlays page.
            </p>
          )}
        </div>
      </div>

      {/* Active Overlay URLs */}
      <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
        <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
              <Link2 size={16} className="text-primary" /> Browser Source URLs
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/20 text-[10px] text-muted-foreground">
                <Monitor size={10} /> OBS
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/20 text-[10px] text-muted-foreground">
                <Tv size={10} /> TikTok LIVE Studio
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : widgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground/60 italic">No overlay widgets created yet. Visit the Overlays page to create your first one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {widgets.map(w => {
                const meta = overlayTypeLabels[w.widget_type] || { label: w.widget_type, icon: "📦" };
                const url = `${baseUrl}/overlay/${w.widget_type}/${w.public_token}`;
                const isCopied = copiedId === w.id;

                return (
                  <div key={w.id} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/15 hover:border-primary/15 transition-all">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(255,255,255,0.03)" }}>
                      {meta.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-heading font-bold text-foreground">{w.name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted/30 text-muted-foreground">{meta.label}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${w.is_active ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5 font-mono">{url}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(w.public_token, w.widget_type, w.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                          isCopied ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isCopied ? <Check size={11} /> : <Copy size={11} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help text */}
          <div className="mt-4 pt-3 border-t border-border/15">
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Copy any URL above and paste it as a <strong>Browser Source</strong> in OBS Studio or TikTok LIVE Studio.
              Set width to 1920 and height to 1080. All overlays auto-detect transparent backgrounds.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverlayUrlsTab;
