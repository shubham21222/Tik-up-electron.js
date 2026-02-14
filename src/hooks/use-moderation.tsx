import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface ModerationConfig {
  id: string;
  user_id: string;
  block_links: boolean;
  caps_filter: boolean;
  spam_detection: boolean;
  block_banned_words: boolean;
  allow_subscriber_links: boolean;
  slow_mode: boolean;
  slow_mode_seconds: number;
  emoji_only_filter: boolean;
  first_message_review: boolean;
  safe_mode: boolean;
}

export interface BannedWord {
  id: string;
  user_id: string;
  word: string;
  category: string;
  severity: string;
  apply_to_chat: boolean;
  apply_to_tts: boolean;
  created_at: string;
}

export interface BannedUser {
  id: string;
  user_id: string;
  username: string;
  reason: string | null;
  block_chat: boolean;
  block_tts: boolean;
  block_alerts: boolean;
  auto_timeout: boolean;
  created_at: string;
}

export interface ModerationLogEntry {
  id: string;
  user_id: string;
  username: string;
  original_message: string;
  triggered_word: string | null;
  action_taken: string;
  filter_type: string;
  created_at: string;
}

const DEFAULT_CONFIG: Omit<ModerationConfig, "id" | "user_id"> = {
  block_links: true,
  caps_filter: true,
  spam_detection: true,
  block_banned_words: true,
  allow_subscriber_links: false,
  slow_mode: false,
  slow_mode_seconds: 5,
  emoji_only_filter: false,
  first_message_review: false,
  safe_mode: false,
};

export const WORD_CATEGORIES = [
  { value: "custom", label: "Custom", color: "text-primary" },
  { value: "hate_speech", label: "Hate Speech", color: "text-red-400" },
  { value: "sexual", label: "Sexual Content", color: "text-pink-400" },
  { value: "violence", label: "Violence & Self-Harm", color: "text-orange-400" },
  { value: "fraud", label: "Illegal / Fraud", color: "text-yellow-400" },
  { value: "deceptive", label: "Deceptive Claims", color: "text-amber-400" },
  { value: "bullying", label: "Bullying / Insults", color: "text-purple-400" },
];

export const SEVERITY_OPTIONS = [
  { value: "block", label: "Block", desc: "Remove message entirely" },
  { value: "warn", label: "Warn", desc: "Auto-reply warning to user" },
  { value: "replace", label: "Replace", desc: "Replace with *****" },
];

export function useModeration() {
  const { user } = useAuth();
  const [config, setConfig] = useState<ModerationConfig | null>(null);
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [modLog, setModLog] = useState<ModerationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const [configRes, wordsRes, usersRes, logRes] = await Promise.all([
      supabase.from("moderation_config" as any).select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("banned_words" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("banned_users" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("moderation_log" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    if (configRes.data) setConfig(configRes.data as unknown as ModerationConfig);
    if (wordsRes.data) setBannedWords(wordsRes.data as unknown as BannedWord[]);
    if (usersRes.data) setBannedUsers(usersRes.data as unknown as BannedUser[]);
    if (logRes.data) setModLog(logRes.data as unknown as ModerationLogEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveConfig = async (updates: Partial<ModerationConfig>) => {
    if (!user) return;
    if (config?.id) {
      const { error } = await supabase.from("moderation_config" as any).update(updates as any).eq("user_id", user.id);
      if (error) { toast.error("Failed to save moderation config"); return; }
      setConfig(prev => prev ? { ...prev, ...updates } : prev);
    } else {
      const { data, error } = await supabase.from("moderation_config" as any)
        .insert({ user_id: user.id, ...DEFAULT_CONFIG, ...updates } as any).select().single();
      if (error) { toast.error("Failed to create moderation config"); return; }
      setConfig(data as unknown as ModerationConfig);
    }
    toast.success("Moderation settings saved");
  };

  const addBannedWord = async (word: string, category = "custom", severity = "block") => {
    if (!user) return;
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return;
    if (bannedWords.some(w => w.word === trimmed)) { toast.error("Word already in list"); return; }

    const { data, error } = await supabase.from("banned_words" as any)
      .insert({ user_id: user.id, word: trimmed, category, severity } as any).select().single();
    if (error) { toast.error("Failed to add word"); return; }
    setBannedWords(prev => [data as unknown as BannedWord, ...prev]);
    toast.success(`"${trimmed}" added to banned list`);
  };

  const addBannedWords = async (words: string[], category = "custom", severity = "block") => {
    if (!user) return;
    const unique = [...new Set(words.map(w => w.trim().toLowerCase()).filter(Boolean))]
      .filter(w => !bannedWords.some(bw => bw.word === w));
    if (!unique.length) { toast.info("No new words to add"); return; }

    const rows = unique.map(word => ({ user_id: user.id, word, category, severity }));
    const { data, error } = await supabase.from("banned_words" as any).insert(rows as any).select();
    if (error) { toast.error("Failed to bulk-add words"); return; }
    setBannedWords(prev => [...(data as unknown as BannedWord[]), ...prev]);
    toast.success(`${unique.length} words added`);
  };

  const removeBannedWord = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("banned_words" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to remove word"); return; }
    setBannedWords(prev => prev.filter(w => w.id !== id));
  };

  const updateBannedWord = async (id: string, updates: Partial<BannedWord>) => {
    if (!user) return;
    const { error } = await supabase.from("banned_words" as any).update(updates as any).eq("id", id);
    if (error) { toast.error("Failed to update word"); return; }
    setBannedWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const addBannedUser = async (username: string, reason?: string) => {
    if (!user) return;
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return;
    if (bannedUsers.some(u => u.username === trimmed)) { toast.error("User already banned"); return; }

    const { data, error } = await supabase.from("banned_users" as any)
      .insert({ user_id: user.id, username: trimmed, reason: reason || null } as any).select().single();
    if (error) { toast.error("Failed to ban user"); return; }
    setBannedUsers(prev => [data as unknown as BannedUser, ...prev]);
    toast.success(`@${trimmed} banned`);
  };

  const removeBannedUser = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("banned_users" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to unban user"); return; }
    setBannedUsers(prev => prev.filter(u => u.id !== id));
  };

  return {
    config: config || ({ ...DEFAULT_CONFIG, id: "", user_id: "" } as ModerationConfig),
    hasConfig: !!config?.id,
    bannedWords,
    bannedUsers,
    modLog,
    loading,
    saveConfig,
    addBannedWord,
    addBannedWords,
    removeBannedWord,
    updateBannedWord,
    addBannedUser,
    removeBannedUser,
    refetch: fetchAll,
  };
}
