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

interface FeatureState {
  [key: string]: boolean;
}

const features = [
  { key: "chat_overlay", icon: MessageSquare, label: "Chat Overlay", desc: "Show live chat on stream", link: "/chat-overlay", color: "160 100% 45%" },
  { key: "tts", icon: Mic, label: "Text-to-Speech", desc: "Read chat messages aloud", link: "/tts", color: "280 80% 60%" },
  { key: "gift_alert", icon: Gift, label: "Gift Alerts", desc: "Animated gift notifications", link: "/gift-alerts", color: "340 80% 55%" },
  { key: "like_alert", icon: Heart, label: "Like Alerts", desc: "Heart animation on likes", link: "/like-alerts", color: "350 90% 60%" },
  { key: "follow_alert", icon: UserPlus, label: "Follow Alerts", desc: "New follower pop-ups", link: "/follow-alerts", color: "200 90% 55%" },
  { key: "share_alert", icon: Share2, label: "Share Alerts", desc: "Share event notifications", link: "/share-alerts", color: "45 100% 55%" },
  { key: "viewer_count", icon: Eye, label: "Viewer Count", desc: "Live viewer counter widget", link: "/viewer-count", color: "220 80% 60%" },
  { key: "stream_timer", icon: Timer, label: "Stream Timer", desc: "Elapsed time on screen", link: "/stream-timer", color: "180 70% 50%" },
  { key: "leaderboard", icon: Trophy, label: "Leaderboard", desc: "Top gifters & supporters", link: "/leaderboard", color: "40 95% 55%" },
  { key: "custom_text", icon: Type, label: "Custom Text", desc: "Scrolling text overlay", link: "/custom-text", color: "260 70% 60%" },
  { key: "gift_combo", icon: Sparkles, label: "Gift Combo", desc: "Combo counter for gifts", link: "/gift-combo", color: "300 85% 55%" },
  { key: "sound_reactive", icon: Music, label: "Sound Reactive", desc: "Audio visualizer overlay", link: "/sound-reactive", color: "170 80% 50%" },
  { key: "stream_border", icon: Frame, label: "Stream Border", desc: "Decorative stream frame", link: "/stream-border", color: "210 75% 55%" },
  { key: "webcam_frame", icon: Camera, label: "Webcam Frame", desc: "Camera frame overlay", link: "/webcam-frame", color: "15 85% 55%" },
  { key: "ticker", icon: BarChart3, label: "Ticker", desc: "Scrolling news ticker", link: "/ticker", color: "130 70% 50%" },
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
      <div
        className="rounded-2xl border border-border/30 p-5"
        style={{ background: "rgba(12,14,20,0.7)", backdropFilter: "blur(24px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(160 100% 45% / 0.1)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
              <Layers size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-foreground">Stream Features</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                <span className="text-primary font-semibold">{activeCount}</span> active · <span className="text-foreground font-medium">{configuredCount}</span> configured
              </p>
            </div>
          </div>
          <Link
            to="/overlays"
            className="flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary font-medium transition-colors"
          >
            Manage All <ChevronRight size={12} />
          </Link>
        </div>

        {/* Feature List */}
        <div className="space-y-1.5">
          {features.map((feature, i) => {
            const active = featureStates[feature.key] ?? false;
            const configured = feature.key in featureStates;
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl border transition-all duration-200 ${
                  active
                    ? "border-primary/15 bg-primary/[0.04]"
                    : "border-transparent hover:border-border/20 hover:bg-[hsl(0_0%_100%/0.015)]"
                }`}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
                  style={{
                    background: active ? `hsl(${feature.color} / 0.12)` : "hsl(0 0% 100% / 0.04)",
                    border: `1px solid ${active ? `hsl(${feature.color} / 0.2)` : "hsl(0 0% 100% / 0.06)"}`,
                  }}
                >
                  <Icon size={16} className={`transition-colors duration-200 ${active ? "" : "text-muted-foreground/50"}`}
                    style={active ? { color: `hsl(${feature.color})` } : undefined}
                  />
                </div>

                {/* Label + Description */}
                <Link to={feature.link} className="flex-1 min-w-0 group/link">
                  <p className={`text-[13px] font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  } group-hover/link:text-primary`}>
                    {feature.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                    {feature.desc}
                  </p>
                </Link>

                {/* Toggle Switch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (configured) {
                      toggleFeature(feature.key);
                    } else {
                      toast.info(`Set up ${feature.label} first from the Overlays page`);
                    }
                  }}
                  className={`relative w-11 h-6 rounded-full shrink-0 transition-all duration-300 ${
                    !configured ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{
                    background: active
                      ? `linear-gradient(135deg, hsl(${feature.color}), hsl(${feature.color} / 0.7))`
                      : "hsl(0 0% 100% / 0.08)",
                    boxShadow: active ? `0 0 12px hsl(${feature.color} / 0.3)` : "none",
                  }}
                >
                  <motion.div
                    className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
                    animate={{ left: active ? 22 : 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        {configuredCount === 0 && (
          <div className="mt-4 pt-3 border-t border-border/10">
            <Link
              to="/overlays"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/20 text-[12px] text-primary/80 font-medium hover:bg-primary/[0.03] hover:border-primary/30 transition-all"
            >
              <Settings size={13} />
              Set up your first overlay to get started
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardFeatures;
