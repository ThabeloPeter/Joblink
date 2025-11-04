import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Diagnostic endpoint to check if a user profile exists
// Only for development/debugging
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Please provide userId or email' },
        { status: 400 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Check in auth.users
    const authQuery = email
      ? supabase.auth.admin.listUsers().then(({ data, error }) => {
          const user = data?.users?.find(u => u.email === email)
          return { user, error }
        })
      : { user: null, error: null }

    // Check in public.users
    const profileQuery = userId
      ? supabase.from('users').select('*').eq('id', userId).single()
      : supabase.from('users').select('*').eq('email', email).single()

    const [authResult, profileResult] = await Promise.all([
      authQuery,
      profileQuery,
    ])

    return NextResponse.json({
      success: true,
      auth: {
        exists: !!authResult.user,
        userId: authResult.user?.id,
        email: authResult.user?.email,
      },
      profile: {
        exists: !!profileResult.data,
        data: profileResult.data,
        error: profileResult.error ? {
          message: profileResult.error.message,
          code: profileResult.error.code,
          details: profileResult.error.details,
          hint: profileResult.error.hint,
        } : null,
      },
      usingServiceRole: !!serviceRoleKey,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      {
        error: 'An error occurred',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

