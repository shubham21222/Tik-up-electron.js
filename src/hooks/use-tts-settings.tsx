import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface TTSSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  voice_provider: string;
  voice_id: string;
  speed: number;
  volume: number;
  trigger_mode: string;
  min_chars: number;
  cooldown_seconds: number;
  blacklist_words: string[];
  interrupt_mode: boolean;
  max_length: number;
}

const DEFAULT_TTS: Omit<TTSSettings, "id" | "user_id"> = {
  enabled: false,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  speed: 1.0,
  volume: 80,
  trigger_mode: "all_chat",
  min_chars: 3,
  cooldown_seconds: 5,
  blacklist_words: [],
  interrupt_mode: false,
  max_length: 200,
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
    if (settings) {
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

  return { settings: settings || (DEFAULT_TTS as TTSSettings), loading, saveSettings, refetch: fetchSettings };
}
