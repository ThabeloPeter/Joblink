import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
    
    // Check if user already exists
    const { data: existingUser } = await supabase
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
    const { data: existingCompany } = await supabase
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
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

    // Create company record
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: validatedData.companyName,
        email: validatedData.email,
        contact_person: validatedData.contactPerson,
        phone: validatedData.phone,
        status: 'pending', // Requires admin approval
      })
      .select()
      .single()

    if (companyError) {
      // Rollback: delete the auth user if company creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create company record. Please try again.' },
        { status: 500 }
      )
    }

    // Create user profile record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        name: validatedData.contactPerson,
        phone: validatedData.phone,
        role: 'company_manager',
        company_id: companyData.id,
      })

    if (userError) {
      // Rollback: delete company and auth user
      await supabase.from('companies').delete().eq('id', companyData.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile. Please try again.' },
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
      requiresApproval: true,
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

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

