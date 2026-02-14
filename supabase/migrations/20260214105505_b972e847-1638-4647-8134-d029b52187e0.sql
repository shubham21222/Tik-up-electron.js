
-- Viewer points table: tracks each viewer's points per creator
CREATE TABLE public.viewer_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  viewer_username text NOT NULL,
  viewer_avatar_url text,
  level integer NOT NULL DEFAULT 1,
  total_points numeric NOT NULL DEFAULT 0,
  points_toward_level numeric NOT NULL DEFAULT 0,
  total_gifts_sent integer NOT NULL DEFAULT 0,
  total_coins_sent numeric NOT NULL DEFAULT 0,
  total_likes integer NOT NULL DEFAULT 0,
  total_messages integer NOT NULL DEFAULT 0,
  first_activity timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(creator_id, viewer_username)
);

-- Enable RLS
ALTER TABLE public.viewer_points ENABLE ROW LEVEL SECURITY;

-- Creator can read their own viewer points
CREATE POLICY "Creators can view own viewer points"
  ON public.viewer_points FOR SELECT
  USING (creator_id = auth.uid());

-- Creator can insert viewer points
CREATE POLICY "Creators can insert viewer points"
  ON public.viewer_points FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Creator can update viewer points
CREATE POLICY "Creators can update viewer points"
  ON public.viewer_points FOR UPDATE
  USING (creator_id = auth.uid());

-- Creator can delete viewer points
CREATE POLICY "Creators can delete viewer points"
  ON public.viewer_points FOR DELETE
  USING (creator_id = auth.uid());

-- Service role / edge functions can also upsert (for webhook processing)
-- Trigger for updated_at
CREATE TRIGGER update_viewer_points_updated_at
  BEFORE UPDATE ON public.viewer_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_viewer_points_creator ON public.viewer_points(creator_id);
CREATE INDEX idx_viewer_points_total ON public.viewer_points(creator_id, total_points DESC);
