
-- TikTok Gifts catalog table (admin-managed)
CREATE TABLE public.tiktok_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id text NOT NULL UNIQUE,
  name text NOT NULL,
  coin_value integer NOT NULL DEFAULT 1,
  image_url text,
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tiktok_gifts ENABLE ROW LEVEL SECURITY;

-- Anyone can read the gift catalog
CREATE POLICY "Anyone can read gifts" ON public.tiktok_gifts
  FOR SELECT USING (true);

-- Only admins can manage gifts
CREATE POLICY "Admins can insert gifts" ON public.tiktok_gifts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gifts" ON public.tiktok_gifts
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gifts" ON public.tiktok_gifts
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_tiktok_gifts_coin_value ON public.tiktok_gifts(coin_value);
CREATE INDEX idx_tiktok_gifts_name ON public.tiktok_gifts(name);

-- User gift triggers: per-user alert config for specific gifts
CREATE TABLE public.user_gift_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gift_id text NOT NULL REFERENCES public.tiktok_gifts(gift_id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  alert_sound_url text,
  animation_effect text NOT NULL DEFAULT 'bounce',
  priority integer NOT NULL DEFAULT 0,
  combo_threshold integer DEFAULT null,
  min_value_threshold integer DEFAULT null,
  custom_config jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, gift_id)
);

ALTER TABLE public.user_gift_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own triggers" ON public.user_gift_triggers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triggers" ON public.user_gift_triggers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triggers" ON public.user_gift_triggers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own triggers" ON public.user_gift_triggers
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_tiktok_gifts_updated_at
  BEFORE UPDATE ON public.tiktok_gifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_gift_triggers_updated_at
  BEFORE UPDATE ON public.user_gift_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
