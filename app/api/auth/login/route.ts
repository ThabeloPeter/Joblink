import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = loginSchema.parse(body)
    
    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return NextResponse.json(
        { 
          error: error.message || 'Invalid email or password',
          details: error.message 
        },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 401 }
      )
    }

    // Fetch user profile to get role and company info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, company_id, companies(status)')
      .eq('id', data.user.id)
      .single()

    // If profile doesn't exist, user cannot login
    if (profileError || !profile) {
      return NextResponse.json(
        { 
          error: 'User profile not found. Please contact support.',
          details: 'Account exists but profile is missing'
        },
        { status: 403 }
      )
    }

    // Admins can always login (no company approval check needed)
    if (profile.role === 'admin') {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: 'admin',
          companyId: null,
        },
        session: data.session,
      })
    }

    // Check if user's company is approved (if they're a company user)
    if (profile.role === 'company') {
      const companyStatus = (profile.companies as any)?.status
      if (companyStatus !== 'approved') {
        return NextResponse.json(
          { 
            error: 'Your company account is pending approval. Please contact support.',
            requiresApproval: true 
          },
          { status: 403 }
        )
      }
    }

    // Providers can login (no approval needed)
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        companyId: profile.company_id,
      },
      session: data.session,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map((e) => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

