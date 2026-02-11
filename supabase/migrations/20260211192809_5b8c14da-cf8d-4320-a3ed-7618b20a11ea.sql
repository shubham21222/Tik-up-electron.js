
-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Goals table for storing user-created goal overlays
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  screen_id UUID REFERENCES public.screens(id) ON DELETE SET NULL,
  public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  goal_type TEXT NOT NULL DEFAULT 'likes',
  title TEXT NOT NULL DEFAULT 'My Goal',
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  style_preset TEXT NOT NULL DEFAULT 'glass',
  on_complete_action TEXT DEFAULT 'none',
  auto_reset BOOLEAN NOT NULL DEFAULT false,
  milestone_alerts BOOLEAN NOT NULL DEFAULT true,
  custom_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_goals_public_token ON public.goals(public_token);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read goals by token" ON public.goals FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
