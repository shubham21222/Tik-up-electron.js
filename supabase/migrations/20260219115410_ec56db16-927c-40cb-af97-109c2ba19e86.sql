
-- Create tts_usage_monthly table for cost-based TTS capping
CREATE TABLE public.tts_usage_monthly (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month_key text NOT NULL,
  total_characters integer NOT NULL DEFAULT 0,
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint for one row per user per month
ALTER TABLE public.tts_usage_monthly
  ADD CONSTRAINT tts_usage_monthly_user_month_unique UNIQUE (user_id, month_key);

-- Enable RLS
ALTER TABLE public.tts_usage_monthly ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view own tts usage"
  ON public.tts_usage_monthly FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own tts usage"
  ON public.tts_usage_monthly FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own tts usage"
  ON public.tts_usage_monthly FOR UPDATE
  USING (auth.uid() = user_id);
