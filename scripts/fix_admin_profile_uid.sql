-- Fix Admin User Profile (using UID)
-- Run this in Supabase SQL Editor if you get "User profile not found" error
-- This will create the user profile for your admin user

-- Option 1: Using the UID directly
INSERT INTO public.users (
  id,
  email,
  role,
  company_id,
  created_at,
  updated_at
)
VALUES (
  'fa949c56-9575-45c6-b71b-acd03c45f0d9',
  'thabelot@nsfas.org.za',
  'admin',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  email = EXCLUDED.email,
  updated_at = NOW();

-- Option 2: Using email (alternative - already in fix_admin_profile.sql)
-- This will work if the auth user exists with that email
INSERT INTO public.users (
  id,
  email,
  role,
  company_id,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'thabelot@nsfas.org.za'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify the profile was created:
SELECT 
  u.id,
  u.email,
  u.role,
  u.company_id,
  u.created_at,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Admin profile created successfully!'
    ELSE '❌ Profile exists but role is not admin'
  END as status
FROM public.users u
WHERE u.id = 'fa949c56-9575-45c6-b71b-acd03c45f0d9';

