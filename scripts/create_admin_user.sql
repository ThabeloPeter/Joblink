-- SQL Script to Create Admin User in Supabase
-- Run this in your Supabase SQL Editor

-- Method 1: Using Supabase's auth schema (Recommended)
-- This requires the user to be created in auth.users first
-- You can create the auth user via the Supabase dashboard or API, then run the second part

-- Step 1: Create the auth user (if not already created via dashboard/API)
-- Note: Supabase manages auth.users, so you may need to create it via the dashboard first
-- OR use the Supabase admin API with service role key

-- Step 2: Insert user profile after auth user exists
-- Replace 'USER_UUID_FROM_AUTH' with the actual UUID from auth.users after creating the auth user

-- Get the UUID from auth.users first:
-- SELECT id FROM auth.users WHERE email = 'thabelot@nsfas.org.za';

-- Then insert into public.users:
INSERT INTO public.users (
  id,
  email,
  role,
  company_id,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'thabelot@nsfas.org.za'),
  'thabelot@nsfas.org.za',
  'admin',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  updated_at = NOW();

-- ============================================================================
-- ALTERNATIVE METHOD: Complete Script (if you have access to auth schema)
-- ============================================================================
-- If you have direct access to create auth users, use this complete script:

-- First, create the auth user (requires appropriate permissions)
-- Password: Peterson1! needs to be hashed using bcrypt
-- Supabase uses bcrypt with salt rounds

DO $$
DECLARE
  v_user_id uuid;
  v_password_hash text;
BEGIN
  -- Hash the password: Peterson1!
  -- Supabase uses bcrypt. You'll need to hash this password first.
  -- Use: https://bcrypt-generator.com/ or similar tool with 10 rounds
  -- OR use: SELECT crypt('Peterson1!', gen_salt('bf', 10));
  
  -- Generate bcrypt hash (10 rounds is Supabase default)
  v_password_hash := crypt('Peterson1!', gen_salt('bf', 10));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'thabelot@nsfas.org.za',
    v_password_hash,
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NULL,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
  )
  RETURNING id INTO v_user_id;
  
  -- Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    role,
    company_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'thabelot@nsfas.org.za',
    'admin',
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'admin',
    email = 'thabelot@nsfas.org.za',
    updated_at = NOW();
    
  RAISE NOTICE 'Admin user created successfully with ID: %', v_user_id;
END $$;

-- ============================================================================
-- SIMPLEST METHOD: If auth user already exists in Supabase Dashboard
-- ============================================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create user manually with email: thabelot@nsfas.org.za, password: Peterson1!
-- 3. Then run this simple insert:

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

