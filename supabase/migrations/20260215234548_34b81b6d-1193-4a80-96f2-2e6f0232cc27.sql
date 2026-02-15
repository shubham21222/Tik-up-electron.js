
-- Spotify connections: stores OAuth tokens per user
CREATE TABLE public.spotify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  spotify_email TEXT,
  spotify_display_name TEXT,
  spotify_product TEXT, -- premium/free
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.spotify_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spotify connection"
  ON public.spotify_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spotify connection"
  ON public.spotify_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spotify connection"
  ON public.spotify_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spotify connection"
  ON public.spotify_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_spotify_connections_updated_at
  BEFORE UPDATE ON public.spotify_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Spotify music config: gift thresholds + settings per user
CREATE TABLE public.spotify_music_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  skip_threshold INTEGER NOT NULL DEFAULT 500,
  queue_threshold INTEGER NOT NULL DEFAULT 100,
  pause_threshold INTEGER NOT NULL DEFAULT 300,
  priority_play_threshold INTEGER NOT NULL DEFAULT 1000,
  volume_boost_threshold INTEGER NOT NULL DEFAULT 200,
  skip_cooldown INTEGER NOT NULL DEFAULT 120, -- seconds
  queue_limit_per_user INTEGER NOT NULL DEFAULT 3,
  allow_explicit BOOLEAN NOT NULL DEFAULT true,
  chat_command TEXT NOT NULL DEFAULT '!song',
  chat_command_enabled BOOLEAN NOT NULL DEFAULT true,
  blacklisted_artists JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_queue_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.spotify_music_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spotify music config"
  ON public.spotify_music_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spotify music config"
  ON public.spotify_music_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spotify music config"
  ON public.spotify_music_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_spotify_music_config_updated_at
  BEFORE UPDATE ON public.spotify_music_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Song requests: tracks requested by viewers
CREATE TABLE public.song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- streamer
  requester_username TEXT NOT NULL DEFAULT 'Viewer',
  track_uri TEXT NOT NULL,
  track_name TEXT NOT NULL,
  track_artist TEXT NOT NULL,
  track_image_url TEXT,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, playing, played, skipped
  is_priority BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  played_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own song requests"
  ON public.song_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own song requests"
  ON public.song_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own song requests"
  ON public.song_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own song requests"
  ON public.song_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for song requests (for overlay updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests;
