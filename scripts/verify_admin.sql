-- Verify Admin User Creation
-- Run this to check if your admin user was created correctly

-- Check the user profile
SELECT 
  u.id,
  u.email,
  u.role,
  u.company_id,
  u.created_at,
  u.updated_at,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Admin role correct'
    ELSE '❌ Role is not admin'
  END as role_status,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Auth user exists'
    ELSE '❌ Auth user missing'
  END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'thabelot@nsfas.org.za';

-- Expected result:
-- email: thabelot@nsfas.org.za
-- role: admin
-- company_id: null
-- role_status: ✅ Admin role correct
-- auth_status: ✅ Auth user exists

