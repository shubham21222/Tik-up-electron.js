
-- Add TikTok connection fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tiktok_username text,
ADD COLUMN IF NOT EXISTS tiktok_connected boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS tiktok_connected_at timestamp with time zone;

-- Create a table for points system configuration
CREATE TABLE public.points_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  currency_name text NOT NULL DEFAULT 'Points',
  points_per_coin numeric NOT NULL DEFAULT 1,
  points_per_coin_enabled boolean NOT NULL DEFAULT true,
  points_per_share numeric NOT NULL DEFAULT 3,
  points_per_share_enabled boolean NOT NULL DEFAULT false,
  points_per_chat_minute numeric NOT NULL DEFAULT 0.5,
  points_per_chat_minute_enabled boolean NOT NULL DEFAULT false,
  subscriber_bonus_ratio numeric NOT NULL DEFAULT 0,
  level_base_points integer NOT NULL DEFAULT 100,
  level_multiplier numeric NOT NULL DEFAULT 1.5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.points_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points config" ON public.points_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points config" ON public.points_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points config" ON public.points_config FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_points_config_updated_at BEFORE UPDATE ON public.points_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
