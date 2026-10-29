-- ==============================================================================
-- Migration: 20261029000002_user_skills.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 2: User Skills Table, Onboarding Atomic Function & Security Policies
-- ==============================================================================

-- 1. Create user_skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
  direction TEXT NOT NULL CHECK (direction IN ('offer', 'want')),
  proficiency TEXT NULL CHECK (
    proficiency IS NULL OR proficiency IN (
      'beginner',
      'intermediate',
      'advanced',
      'expert'
    )
  ),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A person may both offer and want the same skill, but cannot add the same skill twice under the same direction
  CONSTRAINT uq_user_skill_direction UNIQUE (user_id, skill_id, direction)
);

-- 2. Create indexes for user_id, skill_id, and direction
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_direction ON public.user_skills(direction);
CREATE INDEX IF NOT EXISTS idx_user_skills_lookup ON public.user_skills(skill_id, direction);

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS trg_user_skills_updated_at ON public.user_skills;
CREATE TRIGGER trg_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_skills

-- Policy A: Users can view their own skill relationships
CREATE POLICY "Users can view own skills"
  ON public.user_skills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy B: Authenticated & public users can view skills of discoverable public profiles
CREATE POLICY "Anyone can view skills of public profiles"
  ON public.user_skills
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_skills.user_id
        AND p.profile_visibility = 'public'
    )
  );

-- Policy C: Users can insert their own skill relationships
CREATE POLICY "Users can insert own skills"
  ON public.user_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy D: Users can update their own skill relationships
CREATE POLICY "Users can update own skills"
  ON public.user_skills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy E: Users can delete their own skill relationships
CREATE POLICY "Users can delete own skills"
  ON public.user_skills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Atomic Onboarding Completion Function
-- Validates inputs, saves profile attributes, verifies skills exist and are active,
-- inserts user_skills, and sets onboarding_completed to TRUE in a single transaction.
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  p_display_name TEXT,
  p_username TEXT,
  p_account_type TEXT,
  p_bio TEXT,
  p_institution TEXT,
  p_department TEXT,
  p_location TEXT,
  p_timezone TEXT,
  p_availability TEXT,
  p_offered_skills JSONB, -- Array of { skill_id: UUID, proficiency: TEXT, notes: TEXT }
  p_wanted_skills JSONB   -- Array of { skill_id: UUID, notes: TEXT }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_username_id UUID;
  v_item JSONB;
  v_skill_id UUID;
  v_proficiency TEXT;
  v_notes TEXT;
  v_active_count INT;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  -- Validate Account Type
  IF p_account_type NOT IN ('student', 'teacher', 'professional', 'community') THEN
    RAISE EXCEPTION 'Invalid account type: %', p_account_type;
  END IF;

  -- Validate Username uniqueness (except current user)
  SELECT id INTO v_existing_username_id
  FROM public.profiles
  WHERE username = LOWER(p_username) AND id <> v_user_id;

  IF v_existing_username_id IS NOT NULL THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- Validate at least one offered and one wanted skill
  IF jsonb_array_length(p_offered_skills) < 1 THEN
    RAISE EXCEPTION 'At least one offered skill is required';
  END IF;

  IF jsonb_array_length(p_wanted_skills) < 1 THEN
    RAISE EXCEPTION 'At least one wanted skill is required';
  END IF;

  -- 1. Update Profile (protecting verification_status and administrative attributes)
  UPDATE public.profiles
  SET
    display_name = TRIM(p_display_name),
    username = LOWER(TRIM(p_username)),
    account_type = p_account_type,
    bio = NULLIF(TRIM(p_bio), ''),
    institution = NULLIF(TRIM(p_institution), ''),
    department = NULLIF(TRIM(p_department), ''),
    location = NULLIF(TRIM(p_location), ''),
    timezone = NULLIF(TRIM(p_timezone), ''),
    availability = NULLIF(TRIM(p_availability), ''),
    onboarding_completed = TRUE,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 2. Clear previous draft user skills if any exist
  DELETE FROM public.user_skills WHERE user_id = v_user_id;

  -- 3. Insert Offered Skills
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_offered_skills)
  LOOP
    v_skill_id := (v_item->>'skill_id')::UUID;
    v_proficiency := NULLIF(v_item->>'proficiency', '');
    v_notes := NULLIF(v_item->>'notes', '');

    -- Verify skill is active in catalog
    SELECT COUNT(*) INTO v_active_count FROM public.skills WHERE id = v_skill_id AND is_active = TRUE;
    IF v_active_count = 0 THEN
      RAISE EXCEPTION 'Skill % is not active or does not exist', v_skill_id;
    END IF;

    INSERT INTO public.user_skills (user_id, skill_id, direction, proficiency, notes)
    VALUES (v_user_id, v_skill_id, 'offer', v_proficiency, v_notes)
    ON CONFLICT (user_id, skill_id, direction) DO UPDATE
      SET proficiency = EXCLUDED.proficiency, notes = EXCLUDED.notes;
  END LOOP;

  -- 4. Insert Wanted Skills
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_wanted_skills)
  LOOP
    v_skill_id := (v_item->>'skill_id')::UUID;
    v_notes := NULLIF(v_item->>'notes', '');

    SELECT COUNT(*) INTO v_active_count FROM public.skills WHERE id = v_skill_id AND is_active = TRUE;
    IF v_active_count = 0 THEN
      RAISE EXCEPTION 'Skill % is not active or does not exist', v_skill_id;
    END IF;

    INSERT INTO public.user_skills (user_id, skill_id, direction, proficiency, notes)
    VALUES (v_user_id, v_skill_id, 'want', NULL, v_notes)
    ON CONFLICT (user_id, skill_id, direction) DO UPDATE
      SET notes = EXCLUDED.notes;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;

-- Restrict execution permission to authenticated users
REVOKE EXECUTE ON FUNCTION public.complete_user_onboarding FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_user_onboarding TO authenticated;
