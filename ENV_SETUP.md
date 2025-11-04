# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (Optional but Recommended)
# This bypasses RLS for server-side queries and is more secure for API routes
# Get this from: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Why Service Role Key?

The service role key is recommended for server-side API routes because:

1. **Bypasses RLS**: Server-side queries can read user profiles without RLS restrictions
2. **More Secure**: Server-side only, never exposed to client
3. **Better Performance**: Fewer permission checks

## Getting Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Find the **service_role** key (keep this secret!)
4. Copy it to your `.env.local` file

## Security Note

⚠️ **NEVER** expose the service role key in client-side code. It should only be used in:
- API routes (`/app/api/**`)
- Server components
- Server-side functions

The anon key is safe to use in client-side code.

