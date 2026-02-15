
-- Create integrations table for webhook configs
CREATE TABLE public.integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'discord',
  name text NOT NULL DEFAULT 'My Webhook',
  webhook_url text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT true,
  notify_go_live boolean NOT NULL DEFAULT true,
  notify_gifts boolean NOT NULL DEFAULT true,
  notify_gift_min_coins integer NOT NULL DEFAULT 0,
  notify_follows boolean NOT NULL DEFAULT false,
  notify_milestones boolean NOT NULL DEFAULT true,
  milestone_config jsonb NOT NULL DEFAULT '{"follower_milestones": [100, 500, 1000, 5000], "diamond_milestones": [1000, 5000, 10000]}'::jsonb,
  embed_color text NOT NULL DEFAULT '00E676',
  last_triggered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own integrations" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
