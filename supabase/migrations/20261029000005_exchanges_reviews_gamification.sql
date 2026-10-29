-- ==============================================================================
-- Migration: 20261029000005_exchanges_reviews_gamification.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 6: Exchanges, Dual Confirmation, Reviews, Points & Badges
-- ==============================================================================

-- 1. Create exchanges table
CREATE TABLE IF NOT EXISTS public.exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_request_id UUID UNIQUE NOT NULL REFERENCES public.connection_requests(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  requester_confirmed_at TIMESTAMPTZ NULL,
  recipient_confirmed_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchanges_req_id ON public.exchanges(connection_request_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON public.exchanges(status);

DROP TRIGGER IF EXISTS trg_exchanges_updated_at ON public.exchanges;
CREATE TRIGGER trg_exchanges_updated_at
  BEFORE UPDATE ON public.exchanges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES public.exchanges(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_different_review_parties CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT uq_exchange_reviewer UNIQUE (exchange_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_exchange ON public.reviews(exchange_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);

-- 3. Create badges table & user_badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE RESTRICT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- 4. Create points_ledger table
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_event UNIQUE (user_id, event_key)
);

CREATE INDEX IF NOT EXISTS idx_points_user ON public.points_ledger(user_id);

-- Seed Initial Badges
INSERT INTO public.badges (slug, name, description, icon_name, criteria_type, criteria_value)
VALUES
  ('first_exchange', 'First Exchange', 'Completed your very first reciprocal skill exchange', 'Award', 'exchange_count', 1),
  ('helpful_member', 'Helpful Member', 'Completed 3 successful skill exchanges on campus', 'HeartHandshake', 'exchange_count', 3),
  ('knowledge_sharer', 'Knowledge Sharer', 'Shared knowledge in 5 distinct completed sessions', 'BookOpen', 'exchange_count', 5),
  ('consistent_collaborator', 'Consistent Collaborator', 'Earned stellar reviews with an average rating of 4.8+', 'Star', 'rating_average', 48),
  ('community_builder', 'Community Builder', 'Completed 10 collaborative skill sessions on campus', 'Users', 'exchange_count', 10)
ON CONFLICT (slug) DO NOTHING;

-- 5. Atomic RPC: Confirm Exchange Completion
CREATE OR REPLACE FUNCTION public.confirm_exchange_completion(p_exchange_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exch RECORD;
  v_req RECORD;
  v_is_requester BOOLEAN;
  v_is_recipient BOOLEAN;
  v_both_confirmed BOOLEAN := FALSE;
  v_badge_first_id UUID;
BEGIN
  -- Fetch exchange with row lock
  SELECT * INTO v_exch
  FROM public.exchanges
  WHERE id = p_exchange_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exchange not found';
  END IF;

  IF v_exch.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'status', 'completed', 'already_completed', true);
  END IF;

  -- Fetch connection request
  SELECT * INTO v_req
  FROM public.connection_requests
  WHERE id = v_exch.connection_request_id;

  v_is_requester := (auth.uid() = v_req.requester_id);
  v_is_recipient := (auth.uid() = v_req.recipient_id);

  IF NOT (v_is_requester OR v_is_recipient) THEN
    RAISE EXCEPTION 'Only exchange participants may confirm completion';
  END IF;

  -- Mark participant confirmation
  IF v_is_requester THEN
    UPDATE public.exchanges
    SET requester_confirmed_at = COALESCE(requester_confirmed_at, NOW()), updated_at = NOW()
    WHERE id = p_exchange_id;
  END IF;

  IF v_is_recipient THEN
    UPDATE public.exchanges
    SET recipient_confirmed_at = COALESCE(recipient_confirmed_at, NOW()), updated_at = NOW()
    WHERE id = p_exchange_id;
  END IF;

  -- Re-read exchange state
  SELECT * INTO v_exch
  FROM public.exchanges
  WHERE id = p_exchange_id;

  IF v_exch.requester_confirmed_at IS NOT NULL AND v_exch.recipient_confirmed_at IS NOT NULL THEN
    UPDATE public.exchanges
    SET status = 'completed', completed_at = NOW(), updated_at = NOW()
    WHERE id = p_exchange_id;
    v_both_confirmed := TRUE;

    -- Award completion points (50 pts per participant)
    INSERT INTO public.points_ledger (user_id, event_key, event_type, points, metadata)
    VALUES
      (v_req.requester_id, 'exch_' || p_exchange_id || '_req', 'exchange_completed', 50, jsonb_build_object('exchange_id', p_exchange_id)),
      (v_req.recipient_id, 'exch_' || p_exchange_id || '_rec', 'exchange_completed', 50, jsonb_build_object('exchange_id', p_exchange_id))
    ON CONFLICT (user_id, event_key) DO NOTHING;

    -- Check and award First Exchange badge
    SELECT id INTO v_badge_first_id FROM public.badges WHERE slug = 'first_exchange';
    IF v_badge_first_id IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES
        (v_req.requester_id, v_badge_first_id),
        (v_req.recipient_id, v_badge_first_id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', CASE WHEN v_both_confirmed THEN 'completed' ELSE 'in_progress' END,
    'both_confirmed', v_both_confirmed
  );
END;
$$;

-- 6. Row Level Security Policies
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their exchanges"
  ON public.exchanges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connection_requests r
      WHERE r.id = exchanges.connection_request_id
      AND (r.requester_id = auth.uid() OR r.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Public reviews read policy"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Exchange participants can insert review upon completion"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.exchanges e
      JOIN public.connection_requests r ON r.id = e.connection_request_id
      WHERE e.id = reviews.exchange_id
      AND e.status = 'completed'
      AND ((r.requester_id = auth.uid() AND r.recipient_id = reviews.reviewee_id)
        OR (r.recipient_id = auth.uid() AND r.requester_id = reviews.reviewee_id))
    )
  );

CREATE POLICY "Badges are publicly viewable"
  ON public.badges
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "User badges are publicly viewable"
  ON public.user_badges
  FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own points ledger"
  ON public.points_ledger
  FOR SELECT
  USING (auth.uid() = user_id);
