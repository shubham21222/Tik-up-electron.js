import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

/**
 * Shared hook for overlay renderers.
 * Handles: transparent body, initial fetch, real-time DB subscription.
 *
 * @param defaults  – the default settings object for this widget type
 * @param channelPrefix – unique prefix for the Supabase channel (e.g. "vlb")
 * @param options.applyUrlParams – whether to apply URL query overrides (default true)
 */
export function useRendererSettings<T extends Record<string, any>>(
  defaults: T,
  channelPrefix: string,
  options?: { applyUrlParams?: boolean },
) {
  useOverlayBody();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [settings, setSettings] = useState<T>(defaults);

  const applyUrl = options?.applyUrlParams ?? true;

  // Initial fetch
  useEffect(() => {
    if (!publicToken) return;
    supabase
      .from("overlay_widgets")
      .select("settings")
      .eq("public_token", publicToken)
      .single()
      .then(({ data }) => {
        if (data) {
          const merged = { ...defaults, ...(data.settings as Partial<T>) };
          setSettings(applyUrl ? (applyUrlOverrides(merged) as T) : merged);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicToken]);

  // Real-time DB subscription
  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase
      .channel(`${channelPrefix}-db-${publicToken}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "overlay_widgets",
          filter: `public_token=eq.${publicToken}`,
        },
        (payload: any) => {
          if (payload.new?.settings) {
            setSettings({ ...defaults, ...payload.new.settings });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicToken]);

  return { settings, setSettings, publicToken } as const;
}
