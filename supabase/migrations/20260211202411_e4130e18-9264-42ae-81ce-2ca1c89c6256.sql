
-- =============================================
-- TTS Settings table
-- =============================================
CREATE TABLE public.tts_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  voice_provider text NOT NULL DEFAULT 'elevenlabs',
  voice_id text NOT NULL DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  speed numeric NOT NULL DEFAULT 1.0,
  volume integer NOT NULL DEFAULT 80,
  trigger_mode text NOT NULL DEFAULT 'all_chat',
  min_chars integer NOT NULL DEFAULT 3,
  cooldown_seconds integer NOT NULL DEFAULT 5,
  blacklist_words jsonb NOT NULL DEFAULT '[]'::jsonb,
  interrupt_mode boolean NOT NULL DEFAULT false,
  max_length integer NOT NULL DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.tts_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tts settings" ON public.tts_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tts settings" ON public.tts_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tts settings" ON public.tts_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_tts_settings_updated_at
  BEFORE UPDATE ON public.tts_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- Subscriptions table
-- =============================================
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- TTS Queue table (for processing TTS jobs)
-- =============================================
CREATE TABLE public.tts_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  overlay_token text NOT NULL,
  text_content text NOT NULL,
  username text NOT NULL DEFAULT 'Viewer',
  voice_id text NOT NULL DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  status text NOT NULL DEFAULT 'pending',
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.tts_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tts queue" ON public.tts_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tts queue" ON public.tts_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tts queue" ON public.tts_queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime on tts_queue for overlay listeners
ALTER PUBLICATION supabase_realtime ADD TABLE public.tts_queue;
