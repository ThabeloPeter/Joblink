import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const registerSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s&.,'-]+$/, 'Company name contains invalid characters')
    .trim(),
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(50, 'Contact person name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Contact person name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .max(100, 'Email must not exceed 100 characters')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, '')) // Remove all non-digits
    .refine((val) => val.length === 10, {
      message: 'Phone number must be exactly 10 digits',
    })
    .refine((val) => /^[0-9]{10}$/.test(val), {
      message: 'Phone number must contain only digits',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = registerSchema.parse(body)
    
    // Create Supabase client for server-side operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Use service role key if available for checking existing records (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const checkSupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase
    
    // Check if user already exists
    const { data: existingUser } = await checkSupabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Check if company already exists
    const { data: existingCompany } = await checkSupabase
      .from('companies')
      .select('id')
      .eq('name', validatedData.companyName)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this name already exists.' },
        { status: 409 }
      )
    }

    // Create user account with Supabase Auth
    // Note: signUp may not return a session if email confirmation is enabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation redirect
        data: {
          company_name: validatedData.companyName,
          contact_person: validatedData.contactPerson,
          phone: validatedData.phone,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create account. Please try again.' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Account creation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Create company record - use service role key if available (bypasses RLS)
    const insertSupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase
    
    const { data: companyData, error: companyError } = await insertSupabase
      .from('companies')
      .insert({
        name: validatedData.companyName,
        email: validatedData.email,
        contact_person: validatedData.contactPerson,
        phone: validatedData.phone,
        status: 'pending', // Requires admin approval
        created_by: authData.user.id,
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      // Note: Cannot delete auth user without service role key
      // Auth user will remain but can be cleaned up manually if needed
      return NextResponse.json(
        { 
          error: 'Failed to create company record. Please try again.',
          details: companyError.message 
        },
        { status: 500 }
      )
    }

    // Create user profile record
    const { error: userError } = await insertSupabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        role: 'company',
        company_id: companyData.id,
      })

    if (userError) {
      console.error('User profile creation error:', userError)
      // Rollback: delete company (auth user cannot be deleted without service role)
      if (serviceRoleKey) {
        await insertSupabase.from('companies').delete().eq('id', companyData.id)
      }
      return NextResponse.json(
        { 
          error: 'Failed to create user profile. Please try again.',
          details: userError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        companyId: companyData.id,
      },
      session: authData.session || null, // May be null if email confirmation is required
      requiresApproval: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map((e) => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

