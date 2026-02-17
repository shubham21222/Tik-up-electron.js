import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface SpotifyConnection {
  connected: boolean;
  spotify_email?: string;
  spotify_display_name?: string;
  spotify_product?: string;
}

interface SpotifyTrack {
  uri: string;
  name: string;
  artist: string;
  album?: string;
  image?: string;
  explicit?: boolean;
  duration_ms?: number;
}

interface NowPlaying {
  is_playing: boolean;
  item?: {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    duration_ms: number;
    uri: string;
  };
  progress_ms?: number;
  device?: { name: string; volume_percent: number };
}

interface MusicConfig {
  is_enabled: boolean;
  skip_threshold: number;
  queue_threshold: number;
  pause_threshold: number;
  priority_play_threshold: number;
  volume_boost_threshold: number;
  skip_cooldown: number;
  queue_limit_per_user: number;
  allow_explicit: boolean;
  chat_command: string;
  chat_command_enabled: boolean;
  blacklisted_artists: string[];
  priority_queue_enabled: boolean;
}

const DEFAULT_CONFIG: MusicConfig = {
  is_enabled: true,
  skip_threshold: 500,
  queue_threshold: 100,
  pause_threshold: 300,
  priority_play_threshold: 1000,
  volume_boost_threshold: 200,
  skip_cooldown: 120,
  queue_limit_per_user: 3,
  allow_explicit: true,
  chat_command: "!song",
  chat_command_enabled: true,
  blacklisted_artists: [],
  priority_queue_enabled: true,
};

export function useSpotify() {
  const { user, session } = useAuth();
  const [connection, setConnection] = useState<SpotifyConnection>({ connected: false });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [config, setConfig] = useState<MusicConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const callAuth = useCallback(async (action: string, body?: unknown) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) throw new Error("Not authenticated");
    
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-auth?action=${action}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s.access_token}`,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body || {}),
    });
    return response.json();
  }, []);

  const callApi = useCallback(async (action: string, body?: unknown) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) throw new Error("Not authenticated");

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-api?action=${action}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s.access_token}`,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body || {}),
    });
    return response.json();
  }, []);

  // Check connection status
  const checkStatus = useCallback(async () => {
    try {
      const data = await callAuth("status");
      setConnection({
        connected: data.connected,
        ...data.connection,
      });
    } catch {
      setConnection({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [callAuth]);

  // Load music config
  const loadConfig = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("spotify_music_config")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setConfig({
        is_enabled: data.is_enabled,
        skip_threshold: data.skip_threshold,
        queue_threshold: data.queue_threshold,
        pause_threshold: data.pause_threshold,
        priority_play_threshold: data.priority_play_threshold,
        volume_boost_threshold: data.volume_boost_threshold,
        skip_cooldown: data.skip_cooldown,
        queue_limit_per_user: data.queue_limit_per_user,
        allow_explicit: data.allow_explicit,
        chat_command: data.chat_command,
        chat_command_enabled: data.chat_command_enabled,
        blacklisted_artists: (data.blacklisted_artists as string[]) || [],
        priority_queue_enabled: data.priority_queue_enabled,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkStatus();
      loadConfig();
    }
  }, [user, checkStatus, loadConfig]);

  // Poll now playing when connected
  useEffect(() => {
    if (!connection.connected) {
      setNowPlaying(null);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const fetchNowPlaying = async () => {
      try {
        const data = await callApi("now-playing");
        if (data && !data.error) setNowPlaying(data);
      } catch {}
    };

    fetchNowPlaying();
    pollRef.current = setInterval(fetchNowPlaying, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [connection.connected, callApi]);

  // Connect Spotify
  const connect = useCallback(async () => {
    try {
      const redirectUri = window.location.origin + "/sounds";
      const data = await callAuth("auth-url", { redirect_uri: redirectUri });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error("Failed to start Spotify connection");
    }
  }, [callAuth]);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code: string) => {
    try {
      const redirectUri = window.location.origin + "/sounds";
      const { data: { session: s } } = await supabase.auth.getSession();
      const data = await callAuth("callback", { 
        code, 
        redirect_uri: redirectUri,
        state: s?.access_token,
      });
      if (data.success) {
        toast.success("Spotify connected!");
        await checkStatus();
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch {
      toast.error("Failed to complete Spotify connection");
    }
  }, [callAuth, checkStatus]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      await callAuth("disconnect");
      setConnection({ connected: false });
      setNowPlaying(null);
      toast.success("Spotify disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  }, [callAuth]);

  // Search
  const search = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const data = await callApi("search", { query });
      setSearchResults(data.tracks || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [callApi]);

  // Playback controls
  const skip = useCallback(async () => {
    const data = await callApi("skip");
    if (data.error) toast.error(data.error);
    else toast.success("Skipped track");
  }, [callApi]);

  const pause = useCallback(async () => {
    const data = await callApi("pause");
    if (data.error) toast.error(data.error);
  }, [callApi]);

  const resume = useCallback(async () => {
    const data = await callApi("resume");
    if (data.error) toast.error(data.error);
  }, [callApi]);

  const setVolume = useCallback(async (volume: number) => {
    await callApi("volume", { volume });
  }, [callApi]);

  const addToQueue = useCallback(async (track: SpotifyTrack, requesterUsername?: string, coinsSpent?: number) => {
    const data = await callApi("queue", {
      track_uri: track.uri,
      requester_username: requesterUsername || "Streamer",
      coins_spent: coinsSpent || 0,
    });
    if (data.error) {
      toast.error(data.error);
      return false;
    }
    toast.success(`Added "${track.name}" to queue`);
    return true;
  }, [callApi]);

  // Update config
  const updateConfig = useCallback(async (updates: Partial<MusicConfig>) => {
    if (!user) return;
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    await supabase
      .from("spotify_music_config")
      .upsert({ user_id: user.id, ...newConfig }, { onConflict: "user_id" });
  }, [user, config]);

  return {
    connection,
    nowPlaying,
    config,
    loading,
    searchResults,
    searching,
    connect,
    handleCallback,
    disconnect,
    search,
    skip,
    pause,
    resume,
    setVolume,
    addToQueue,
    updateConfig,
    checkStatus,
  };
}
