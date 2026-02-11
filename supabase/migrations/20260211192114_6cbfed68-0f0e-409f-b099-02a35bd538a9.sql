
-- =============================================
-- TIKUP DATABASE SCHEMA
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. SCREENS TABLE
CREATE TABLE public.screens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Screen',
  public_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  overlay_config JSONB DEFAULT '{}',
  queue_limit INT NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'offline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- 3. AUTOMATIONS TABLE
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES public.screens(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'New Automation',
  trigger_type TEXT NOT NULL DEFAULT 'gift',
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 0,
  cooldown INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- 4. ACTIONS TABLE
CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL DEFAULT 'play_sound',
  action_config JSONB DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- 5. EVENTS LOG TABLE
CREATE TABLE public.events_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES public.screens(id) ON DELETE SET NULL,
  triggered_automation_id UUID REFERENCES public.automations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.owns_automation(_automation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.automations
    WHERE id = _automation_id AND user_id = auth.uid()
  )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- SCREENS
CREATE POLICY "Users can view own screens" ON public.screens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can view screen by public_token" ON public.screens FOR SELECT USING (true);
CREATE POLICY "Users can insert own screens" ON public.screens FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own screens" ON public.screens FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own screens" ON public.screens FOR DELETE USING (user_id = auth.uid());

-- AUTOMATIONS
CREATE POLICY "Users can view own automations" ON public.automations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own automations" ON public.automations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own automations" ON public.automations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own automations" ON public.automations FOR DELETE USING (user_id = auth.uid());

-- ACTIONS (via automation ownership)
CREATE POLICY "Users can view own actions" ON public.actions FOR SELECT USING (public.owns_automation(automation_id));
CREATE POLICY "Users can insert own actions" ON public.actions FOR INSERT WITH CHECK (public.owns_automation(automation_id));
CREATE POLICY "Users can update own actions" ON public.actions FOR UPDATE USING (public.owns_automation(automation_id));
CREATE POLICY "Users can delete own actions" ON public.actions FOR DELETE USING (public.owns_automation(automation_id));

-- EVENTS LOG
CREATE POLICY "Users can view own events" ON public.events_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own events" ON public.events_log FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_screens_updated_at BEFORE UPDATE ON public.screens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for screens and events_log
ALTER PUBLICATION supabase_realtime ADD TABLE public.screens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events_log;
