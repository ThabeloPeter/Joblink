-- Fix RLS Infinite Recursion Issue
-- This script fixes the infinite recursion in the users table RLS policy

-- First, let's see what policies exist
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Drop existing problematic policies (if they exist)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on auth.uid()" ON public.users;

-- Create a simple, non-recursive policy
-- This allows users to read their own profile without recursion
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Alternative: If you need service role to bypass RLS, you can also create a policy for service role
-- But typically service role bypasses RLS automatically, so this might not be needed

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

-- Test the policy (should not cause recursion)
-- This query should work without infinite recursion:
-- SELECT * FROM public.users WHERE id = auth.uid();

