import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Layers, MessageSquare, Mic, Gift, Heart, Share2, UserPlus,
  Eye, Timer, Trophy, Type, Sparkles, Music, Frame, Camera,
  BarChart3, Settings, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PageHelpButton from "@/components/PageHelpButton";

interface FeatureState {
  [key: string]: boolean;
}

const features = [
  { key: "chat_overlay", icon: MessageSquare, label: "Chat", link: "/chat-overlay", color: "160 100% 45%" },
  { key: "tts", icon: Mic, label: "TTS", link: "/tts", color: "280 80% 60%" },
  { key: "gift_alert", icon: Gift, label: "Gifts", link: "/gift-alerts", color: "340 80% 55%" },
  { key: "like_alert", icon: Heart, label: "Likes", link: "/like-alerts", color: "350 90% 60%" },
  { key: "follow_alert", icon: UserPlus, label: "Follows", link: "/follow-alerts", color: "200 90% 55%" },
  { key: "share_alert", icon: Share2, label: "Shares", link: "/share-alerts", color: "45 100% 55%" },
  { key: "viewer_count", icon: Eye, label: "Viewers", link: "/viewer-count", color: "220 80% 60%" },
  { key: "stream_timer", icon: Timer, label: "Timer", link: "/stream-timer", color: "180 70% 50%" },
  { key: "leaderboard", icon: Trophy, label: "Leaders", link: "/leaderboard", color: "40 95% 55%" },
  { key: "custom_text", icon: Type, label: "Text", link: "/custom-text", color: "260 70% 60%" },
  { key: "gift_combo", icon: Sparkles, label: "Combos", link: "/gift-combo", color: "300 85% 55%" },
  { key: "sound_reactive", icon: Music, label: "Sound", link: "/sound-reactive", color: "170 80% 50%" },
  { key: "stream_border", icon: Frame, label: "Borders", link: "/stream-border", color: "210 75% 55%" },
  { key: "webcam_frame", icon: Camera, label: "Webcam", link: "/webcam-frame", color: "15 85% 55%" },
  { key: "ticker", icon: BarChart3, label: "Ticker", link: "/ticker", color: "130 70% 50%" },
] as const;

const DashboardFeatures = () => {
  const { user } = useAuth();
  const [featureStates, setFeatureStates] = useState<FeatureState>({});
  const [loading, setLoading] = useState(true);

  const fetchWidgets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("overlay_widgets")
      .select("widget_type, is_active")
      .eq("user_id", user.id);

    if (data) {
      const states: FeatureState = {};
      for (const w of data as any[]) {
        if (states[w.widget_type] === undefined) {
          states[w.widget_type] = w.is_active;
        } else if (w.is_active) {
          states[w.widget_type] = true;
        }
      }
      setFeatureStates(states);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWidgets(); }, [fetchWidgets]);

  const toggleFeature = async (widgetType: string) => {
    if (!user) return;
    const currentlyActive = featureStates[widgetType] ?? false;
    const newActive = !currentlyActive;

    setFeatureStates(prev => ({ ...prev, [widgetType]: newActive }));

    const { error } = await supabase
      .from("overlay_widgets")
      .update({ is_active: newActive } as any)
      .eq("user_id", user.id)
      .eq("widget_type", widgetType);

    if (error) {
      setFeatureStates(prev => ({ ...prev, [widgetType]: currentlyActive }));
      toast.error("Failed to update");
      return;
    }

    const label = features.find(f => f.key === widgetType)?.label || widgetType;
    toast.success(`${label} ${newActive ? "enabled" : "disabled"}`);
  };

  if (loading) return null;

  const configuredCount = Object.keys(featureStates).length;
  const activeCount = Object.values(featureStates).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(160 100% 45% / 0.1)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
            <Layers size={14} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-heading font-bold text-foreground">Stream Features</h2>
            <p className="text-[11px] text-muted-foreground">
              <span className="text-primary font-semibold">{activeCount}</span> active · {configuredCount} set up
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageHelpButton featureKey="stream-features" title="Stream Features" />
          <Link to="/overlays" className="flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary font-medium transition-colors">
            Manage <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Landscape Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-2.5">
        {features.map((feature, i) => {
          const active = featureStates[feature.key] ?? false;
          const configured = feature.key in featureStates;
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="relative group"
            >
              <button
                onClick={() => {
                  if (configured) {
                    toggleFeature(feature.key);
                  } else {
                    toast.info(`Set up ${feature.label} first from Overlays`);
                  }
                }}
                className={`w-full rounded-2xl p-4 border transition-all duration-300 text-center feature-grid-btn ${
                  active
                    ? "border-[hsl(var(--primary)/0.2)]"
                    : ""
                } ${!configured ? "opacity-40" : ""}`}
                style={active ? {
                  background: `linear-gradient(160deg, hsl(${feature.color} / 0.08), hsl(${feature.color} / 0.02))`,
                  boxShadow: `0 4px 20px -4px hsl(${feature.color} / 0.15)`,
                  borderColor: `hsl(${feature.color} / 0.2)`,
                } : undefined}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center transition-all duration-300"
                  style={{
                    background: active ? `hsl(${feature.color} / 0.12)` : "hsl(var(--muted))",
                    border: `1px solid ${active ? `hsl(${feature.color} / 0.25)` : "hsl(var(--border))"}`,
                    boxShadow: active ? `0 0 16px hsl(${feature.color} / 0.2)` : "none",
                  }}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 ${active ? "" : "text-muted-foreground/40"}`}
                    style={active ? { color: `hsl(${feature.color})` } : undefined}
                  />
                </div>

                {/* Label */}
                <p className={`text-[12px] font-semibold mb-2 transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground/60"
                }`}>
                  {feature.label}
                </p>

                {/* Status Pill */}
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  active
                    ? "text-primary"
                    : configured
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground/25"
                }`}
                  style={{
                    background: active ? `hsl(${feature.color} / 0.1)` : "hsl(var(--muted))",
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    active ? "animate-pulse" : ""
                  }`} style={{
                    background: active ? `hsl(${feature.color})` : "hsl(0 0% 100% / 0.15)",
                    boxShadow: active ? `0 0 6px hsl(${feature.color} / 0.5)` : "none",
                  }} />
                  {active ? "Live" : configured ? "Off" : "Setup"}
                </div>
              </button>

              {/* Settings link */}
              <Link
                to={feature.link}
                className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-muted hover:bg-accent"
              >
                <Settings size={10} className="text-muted-foreground" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {configuredCount === 0 && (
        <Link
          to="/overlays"
          className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl border border-dashed border-primary/20 text-[12px] text-primary/80 font-medium hover:bg-primary/[0.03] hover:border-primary/30 transition-all"
        >
          <Settings size={13} />
          Set up your first overlay →
        </Link>
      )}
    </motion.div>
  );
};

export default DashboardFeatures;
