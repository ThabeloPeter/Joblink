-- SIMPLE METHOD: Recommended Approach
-- 
-- Step 1: Create the auth user in Supabase Dashboard first:
--   1. Go to Authentication > Users
--   2. Click "Add User" > "Create New User"
--   3. Email: thabelot@nsfas.org.za
--   4. Password: Peterson1!
--   5. Auto Confirm User: YES
--   6. Click "Create User"
--
-- Step 2: Run this SQL script to create the admin profile:

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

-- Verify the user was created:
SELECT 
  u.id,
  u.email,
  u.role,
  u.company_id,
  u.created_at
FROM public.users u
WHERE u.email = 'thabelot@nsfas.org.za';

