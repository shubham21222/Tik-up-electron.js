import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface AllowedUsers {
  all_users: boolean;
  followers: boolean;
  subscribers: boolean;
  moderators: boolean;
  team_members: boolean;
  top_gifters: boolean;
  top_gifters_count: number;
  allowed_list: string[];
}

export interface SpecialUser {
  username: string;
  allowed: boolean;
  voice_id: string;
  speed: number;
  pitch: number;
}

export interface TTSSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  voice_provider: string;
  voice_id: string;
  language: string;
  random_voice: boolean;
  speed: number;
  pitch: number;
  volume: number;
  trigger_mode: string;
  min_chars: number;
  cooldown_seconds: number;
  blacklist_words: string[];
  interrupt_mode: boolean;
  max_length: number;
  allowed_users: AllowedUsers;
  comment_type: string;
  comment_command: string;
  charge_points: boolean;
  cost_per_message: number;
  max_queue_length: number;
  filter_letter_spam: boolean;
  filter_mentions: boolean;
  filter_commands: boolean;
  message_template: string;
  special_users: SpecialUser[];
}

const DEFAULT_TTS: Omit<TTSSettings, "id" | "user_id"> = {
  enabled: false,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  language: "en-GB",
  random_voice: false,
  speed: 50,
  pitch: 50,
  volume: 80,
  trigger_mode: "all_chat",
  min_chars: 3,
  cooldown_seconds: 0,
  blacklist_words: [],
  interrupt_mode: false,
  max_length: 300,
  allowed_users: {
    all_users: false,
    followers: false,
    subscribers: true,
    moderators: true,
    team_members: false,
    top_gifters: true,
    top_gifters_count: 3,
    allowed_list: [],
  },
  comment_type: "any",
  comment_command: "!command",
  charge_points: false,
  cost_per_message: 5,
  max_queue_length: 5,
  filter_letter_spam: true,
  filter_mentions: false,
  filter_commands: false,
  message_template: "{comment}",
  special_users: [],
};

export const TTS_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", tag: "Deep & Warm" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", tag: "Friendly" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", tag: "Authoritative" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", tag: "Calm" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", tag: "Casual" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", tag: "Energetic" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", tag: "Soft" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", tag: "News Anchor" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", tag: "Narrator" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", tag: "Upbeat" },
];

export const TTS_LANGUAGES = [
  { value: "en-GB", label: "English (Great Britain)" },
  { value: "en-US", label: "English (United States)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ar-SA", label: "Arabic" },
];

export function useTTSSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TTSSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("tts_settings" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setSettings(data as unknown as TTSSettings);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async (updates: Partial<TTSSettings>) => {
    if (!user) return;
    if (settings?.id) {
      const { error } = await supabase
        .from("tts_settings" as any)
        .update(updates as any)
        .eq("user_id", user.id);
      if (error) { toast.error("Failed to save TTS settings"); return; }
      setSettings(prev => prev ? { ...prev, ...updates } : prev);
    } else {
      const { data, error } = await supabase
        .from("tts_settings" as any)
        .insert({ user_id: user.id, ...DEFAULT_TTS, ...updates } as any)
        .select()
        .single();
      if (error) { toast.error("Failed to create TTS settings"); return; }
      setSettings(data as unknown as TTSSettings);
    }
    toast.success("TTS settings saved!");
  };

  return {
    settings: settings || ({ ...DEFAULT_TTS, id: "", user_id: "" } as TTSSettings),
    hasSettings: !!settings?.id,
    loading,
    saveSettings,
    refetch: fetchSettings,
  };
}
