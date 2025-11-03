import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client
// Note: For API routes that need server-side auth, use the client-side client
// with token passed from headers, or implement proper cookie-based auth
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Create a basic server client without cookie configuration
  // For token-based auth, tokens should be passed via headers in API routes
  return createClient(supabaseUrl, supabaseAnonKey)
}

