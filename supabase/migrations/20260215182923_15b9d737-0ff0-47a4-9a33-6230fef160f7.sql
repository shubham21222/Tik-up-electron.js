
-- ═══════════════════════════════════════════════════════════════
-- Session-scoped diamond tracking for TikTok LIVE streams
-- ═══════════════════════════════════════════════════════════════

-- Track each live stream session
CREATE TABLE public.live_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  total_diamonds bigint NOT NULL DEFAULT 0,
  total_gifts integer NOT NULL DEFAULT 0,
  unique_gifters integer NOT NULL DEFAULT 0,
  room_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Per-user gift totals within a session
CREATE TABLE public.session_gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sender_username text NOT NULL,
  sender_avatar_url text,
  gift_name text NOT NULL,
  gift_id text,
  diamond_value integer NOT NULL DEFAULT 0,
  repeat_count integer NOT NULL DEFAULT 1,
  total_diamonds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Aggregated per-user totals within a session (materialized for fast queries)
CREATE TABLE public.session_user_totals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sender_username text NOT NULL,
  sender_avatar_url text,
  total_diamonds bigint NOT NULL DEFAULT 0,
  total_gifts integer NOT NULL DEFAULT 0,
  last_gift_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, sender_username)
);

-- Indexes for fast lookups
CREATE INDEX idx_live_sessions_user_active ON public.live_sessions(user_id, is_active);
CREATE INDEX idx_session_gifts_session ON public.session_gifts(session_id);
CREATE INDEX idx_session_gifts_sender ON public.session_gifts(session_id, sender_username);
CREATE INDEX idx_session_user_totals_session ON public.session_user_totals(session_id);
CREATE INDEX idx_session_user_totals_diamonds ON public.session_user_totals(session_id, total_diamonds DESC);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_user_totals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: live_sessions
CREATE POLICY "Users can view own sessions" ON public.live_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own sessions" ON public.live_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own sessions" ON public.live_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own sessions" ON public.live_sessions FOR DELETE USING (user_id = auth.uid());

-- RLS Policies: session_gifts
CREATE POLICY "Users can view own session gifts" ON public.session_gifts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own session gifts" ON public.session_gifts FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies: session_user_totals
CREATE POLICY "Users can view own session user totals" ON public.session_user_totals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own session user totals" ON public.session_user_totals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own session user totals" ON public.session_user_totals FOR UPDATE USING (user_id = auth.uid());

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_user_totals;

-- Auto-update timestamps
CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_user_totals_updated_at
  BEFORE UPDATE ON public.session_user_totals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
