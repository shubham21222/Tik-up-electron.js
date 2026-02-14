
-- Moderation config per user (rule toggles + global settings)
CREATE TABLE public.moderation_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  block_links boolean NOT NULL DEFAULT true,
  caps_filter boolean NOT NULL DEFAULT true,
  spam_detection boolean NOT NULL DEFAULT true,
  block_banned_words boolean NOT NULL DEFAULT true,
  allow_subscriber_links boolean NOT NULL DEFAULT false,
  slow_mode boolean NOT NULL DEFAULT false,
  slow_mode_seconds integer NOT NULL DEFAULT 5,
  emoji_only_filter boolean NOT NULL DEFAULT false,
  first_message_review boolean NOT NULL DEFAULT false,
  safe_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.moderation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moderation config" ON public.moderation_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own moderation config" ON public.moderation_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own moderation config" ON public.moderation_config FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_moderation_config_updated_at BEFORE UPDATE ON public.moderation_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Banned words with category and severity
CREATE TABLE public.banned_words (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  word text NOT NULL,
  category text NOT NULL DEFAULT 'custom',
  severity text NOT NULL DEFAULT 'block',
  apply_to_chat boolean NOT NULL DEFAULT true,
  apply_to_tts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, word)
);

ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own banned words" ON public.banned_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own banned words" ON public.banned_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own banned words" ON public.banned_words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own banned words" ON public.banned_words FOR DELETE USING (auth.uid() = user_id);

-- Banned users
CREATE TABLE public.banned_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  username text NOT NULL,
  reason text,
  block_chat boolean NOT NULL DEFAULT true,
  block_tts boolean NOT NULL DEFAULT true,
  block_alerts boolean NOT NULL DEFAULT true,
  auto_timeout boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, username)
);

ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own banned users" ON public.banned_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own banned users" ON public.banned_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own banned users" ON public.banned_users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own banned users" ON public.banned_users FOR DELETE USING (auth.uid() = user_id);

-- Moderation log for tracking hits
CREATE TABLE public.moderation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT 'unknown',
  original_message text NOT NULL,
  triggered_word text,
  action_taken text NOT NULL DEFAULT 'blocked',
  filter_type text NOT NULL DEFAULT 'word',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moderation log" ON public.moderation_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own moderation log" ON public.moderation_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for moderation log
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_log;
