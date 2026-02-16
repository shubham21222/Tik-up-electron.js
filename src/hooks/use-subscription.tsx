import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const TIKUP_PRO = {
  price_id: "price_1T0elJFDweiUKVfYEBKZna3E",
  product_id: "prod_TybzkOW2XCM3TF",
};

export interface SubscriptionState {
  subscribed: boolean;
  plan: "free" | "pro";
  is_admin?: boolean;
  subscription_end: string | null;
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
  const [subState, setSubState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubState(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubState(data as SubscriptionState);
    } catch (e) {
      console.error("Failed to check subscription:", e);
      setSubState({ subscribed: false, plan: "free", subscription_end: null });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkSubscription();
    // Refresh every 60s
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const plan = subState?.plan || "free";
  const isPro = plan === "pro";
  const isAdmin = subState?.is_admin || false;
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

  const canUseFeature = (feature: keyof typeof FREE_LIMITS) => limits[feature];
  const canCreateOverlay = (currentCount: number) => currentCount < limits.max_overlays;

  return {
    subscription: subState,
    loading,
    plan,
    isPro,
    isAdmin,
    limits,
    canUseFeature,
    canCreateOverlay,
    refetch: checkSubscription,
  };
}
