-- ==============================================================================
-- Migration: 20261029000003_listings.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 3: Listings Schema, Constraints & Row Level Security
-- ==============================================================================

-- 1. Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_skill_id UUID NOT NULL REFERENCES public.user_skills(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  session_format TEXT NOT NULL DEFAULT 'online' CHECK (session_format IN ('online', 'in_person', 'hybrid')),
  location TEXT NULL,
  duration_minutes INTEGER NULL CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for efficient lookup and filtering
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_user_skill_id ON public.listings(user_skill_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_format ON public.listings(session_format);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 3. Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Constraint verification trigger:
-- Ensures owner_id matches user_skills.user_id to prevent forging skill ownership.
CREATE OR REPLACE FUNCTION public.verify_listing_skill_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill_owner UUID;
BEGIN
  SELECT user_id INTO v_skill_owner
  FROM public.user_skills
  WHERE id = NEW.user_skill_id;

  IF v_skill_owner IS NULL THEN
    RAISE EXCEPTION 'Referenced user skill does not exist';
  END IF;

  IF v_skill_owner <> NEW.owner_id THEN
    RAISE EXCEPTION 'Listing owner must own the referenced skill';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_listing_skill_ownership ON public.listings;
CREATE TRIGGER trg_verify_listing_skill_ownership
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.verify_listing_skill_ownership();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. Explicit RLS Policies for Listings

-- Policy A: Listing owners can view all of their own listings (including drafts, paused, closed)
CREATE POLICY "Owners can view all their listings"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy B: Anyone (authenticated & anonymous) can view published listings from discoverable public profiles
CREATE POLICY "Anyone can view published listings from public profiles"
  ON public.listings
  FOR SELECT
  TO authenticated, anon
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = listings.owner_id
        AND p.profile_visibility = 'public'
    )
  );

-- Policy C: Users can create listings only for themselves and their own skills
CREATE POLICY "Users can create own listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.user_skills us
      WHERE us.id = user_skill_id
        AND us.user_id = auth.uid()
    )
  );

-- Policy D: Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy E: Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
