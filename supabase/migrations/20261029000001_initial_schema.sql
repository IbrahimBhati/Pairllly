-- ==============================================================================
-- Migration: 20261029000001_initial_schema.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 1: Database Foundation & Security Policies
-- ==============================================================================

-- 1. Create Enums / Check Constraints
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  bio TEXT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('student', 'teacher', 'professional', 'community')),
  institution TEXT NULL,
  department TEXT NULL,
  location TEXT NULL,
  timezone TEXT NULL,
  availability TEXT NULL,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles(profile_visibility);

-- 3. Create skills catalog table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_is_active ON public.skills(is_active);

-- 4. Seed legitimate initial catalog entries
INSERT INTO public.skills (name, slug, category, description)
VALUES
  ('Programming', 'programming', 'Technology', 'Web development, mobile apps, algorithms, software engineering, and clean code.'),
  ('Graphic Design', 'graphic-design', 'Creative & Design', 'Visual identity, logo design, illustration, layout, and brand assets.'),
  ('Photography', 'photography', 'Creative & Design', 'Camera composition, lighting, photo editing, and portrait or landscape capture.'),
  ('Video Editing', 'video-editing', 'Creative & Design', 'Post-production, pacing, color grading, sound design, and motion cuts.'),
  ('Writing', 'writing', 'Communication', 'Essay composition, storytelling, copywriting, academic papers, and technical docs.'),
  ('English', 'english', 'Languages', 'Grammar, conversational fluency, pronunciation, and academic literature.'),
  ('Mathematics', 'mathematics', 'Academics', 'Calculus, linear algebra, discrete math, statistics, and applied problem solving.'),
  ('Public Speaking', 'public-speaking', 'Communication', 'Stage presence, speech crafting, presentation delivery, and debate technique.'),
  ('UI/UX Design', 'ui-ux-design', 'Creative & Design', 'User research, wireframing, Figma prototyping, and design system building.'),
  ('Digital Marketing', 'digital-marketing', 'Business', 'SEO, social media growth, email campaigns, and analytics tracking.'),
  ('Excel', 'excel', 'Business', 'Data cleaning, advanced formulas, pivot tables, lookup models, and dashboards.'),
  ('Research', 'research', 'Academics', 'Literature review, empirical methodology, qualitative analysis, and citations.'),
  ('Tutoring', 'tutoring', 'Academics', 'Study planning, peer mentoring, concept mastery, and exam preparation.'),
  ('Career Guidance', 'career-guidance', 'Professional', 'Resume review, interview practice, portfolio curation, and networking strategies.'),
  ('Content Creation', 'content-creation', 'Media', 'Short-form video, scriptwriting, community building, and creative storytelling.')
ON CONFLICT (name) DO NOTHING;

-- 5. Updated_at automatic timestamp triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Secure new auth user profile creation trigger
-- Enforces that new accounts cannot assign themselves verified status or admin roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
  display_val TEXT;
BEGIN
  -- Extract initial username or sanitize from raw_user_meta_data / email
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  ));
  
  -- Sanitize username characters (alphanumeric and underscores only)
  clean_username := REGEXP_REPLACE(base_username, '[^a-z0-9_]', '', 'g');
  IF LENGTH(clean_username) < 3 THEN
    clean_username := 'user_' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;

  display_val := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    INITCAP(SPLIT_PART(NEW.email, '@', 1))
  );

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    account_type,
    profile_visibility,
    onboarding_completed,
    verification_status
  ) VALUES (
    NEW.id,
    clean_username,
    display_val,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'student'),
    'public',
    FALSE,
    'unverified' -- Strict default, impossible to bypass
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 8. Explicit RLS Policies for Profiles

-- Policy A: Users can read their own profile (regardless of visibility)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy B: Authenticated users can view discoverable public profiles
CREATE POLICY "Users can view public profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (profile_visibility = 'public');

-- Policy C: Public / anonymous visitors can view discoverable public profiles
CREATE POLICY "Public visitors can view public profiles"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (profile_visibility = 'public');

-- Policy D: Users can update their own profile, but CANNOT self-escalate verification_status
CREATE POLICY "Users can update own profile fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Ensure user cannot alter verification_status away from its current value
    AND verification_status = (SELECT p.verification_status FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 9. Explicit RLS Policies for Skills Catalog

-- Policy E: Active skills are readable by anyone
CREATE POLICY "Active skills are readable by all"
  ON public.skills
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Modification (INSERT, UPDATE, DELETE) restricted: no public policies are added.
-- Only database migrations, service_role, or authorized admin routines can modify skills.
