-- ==============================================================================
-- Migration: 20261029000007_admin_and_settings.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 7: Admin Privileges, Moderation Functions & User Settings
-- ==============================================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  request_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  message_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  exchange_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);

-- 4. Admin check helper function (SECURITY DEFINER with fixed search_path)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 5. Privileged Admin Moderation Procedures
CREATE OR REPLACE FUNCTION public.admin_moderate_report(
  p_report_id UUID,
  p_status TEXT,
  p_note TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrative privileges required';
  END IF;

  UPDATE public.reports
  SET
    status = p_status,
    moderator_note = p_note,
    reviewed_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_report_id;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'moderate_report',
    'report',
    p_report_id::text,
    jsonb_build_object('new_status', p_status, 'note', p_note)
  );

  RETURN jsonb_build_object('success', true, 'report_id', p_report_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_verification(
  p_request_id UUID,
  p_status TEXT,
  p_note TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrative privileges required';
  END IF;

  SELECT * INTO v_req FROM public.verification_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification request not found';
  END IF;

  UPDATE public.verification_requests
  SET
    status = p_status,
    reviewer_note = p_note,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_request_id;

  -- If approved, update profile verification_status
  IF p_status = 'approved' THEN
    UPDATE public.profiles
    SET verification_status = 'verified', updated_at = NOW()
    WHERE id = v_req.user_id;
  ELSIF p_status = 'rejected' THEN
    UPDATE public.profiles
    SET verification_status = 'rejected', updated_at = NOW()
    WHERE id = v_req.user_id;
  END IF;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'review_verification',
    'verification_request',
    p_request_id::text,
    jsonb_build_object('user_id', v_req.user_id, 'new_status', p_status, 'note', p_note)
  );

  RETURN jsonb_build_object('success', true, 'request_id', p_request_id);
END;
$$;

-- 6. Row Level Security Policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users read access"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_current_user_admin());

CREATE POLICY "Users can manage their own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports
  FOR SELECT
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can update reports"
  ON public.reports
  FOR UPDATE
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all verification requests"
  ON public.verification_requests
  FOR SELECT
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can update verification requests"
  ON public.verification_requests
  FOR UPDATE
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (public.is_current_user_admin());
