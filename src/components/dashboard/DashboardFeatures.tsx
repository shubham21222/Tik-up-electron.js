import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Layers, MessageSquare, Mic, Gift, Heart, Share2, UserPlus,
  Eye, Timer, Trophy, Type, Sparkles, Music, Frame, Camera,
  BarChart3, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface FeatureState {
  [key: string]: boolean;
}

const features = [
  { key: "chat_overlay", icon: MessageSquare, label: "Chat", link: "/chat-overlay" },
  { key: "tts", icon: Mic, label: "TTS", link: "/tts" },
  { key: "gift_alert", icon: Gift, label: "Gift Alerts", link: "/gift-alert-overlay" },
  { key: "like_alert", icon: Heart, label: "Like Alerts", link: "/like-alert-overlay" },
  { key: "follow_alert", icon: UserPlus, label: "Follow Alerts", link: "/follow-alert-overlay" },
  { key: "share_alert", icon: Share2, label: "Share Alerts", link: "/share-alert-overlay" },
  { key: "viewer_count", icon: Eye, label: "Viewer Count", link: "/viewer-count-overlay" },
  { key: "stream_timer", icon: Timer, label: "Timer", link: "/stream-timer-overlay" },
  { key: "leaderboard", icon: Trophy, label: "Leaderboard", link: "/leaderboard-overlay" },
  { key: "custom_text", icon: Type, label: "Custom Text", link: "/custom-text-overlay" },
  { key: "gift_combo", icon: Sparkles, label: "Gift Combo", link: "/gift-combo-overlay" },
  { key: "sound_reactive", icon: Music, label: "Sound React", link: "/sound-reactive-overlay" },
  { key: "stream_border", icon: Frame, label: "Borders", link: "/stream-border-overlay" },
  { key: "webcam_frame", icon: Camera, label: "Webcam Frame", link: "/webcam-frame-overlay" },
  { key: "ticker", icon: BarChart3, label: "Ticker", link: "/ticker-overlay" },
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
      // Group by widget_type - if ANY widget of that type is active, mark as active
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

    // Optimistic update
    setFeatureStates(prev => ({ ...prev, [widgetType]: newActive }));

    // Toggle all widgets of this type
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
      className="mb-8 rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h2 className="text-sm font-heading font-bold text-foreground">Stream Features</h2>
            <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-md bg-muted/30">
              {activeCount}/{configuredCount} active
            </span>
          </div>
          <Link to="/overlays" className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
            Manage All →
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-2">
          {features.map(feature => {
            const active = featureStates[feature.key] ?? false;
            const configured = feature.key in featureStates;
            const Icon = feature.icon;
            return (
              <button
                key={feature.key}
                onClick={() => {
                  if (configured) {
                    toggleFeature(feature.key);
                  } else {
                    toast.info(`Set up ${feature.label} first from Overlays page`);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                  active
                    ? "border-primary/20 bg-primary/5"
                    : configured
                    ? "border-border/20 bg-muted/10 hover:bg-muted/20"
                    : "border-border/10 bg-muted/5 hover:bg-muted/10 opacity-50"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? "bg-primary/15" : "bg-muted/40"
                }`}>
                  <Icon size={12} className={active ? "text-primary" : "text-muted-foreground/50"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-medium truncate ${
                    active ? "text-foreground" : "text-muted-foreground/60"
                  }`}>
                    {feature.label}
                  </p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  active ? "bg-primary" : configured ? "bg-muted-foreground/30" : "bg-muted-foreground/15"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border/15">
          <div className="flex items-center gap-1.5">
            <Settings size={11} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">{configuredCount}</span> configured
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{activeCount}</span> live
          </span>
          {configuredCount === 0 && (
            <Link to="/overlays" className="text-[10px] text-primary/70 ml-auto hover:text-primary transition-colors">
              Set up your first overlay →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardFeatures;