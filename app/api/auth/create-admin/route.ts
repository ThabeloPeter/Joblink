import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  adminKey: z.string().optional(), // Optional key for protection
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createAdminSchema.parse(body)
    
    // Check if admin key is required and matches (optional security measure)
    const requiredAdminKey = process.env.ADMIN_CREATION_KEY
    if (requiredAdminKey && validatedData.adminKey !== requiredAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin creation key' },
        { status: 403 }
      )
    }

    // Check if an admin user already exists
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdmins && existingAdmins.length > 0 && !requiredAdminKey) {
      // If no admin key is set, prevent creating additional admins without the key
      return NextResponse.json(
        { 
          error: 'An admin user already exists. Use the admin creation key to create additional admins.',
          requiresKey: true 
        },
        { status: 403 }
      )
    }

    // Check if user exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      )
    }

    // Try to sign up - Supabase will handle duplicate email check in auth

    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: undefined, // No email confirmation for admin creation
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create admin account. Please try again.' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Admin account creation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Create admin user profile record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        role: 'admin',
        company_id: null, // Admins don't belong to a company
      })

    if (userError) {
      // Note: Cannot delete auth user without service role key
      return NextResponse.json(
        { 
          error: 'Failed to create admin user profile. Please try again.',
          details: userError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
      },
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

    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

