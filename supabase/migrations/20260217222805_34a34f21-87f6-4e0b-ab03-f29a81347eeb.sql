
-- Feature flags table for admin-togglable feature visibility
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  label text NOT NULL,
  section text NOT NULL DEFAULT 'general',
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read flags (needed for sidebar rendering)
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Only admins can update flags
CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert flags
CREATE POLICY "Admins can insert feature flags"
  ON public.feature_flags FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete flags
CREATE POLICY "Admins can delete feature flags"
  ON public.feature_flags FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed all sidebar modules
INSERT INTO public.feature_flags (feature_key, label, section) VALUES
  ('/actions', 'Gift Alerts', 'Live Studio'),
  ('/chat-overlay', 'Chat Overlay', 'Live Studio'),
  ('/viewer-count', 'Viewer Count', 'Live Studio'),
  ('/like-counter', 'Like & Follower Counter', 'Live Studio'),
  ('/stream-timer', 'Stream Timer', 'Live Studio'),
  ('/tts', 'Text-to-Speech', 'Engagement'),
  ('/sound-alerts', 'Sound Alerts', 'Engagement'),
  ('/overlays', 'Overlays', 'Engagement'),
  ('/recent-activity', 'Event Feed', 'Engagement'),
  ('/sounds', 'Spotify Integration', 'Engagement'),
  ('/backgrounds', 'Backgrounds', 'Engagement'),
  ('/goal-overlays', 'Stream Goals', 'Growth'),
  ('/leaderboard', 'Top Supporters', 'Growth'),
  ('/points', 'User Levels & Points', 'Growth'),
  ('/chat-commands', 'Chat Commands', 'Creator Tools'),
  ('/auto-moderation', 'Chat Protection', 'Creator Tools'),
  ('/keystroke-triggers', 'Keystroke Triggers', 'Creator Tools'),
  ('/gta-triggers', 'GTA Interactive', 'Creator Tools'),
  ('/gift-browser', 'Gift Browser', 'Creator Tools'),
  ('/enterprise', 'Command Center', 'Enterprise'),
  ('/agencies', 'Agency Hub', 'Enterprise'),
  ('/setup', 'Account', 'Settings'),
  ('/integrations', 'Integrations', 'Settings'),
  ('/pro', 'Billing', 'Settings'),
  ('/brand-settings', 'Appearance', 'Settings');

-- Enable realtime for instant admin updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;
