-- Fix Admin User Profile
-- Run this if you get "User profile not found" error
-- This will create the user profile for your admin user

-- First, check if the auth user exists
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'thabelot@nsfas.org.za';

-- Then create/update the user profile in public.users
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
WHERE u.email = 'thabelot@nsfas.org.za';

