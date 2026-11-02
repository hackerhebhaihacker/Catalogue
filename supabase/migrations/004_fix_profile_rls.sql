-- ─────────────────────────────────────────────────────────────────────────────
--  RUN THIS in Supabase → SQL Editor → New Query
--  Fixes: "Profile not found" — simplifies RLS to avoid recursion
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop ALL existing profile policies (no recursion risk)
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END; $$;

-- Simple, non-recursive policies
-- 1. Service role can do everything (used by API routes)
CREATE POLICY "service_role_full_access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 2. Each user can read and update only their own row
CREATE POLICY "users_own_profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Backfill any auth users missing a profile row ─────────────────────────────
INSERT INTO public.profiles (id, full_name, email, mobile_number, role, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) AS full_name,
  u.email,
  NULL,
  'user',
  u.created_at,
  now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT id, full_name, email, role FROM public.profiles ORDER BY created_at;
