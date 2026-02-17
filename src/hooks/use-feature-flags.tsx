import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlag {
  id: string;
  feature_key: string;
  label: string;
  section: string;
  is_visible: boolean;
}

let globalFlags: FeatureFlag[] = [];
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

// Shared fetch — called once, cached globally
let fetched = false;
async function fetchFlags() {
  const { data } = await supabase
    .from("feature_flags" as any)
    .select("*")
    .order("section");
  if (data) {
    globalFlags = data as unknown as FeatureFlag[];
    notify();
  }
  fetched = true;
}

// Subscribe to realtime updates once
let subscribed = false;
function subscribeRealtime() {
  if (subscribed) return;
  subscribed = true;
  supabase
    .channel("feature-flags-realtime")
    .on("postgres_changes" as any, {
      event: "*",
      schema: "public",
      table: "feature_flags",
    }, (payload: any) => {
      if (payload.eventType === "UPDATE" && payload.new) {
        globalFlags = globalFlags.map(f =>
          f.id === payload.new.id ? { ...f, ...payload.new } : f
        );
        notify();
      } else {
        // Full refetch for INSERT/DELETE
        fetchFlags();
      }
    })
    .subscribe();
}

export function useFeatureFlags() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    if (!fetched) {
      fetchFlags();
      subscribeRealtime();
    }
    return () => { listeners.delete(listener); };
  }, []);

  const isVisible = useCallback((featureKey: string) => {
    const flag = globalFlags.find(f => f.feature_key === featureKey);
    return flag ? flag.is_visible : true; // default visible if not in table
  }, [globalFlags]);

  const toggleFlag = useCallback(async (featureKey: string) => {
    const flag = globalFlags.find(f => f.feature_key === featureKey);
    if (!flag) return;
    const newVal = !flag.is_visible;
    // Optimistic update
    globalFlags = globalFlags.map(f =>
      f.feature_key === featureKey ? { ...f, is_visible: newVal } : f
    );
    notify();
    await supabase
      .from("feature_flags" as any)
      .update({ is_visible: newVal } as any)
      .eq("id", flag.id);
  }, []);

  return { flags: globalFlags, isVisible, toggleFlag, loading: !fetched };
}
