import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { devError } from "@/lib/dev-log";

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
  max_actions: 5,
  max_sounds: 5,
  max_chat_commands: Infinity,
  monthly_tts_characters: 1500,
  tts_enabled: true,
  premium_overlays: false,
  ai_voices: false,
  experimental_features: false,
  discord_role: false,
  early_access: false,
  gift_counters: 1,
  stream_profiles: 1,
  social_rotator_slots: 2,
  points_system_users: 2500,
  system_priority: false,
  basic_overlays: true,
  games: true,
  chatbot: true,
  subathon_timer: true,
  minecraft_integration: false,
  custom_css: false,
  custom_branding: false,
  advanced_analytics: false,
};

const PRO_LIMITS = {
  max_overlays: Infinity,
  max_actions: Infinity,
  max_sounds: Infinity,
  max_chat_commands: Infinity,
  monthly_tts_characters: 10000,
  tts_enabled: true,
  premium_overlays: true,
  ai_voices: true,
  experimental_features: true,
  discord_role: true,
  early_access: true,
  gift_counters: 3,
  stream_profiles: 10,
  social_rotator_slots: 100,
  points_system_users: 100000,
  system_priority: true,
  basic_overlays: true,
  games: true,
  chatbot: true,
  subathon_timer: true,
  minecraft_integration: true,
  custom_css: true,
  custom_branding: true,
  advanced_analytics: true,
};

export type FeatureLimitKey = keyof typeof FREE_LIMITS;

/** Unified feature list for display in ProGate and Pro page */
export const FEATURE_COMPARISON = [
  { label: "Actions & Events", free: "5", pro: "Unlimited*", key: "max_actions" },
  { label: "Sound Alerts", free: "5", pro: "Unlimited*", key: "max_sounds" },
  { label: "TTS Characters", free: "1.5k/mo", pro: "10k/mo*", key: "monthly_tts_characters" },
  { label: "Premium Overlays", free: "Preview only", pro: "Full access", key: "premium_overlays" },
  { label: "AI Voices", free: "Preview only", pro: "Full access", key: "ai_voices" },
  { label: "Experimental Features", free: "Preview", pro: "Full access", key: "experimental_features" },
  { label: "Discord Role", free: false, pro: true, key: "discord_role" },
  { label: "Early Feature Access", free: false, pro: true, key: "early_access" },
  { label: "Gift Counters", free: "1", pro: "3", key: "gift_counters" },
  { label: "Stream Profiles", free: "1", pro: "10", key: "stream_profiles" },
  { label: "Social Rotator Slots", free: "2", pro: "100", key: "social_rotator_slots" },
  { label: "Points System Users", free: "2.5k", pro: "100k", key: "points_system_users" },
  { label: "System Priority", free: "Normal", pro: "Prioritized", key: "system_priority" },
  { label: "Basic Overlays", free: true, pro: true, key: "basic_overlays" },
  { label: "Chat Commands", free: true, pro: true, key: "max_chat_commands" },
  { label: "Games", free: true, pro: true, key: "games" },
  { label: "Chatbot", free: true, pro: true, key: "chatbot" },
  { label: "Subathon Timer", free: true, pro: true, key: "subathon_timer" },
  { label: "Text-to-Speech", free: "Limited", pro: "Unlimited*", key: "tts_enabled" },
  { label: "Minecraft Integration", free: "Preview", pro: "Full access", key: "minecraft_integration" },
  { label: "Custom CSS", free: false, pro: true, key: "custom_css" },
  { label: "Custom Branding", free: false, pro: true, key: "custom_branding" },
  { label: "Advanced Analytics", free: false, pro: true, key: "advanced_analytics" },
] as const;

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
      devError("Failed to check subscription:", e);
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
