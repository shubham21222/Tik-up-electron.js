
-- Sound alerts table: maps gifts/events to sound URLs
CREATE TABLE public.sound_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL DEFAULT 'gift', -- gift, follow, share, like, any_gift
  gift_id TEXT, -- null for non-gift triggers
  sound_url TEXT NOT NULL DEFAULT '',
  sound_name TEXT NOT NULL DEFAULT '',
  volume INTEGER NOT NULL DEFAULT 80,
  cooldown INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sound_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sound alerts" ON public.sound_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sound alerts" ON public.sound_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sound alerts" ON public.sound_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sound alerts" ON public.sound_alerts FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_sound_alerts_updated_at
  BEFORE UPDATE ON public.sound_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
