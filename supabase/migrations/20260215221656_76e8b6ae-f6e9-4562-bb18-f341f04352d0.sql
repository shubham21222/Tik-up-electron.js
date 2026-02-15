
-- Game action triggers for GTA/FiveM integration
CREATE TABLE public.game_triggers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'New Trigger',
  event_type text NOT NULL DEFAULT 'gift',
  event_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  game_action text NOT NULL DEFAULT 'spawn_vehicle',
  action_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  cooldown integer NOT NULL DEFAULT 10,
  is_enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_triggers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own game triggers"
  ON public.game_triggers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game triggers"
  ON public.game_triggers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game triggers"
  ON public.game_triggers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game triggers"
  ON public.game_triggers FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_game_triggers_updated_at
  BEFORE UPDATE ON public.game_triggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
