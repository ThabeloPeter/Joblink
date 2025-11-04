-- Quick check to verify your admin profile exists
-- Run this in Supabase SQL Editor

-- Check if profile exists by ID
SELECT 
  'Profile by ID' as check_type,
  id,
  email,
  role,
  company_id,
  created_at
FROM public.users
WHERE id = 'fa949c56-9575-45c6-b71b-acd03c45f0d9';

-- Check if profile exists by email
SELECT 
  'Profile by Email' as check_type,
  id,
  email,
  role,
  company_id,
  created_at
FROM public.users
WHERE email = 'thabelot@nsfas.org.za';

-- Check if auth user exists
SELECT 
  'Auth User' as check_type,
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'thabelot@nsfas.org.za'
   OR id = 'fa949c56-9575-45c6-b71b-acd03c45f0d9';

-- Check RLS policies
SELECT 
  'RLS Policy' as check_type,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

