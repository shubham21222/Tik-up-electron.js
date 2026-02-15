
-- ── Points History / Audit Table ────────────────────────────────────────────
-- Tracks every point delta so creators can see exactly how and why users earned points.
CREATE TABLE public.points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  viewer_username text NOT NULL,
  event_type text NOT NULL,              -- 'gift', 'chat', 'like', 'follow', 'share', 'reset', 'manual'
  points_delta numeric NOT NULL DEFAULT 0,
  points_after numeric NOT NULL DEFAULT 0,
  event_detail jsonb DEFAULT '{}'::jsonb, -- e.g. { "gift_name": "Rose", "coins": 5 }
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-creator per-viewer queries
CREATE INDEX idx_points_history_creator ON public.points_history (creator_id, viewer_username, created_at DESC);

-- Enable RLS
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Creators can view their own history
CREATE POLICY "Creators can view own points history"
  ON public.points_history FOR SELECT
  USING (creator_id = auth.uid());

-- Creators can insert history entries (via webhook or manual)
CREATE POLICY "Creators can insert own points history"
  ON public.points_history FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Service role inserts from webhook (no user context)
-- The webhook uses service_role_key which bypasses RLS, so no extra policy needed.

-- Add follow points weight to existing points_config table
ALTER TABLE public.points_config
  ADD COLUMN IF NOT EXISTS points_per_follow numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS points_per_follow_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS points_per_like numeric NOT NULL DEFAULT 0.1,
  ADD COLUMN IF NOT EXISTS points_per_like_enabled boolean NOT NULL DEFAULT true;
