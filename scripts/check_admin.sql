-- Quick check script to verify admin user setup
-- Run this to see if your admin user is set up correctly

-- Check auth.users (Supabase Authentication)
SELECT 
  'Auth User' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'thabelot@nsfas.org.za';

-- Check public.users (User Profile)
SELECT 
  'User Profile' as check_type,
  id,
  email,
  role,
  company_id,
  created_at
FROM public.users
WHERE email = 'thabelot@nsfas.org.za';

-- If both queries return results, your admin is set up correctly
-- If only the first query returns results, run fix_admin_profile.sql

