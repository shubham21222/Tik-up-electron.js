import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { overlayDefaultsMap } from "@/hooks/overlay-defaults";

// Re-export all defaults for backward compatibility
export {
  defaultGiftAlertSettings,
  defaultChatBoxSettings,
  defaultLikeAlertSettings,
  defaultFollowAlertSettings,
  defaultShareAlertSettings,
  defaultLikeCounterSettings,
  defaultFollowerGoalSettings,
  defaultViewerCountSettings,
  defaultLeaderboardSettings,
  defaultStreamTimerSettings,
  defaultCustomTextSettings,
  defaultGiftComboSettings,
  defaultTickerSettings,
  defaultAnimatedBgSettings,
  defaultSoundReactiveSettings,
  defaultSocialRotatorSettings,
  defaultGiftFireworkSettings,
  defaultPromoOverlaySettings,
  defaultStreamBorderSettings,
  defaultWebcamFrameSettings,
  defaultEventFeedSettings,
} from "@/hooks/overlay-defaults";

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
    const defaults = overlayDefaultsMap[type] || {};
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
