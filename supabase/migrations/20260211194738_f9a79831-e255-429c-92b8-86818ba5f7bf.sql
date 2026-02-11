
-- Overlay widgets table for all overlay types (Gift Alerts, Chat Box, etc.)
CREATE TABLE public.overlay_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  widget_type TEXT NOT NULL DEFAULT 'gift_alert',
  name TEXT NOT NULL DEFAULT 'New Overlay',
  public_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast public token lookups
CREATE UNIQUE INDEX idx_overlay_widgets_public_token ON public.overlay_widgets(public_token);
CREATE INDEX idx_overlay_widgets_user_type ON public.overlay_widgets(user_id, widget_type);

-- Enable RLS
ALTER TABLE public.overlay_widgets ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own overlays
CREATE POLICY "Users can view own overlays"
  ON public.overlay_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read overlay by token"
  ON public.overlay_widgets FOR SELECT
  USING (true);

CREATE POLICY "Users can create own overlays"
  ON public.overlay_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own overlays"
  ON public.overlay_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own overlays"
  ON public.overlay_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_overlay_widgets_updated_at
  BEFORE UPDATE ON public.overlay_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for overlay widgets
ALTER PUBLICATION supabase_realtime ADD TABLE public.overlay_widgets;
