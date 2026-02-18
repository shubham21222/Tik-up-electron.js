import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Quick Controls state shared between the dashboard and overlay renderers.
 *
 * Dashboard (QuickControls component) BROADCASTS state changes.
 * Overlay renderers LISTEN for state changes via useQuickControlListener.
 */

export interface QuickControlState {
  soundsMuted: boolean;
  ttsMuted: boolean;
  alertsPaused: boolean;
  cooldownActive: boolean;
}

const DEFAULT_STATE: QuickControlState = {
  soundsMuted: false,
  ttsMuted: false,
  alertsPaused: false,
  cooldownActive: false,
};

/**
 * Broadcast quick-control state changes to all overlay renderers.
 * Used by the dashboard QuickControls component.
 */
export function useBroadcastQuickControls() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      userIdRef.current = data.user.id;
      channelRef.current = supabase.channel(`quick_controls_${data.user.id}`);
      channelRef.current.subscribe();
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const broadcast = (state: QuickControlState) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "control_update",
      payload: state,
    });
  };

  return { broadcast };
}

/**
 * Listen for quick-control state changes from the dashboard.
 * Used by overlay renderers that know the widget owner's userId.
 */
export function useQuickControlListener(userId: string | null) {
  const [controls, setControls] = useState<QuickControlState>(DEFAULT_STATE);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`quick_controls_${userId}`)
      .on("broadcast", { event: "control_update" }, (msg) => {
        setControls(msg.payload as QuickControlState);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return controls;
}
