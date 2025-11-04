# Fix RLS Infinite Recursion Error

## Problem
You're seeing this error: `'infinite recursion detected in policy for relation "users"'`

This happens when your RLS (Row Level Security) policy on the `users` table has a circular reference or checks itself.

## Solution

### Step 1: Check Current Policies
Run this in Supabase SQL Editor to see your current policies:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';
```

### Step 2: Fix the Policy
Run the SQL script in `scripts/fix_rls_policies.sql` or manually run:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on auth.uid()" ON public.users;

-- Create a simple, non-recursive policy
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

### Step 3: Alternative - Use Service Role Key (Recommended)
Instead of relying on RLS policies, use the service role key in your API routes. This bypasses RLS entirely:

1. Add to your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Get your service role key from:
   - Supabase Dashboard → Settings → API → service_role key

3. The login endpoint will automatically use this key when available, bypassing RLS.

### Step 4: Verify
After fixing the policy, try logging in again. The infinite recursion error should be gone.

## Why This Happens
RLS policies can cause infinite recursion if:
- The policy queries the same table it's protecting
- The policy uses a function that queries the protected table
- There are circular dependencies between policies

The simple fix is to use `auth.uid() = id` which directly compares the authenticated user's ID without querying the users table.

