import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface OverlayWidget {
  id: string;
  user_id: string;
  widget_type: string;
  name: string;
  public_token: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Default settings for Gift Alert overlay
export const defaultGiftAlertSettings = {
  // Trigger conditions
  trigger_mode: "any_gift" as "any_gift" | "specific_gift" | "value_threshold" | "combo" | "milestone",
  specific_gift_type: "",
  value_threshold: 100,
  combo_threshold: 5,
  milestone_total: 1000,

  // Visual customization
  animation_style: "bounce" as "slide" | "bounce" | "explosion" | "flip_3d" | "glitch",
  duration: 5,
  entry_animation: "scale_up" as "scale_up" | "slide_left" | "slide_right" | "slide_top" | "fade",
  exit_animation: "fade" as "fade" | "slide_out" | "scale_down" | "dissolve",
  gift_image_size: 64,
  username_font: "heading" as "heading" | "mono" | "sans",
  glow_intensity: 50,
  shadow_depth: 30,
  border_glow: true,
  accent_color: "160 100% 45%",

  // Sound
  sound_url: "",
  sound_volume: 80,
  sound_delay: 0,
  sound_loop: false,
  combo_sound_override: "",

  // Advanced
  queue_enabled: true,
  priority_alerts: true,
  max_on_screen: 3,
  anti_spam_throttle: 2,
  alert_cooldown: 1,
  animation_speed: 1,

  // Display
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
};

// Default settings for Chat Box overlay
export const defaultChatBoxSettings = {
  // Display mode
  display_mode: "cyber" as "minimal" | "twitch" | "cyber" | "glass",

  // Customization
  message_fade_time: 30,
  max_messages: 8,
  username_color_auto: true,
  show_badges: true,
  emote_scale: 1.2,

  // Advanced
  highlight_gifts: true,
  highlight_keywords: "",
  highlight_moderators: true,
  auto_scroll: true,
  message_animation: "slide" as "slide" | "fade" | "pop" | "typewriter",
  shadow_depth: 20,

  // Font
  font_size: 13,
  font_family: "sans" as "sans" | "mono" | "heading",

  // Display
  transparent_bg: true,
  dark_bg: false,
  fps_limit: 60,
  custom_css: "",
  accent_color: "160 100% 45%",
};

export function useOverlayWidgets(widgetType?: string) {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<OverlayWidget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    let query = supabase.from("overlay_widgets" as any).select("*").eq("user_id", user.id);
    if (widgetType) query = query.eq("widget_type", widgetType);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (!error && data) setWidgets(data as unknown as OverlayWidget[]);
    setLoading(false);
  }, [user, widgetType]);

  useEffect(() => { fetchWidgets(); }, [fetchWidgets]);

  const createWidget = async (type: string, name: string) => {
    if (!user) return null;
    const defaults = type === "gift_alert" ? defaultGiftAlertSettings
      : type === "chat_box" ? defaultChatBoxSettings : {};
    const { data, error } = await supabase
      .from("overlay_widgets" as any)
      .insert({ user_id: user.id, widget_type: type, name, settings: defaults } as any)
      .select()
      .single();
    if (error) { toast.error("Failed to create overlay"); return null; }
    const widget = data as unknown as OverlayWidget;
    setWidgets(prev => [widget, ...prev]);
    toast.success("Overlay created!");
    return widget;
  };

  const updateSettings = async (id: string, settings: Record<string, any>) => {
    const { error } = await supabase
      .from("overlay_widgets" as any)
      .update({ settings } as any)
      .eq("id", id);
    if (error) { toast.error("Failed to save"); return; }
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, settings } : w));
    toast.success("Settings saved!");
  };

  const deleteWidget = async (id: string) => {
    const { error } = await supabase.from("overlay_widgets" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setWidgets(prev => prev.filter(w => w.id !== id));
    toast.success("Overlay deleted!");
  };

  const toggleActive = async (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    const { error } = await supabase
      .from("overlay_widgets" as any)
      .update({ is_active: !widget.is_active } as any)
      .eq("id", id);
    if (!error) setWidgets(prev => prev.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w));
  };

  return { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive, refetch: fetchWidgets };
}
