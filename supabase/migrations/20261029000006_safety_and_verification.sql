-- ==============================================================================
-- Migration: 20261029000006_safety_and_verification.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 6: Trust & Safety: User Blocking, Reporting & Verification Requests
-- ==============================================================================

-- 1. Create user_blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_blocker_blocked UNIQUE (blocker_id, blocked_id),
  CONSTRAINT check_different_block_parties CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- 2. Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'harassment',
    'spam',
    'scam',
    'misleading_listing',
    'inappropriate_content',
    'impersonation',
    'other'
  )),
  details TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  moderator_note TEXT NULL,
  reviewed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_report_target_present CHECK (reported_user_id IS NOT NULL OR listing_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('institutional_email', 'manual_review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  private_evidence_path TEXT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_note TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verification_requests(status);

-- 4. Row Level Security Policies
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Blocks: users can only see and manage their own blocks
CREATE POLICY "Users can manage their own blocks"
  ON public.user_blocks
  FOR ALL
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

-- Reports: users can create reports and view only their submitted reports
CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view reports they submitted"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Verification Requests: users can create and view their own requests
CREATE POLICY "Users can create verification requests"
  ON public.verification_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification requests"
  ON public.verification_requests
  FOR SELECT
  USING (auth.uid() = user_id);
