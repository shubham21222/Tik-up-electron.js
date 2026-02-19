import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string | null;
}

// Client-side cache
let clientCache: { voices: ElevenLabsVoice[]; at: number } | null = null;
const CLIENT_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function useElevenLabsVoices() {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>(clientCache?.voices || []);
  const [loading, setLoading] = useState(!clientCache);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetchVoices = useCallback(async () => {
    if (clientCache && Date.now() - clientCache.at < CLIENT_CACHE_TTL) {
      setVoices(clientCache.voices);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voices-list`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const result = await response.json();
      const voiceList = result.voices || [];

      clientCache = { voices: voiceList, at: Date.now() };
      setVoices(voiceList);
    } catch (err: any) {
      console.error("Voice fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetchVoices();
    }
  }, [fetchVoices]);

  return { voices, loading, error, refetch: fetchVoices };
}

/** Group voices by gender/accent label */
export function groupVoices(voices: ElevenLabsVoice[]) {
  const groups: Record<string, ElevenLabsVoice[]> = {};

  for (const v of voices) {
    const gender = v.labels?.gender || "other";
    const key = gender.charAt(0).toUpperCase() + gender.slice(1);
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  }

  // Sort each group alphabetically
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups;
}
