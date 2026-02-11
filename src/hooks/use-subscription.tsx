import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "pro" | "enterprise";
  status: string;
  current_period_end: string | null;
}

const FREE_LIMITS = {
  max_overlays: 5,
  tts_enabled: false,
  max_sounds: 10,
  max_chat_commands: 5,
  custom_css: false,
  custom_branding: false,
  advanced_analytics: false,
};

const PRO_LIMITS = {
  max_overlays: Infinity,
  tts_enabled: true,
  max_sounds: Infinity,
  max_chat_commands: Infinity,
  custom_css: true,
  custom_branding: true,
  advanced_analytics: true,
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setSubscription(data as unknown as Subscription);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const plan = subscription?.plan || "free";
  const isPro = plan === "pro" || plan === "enterprise";
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

  const canUseFeature = (feature: keyof typeof FREE_LIMITS) => {
    return limits[feature];
  };

  const canCreateOverlay = (currentCount: number) => {
    return currentCount < limits.max_overlays;
  };

  return {
    subscription,
    loading,
    plan,
    isPro,
    limits,
    canUseFeature,
    canCreateOverlay,
    refetch: fetchSubscription,
  };
}
