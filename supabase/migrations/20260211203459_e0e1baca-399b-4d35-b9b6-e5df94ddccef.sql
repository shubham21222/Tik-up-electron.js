
-- Add new TTS settings columns
ALTER TABLE public.tts_settings
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en-GB',
  ADD COLUMN IF NOT EXISTS random_voice boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pitch integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS allowed_users jsonb NOT NULL DEFAULT '{"all_users": false, "followers": false, "subscribers": true, "moderators": true, "team_members": false, "top_gifters": true, "top_gifters_count": 3, "allowed_list": []}'::jsonb,
  ADD COLUMN IF NOT EXISTS comment_type text NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS comment_command text NOT NULL DEFAULT '!command',
  ADD COLUMN IF NOT EXISTS charge_points boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cost_per_message integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_queue_length integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS filter_letter_spam boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS filter_mentions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS filter_commands boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS message_template text NOT NULL DEFAULT '{comment}',
  ADD COLUMN IF NOT EXISTS special_users jsonb NOT NULL DEFAULT '[]'::jsonb;
