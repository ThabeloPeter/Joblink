-- Verify Admin Profile Setup
-- Run this to check if your admin profile exists and is configured correctly

-- 1. Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'thabelot@nsfas.org.za'
   OR id = 'fa949c56-9575-45c6-b71b-acd03c45f0d9';

-- 2. Check if profile exists in public.users
SELECT 
  id,
  email,
  role,
  company_id,
  created_at,
  updated_at
FROM public.users
WHERE email = 'thabelot@nsfas.org.za'
   OR id = 'fa949c56-9575-45c6-b71b-acd03c45f0d9';

-- 3. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 4. Check if RLS is enabled on users table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

