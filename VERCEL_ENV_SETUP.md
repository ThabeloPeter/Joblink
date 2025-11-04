# Setting Up Supabase Service Role Key in Vercel

## Why This Fixes the Issue
The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) policies, which eliminates the infinite recursion error.

## Steps to Add Service Role Key to Vercel

### 1. Get Your Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Find the **service_role** key (it's longer than the anon key)
5. Click the eye icon to reveal it, then copy it

⚠️ **Important**: Keep this key secret! Never commit it to git or expose it in client-side code.

### 2. Add to Vercel Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`joblink-jade` or similar)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Paste your service role key
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

#### Option B: Via Vercel CLI
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key when prompted
# Select all environments (production, preview, development)
```

### 3. Redeploy
After adding the environment variable:
1. Go to your project in Vercel
2. Click **Deployments** tab
3. Click the three dots on the latest deployment
4. Click **Redeploy**

Or trigger a new deployment by pushing to your main branch.

### 4. Verify
After redeployment, try logging in again. The infinite recursion error should be gone.

## Alternative: Fix RLS Policy (If You Don't Want to Use Service Role Key)

If you prefer to fix the RLS policy instead:

1. Go to Supabase Dashboard → SQL Editor
2. Run the script from `scripts/fix_rls_policies.sql`:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;

-- Create a simple, non-recursive policy
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

## Which Option to Choose?

- **Service Role Key (Recommended)**: Easier, faster, and more secure for server-side operations
- **Fix RLS Policy**: Better if you want to enforce RLS, but requires understanding your policy structure

