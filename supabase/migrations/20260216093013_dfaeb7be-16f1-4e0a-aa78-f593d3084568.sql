
-- ============================================================
-- 1) Security Audit Log table for tracking security events
-- ============================================================
CREATE TABLE public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.security_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role inserts (from edge functions) bypass RLS
-- Regular users cannot insert directly
CREATE POLICY "Admins can insert audit logs"
  ON public.security_audit_log FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for efficient querying
CREATE INDEX idx_security_audit_log_user ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_action ON public.security_audit_log(action);
CREATE INDEX idx_security_audit_log_created ON public.security_audit_log(created_at DESC);

-- ============================================================
-- 2) Add unique partial index on tiktok_username (non-null only)
--    This prevents two accounts from linking the same username
-- ============================================================
CREATE UNIQUE INDEX idx_profiles_tiktok_username_unique 
  ON public.profiles (lower(tiktok_username)) 
  WHERE tiktok_username IS NOT NULL AND tiktok_connected = true;

-- ============================================================
-- 3) Add username_locked_at to profiles for lock tracking
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_locked_at timestamptz;
