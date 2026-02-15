
-- Agency plans enum
CREATE TYPE public.agency_plan AS ENUM ('starter', 'pro', 'enterprise');

-- Agency member roles enum
CREATE TYPE public.agency_role AS ENUM ('owner', 'admin', 'designer');

-- Agencies table
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan agency_plan NOT NULL DEFAULT 'starter',
  brand_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_domain text,
  stripe_customer_id text,
  max_clients integer NOT NULL DEFAULT 5,
  max_overlays integer NOT NULL DEFAULT 10,
  max_ws_connections integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Agency members table
CREATE TABLE public.agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role agency_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Security definer: check if user is member of agency
CREATE OR REPLACE FUNCTION public.is_agency_member(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE user_id = _user_id AND agency_id = _agency_id
  )
$$;

-- Security definer: check if user has specific agency role
CREATE OR REPLACE FUNCTION public.has_agency_role(_user_id uuid, _agency_id uuid, _role agency_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE user_id = _user_id AND agency_id = _agency_id AND role = _role
  )
$$;

-- Agencies RLS policies
CREATE POLICY "Members can view their agencies"
ON public.agencies FOR SELECT
USING (public.is_agency_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create agencies"
ON public.agencies FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their agencies"
ON public.agencies FOR UPDATE
USING (public.has_agency_role(auth.uid(), id, 'owner'));

CREATE POLICY "Owners can delete their agencies"
ON public.agencies FOR DELETE
USING (public.has_agency_role(auth.uid(), id, 'owner'));

-- Super admins can see all agencies
CREATE POLICY "Super admins can view all agencies"
ON public.agencies FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Agency members RLS policies
CREATE POLICY "Members can view agency members"
ON public.agency_members FOR SELECT
USING (public.is_agency_member(auth.uid(), agency_id));

CREATE POLICY "Owners/admins can add members"
ON public.agency_members FOR INSERT
WITH CHECK (
  public.has_agency_role(auth.uid(), agency_id, 'owner')
  OR public.has_agency_role(auth.uid(), agency_id, 'admin')
  OR auth.uid() = user_id -- allow self-insert when creating agency
);

CREATE POLICY "Owners can update members"
ON public.agency_members FOR UPDATE
USING (public.has_agency_role(auth.uid(), agency_id, 'owner'));

CREATE POLICY "Owners can remove members"
ON public.agency_members FOR DELETE
USING (public.has_agency_role(auth.uid(), agency_id, 'owner'));

-- Super admins can manage all members
CREATE POLICY "Super admins can view all members"
ON public.agency_members FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_agencies_updated_at
BEFORE UPDATE ON public.agencies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
