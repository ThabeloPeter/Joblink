import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    let loginResult = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    // Handle email not confirmed error
    if (loginResult.error) {
      const isEmailNotConfirmed = loginResult.error.message?.toLowerCase().includes('email not confirmed') || 
                                  loginResult.error.message?.toLowerCase().includes('email_not_confirmed')
      
      if (isEmailNotConfirmed) {
        // Try to confirm the email automatically using service role key if available
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (serviceRoleKey) {
          const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
          
          // Get the user by email
          const { data: { users } } = await adminSupabase.auth.admin.listUsers()
          const user = users?.find(u => u.email === validatedData.email)
          
          if (user && !user.email_confirmed_at) {
            // Manually confirm the email
            const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
              user.id,
              { email_confirm: true }
            )
            
            if (!confirmError) {
              // Retry login after confirming email
              loginResult = await supabase.auth.signInWithPassword({
                email: validatedData.email,
                password: validatedData.password,
              })
              
              // If retry still fails, return error
              if (loginResult.error) {
                return NextResponse.json(
                  { 
                    error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.',
                    details: loginResult.error.message,
                    requiresEmailConfirmation: true
                  },
                  { status: 401 }
                )
              }
            } else {
              // If confirmation failed, return error
              return NextResponse.json(
                { 
                  error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.',
                  details: loginResult.error.message,
                  requiresEmailConfirmation: true
                },
                { status: 401 }
              )
            }
          } else {
            // User not found or already confirmed
            return NextResponse.json(
              { 
                error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.',
                details: loginResult.error.message,
                requiresEmailConfirmation: true
              },
              { status: 401 }
            )
          }
        } else {
          // Service role key not available
          return NextResponse.json(
            { 
              error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.',
              details: loginResult.error.message,
              requiresEmailConfirmation: true
            },
            { status: 401 }
          )
        }
      } else {
        // Other errors
        return NextResponse.json(
          { 
            error: loginResult.error.message || 'Invalid email or password',
            details: loginResult.error.message 
          },
          { status: 401 }
        )
      }
    }

    const { data, error } = loginResult

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 401 }
      )
    }

    // Fetch user profile to get role and company info
    // Try using service role key first (bypasses RLS), fallback to anon key with auth token
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const profileSupabase = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      : createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
          }
        )

    console.log('Fetching profile for user:', {
      userId: data.user.id,
      userEmail: data.user.email,
      usingServiceRole: !!serviceRoleKey,
    })

    const { data: profile, error: profileError } = await profileSupabase
      .from('users')
      .select('id, role, company_id, companies(status)')
      .eq('id', data.user.id)
      .single()

    // Log the error for debugging if profile doesn't exist
    if (profileError) {
      console.error('Profile fetch error:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        userId: data.user.id,
        userEmail: data.user.email,
        usingServiceRole: !!serviceRoleKey,
      })
      
      // If using service role key and still getting error, profile truly doesn't exist
      // If using anon key, it might be an RLS issue
      const isRLSIssue = !serviceRoleKey && (profileError.code === 'PGRST301' || profileError.message?.includes('permission'))
      
      // Try a direct query to verify profile exists (only if using service role)
      if (serviceRoleKey) {
        const directCheck = await profileSupabase
          .from('users')
          .select('id, email, role')
          .eq('id', data.user.id)
          .maybeSingle()
        
        console.log('Direct profile check result:', {
          exists: !!directCheck.data,
          data: directCheck.data,
          error: directCheck.error?.message,
          errorCode: directCheck.error?.code,
        })
        
        // If profile exists but single() failed, there might be a data issue
        if (directCheck.data && profileError) {
          console.warn('Profile exists but single() query failed - possible data inconsistency:', {
            profileData: directCheck.data,
            originalError: profileError.message,
          })
        }
      } else {
        console.warn('Service role key not set - RLS may be blocking the query. Add SUPABASE_SERVICE_ROLE_KEY to .env.local')
      }
      
      // Return more detailed error for debugging
      // Always include debug info to help diagnose issues
      return NextResponse.json(
        { 
          error: 'User profile not found. Please contact support.',
          details: profileError.message || 'Account exists but profile is missing',
          debug: {
            code: profileError.code,
            hint: profileError.hint,
            userId: data.user.id,
            userEmail: data.user.email,
            rlsIssue: isRLSIssue,
            serviceRoleUsed: !!serviceRoleKey,
            errorMessage: profileError.message,
            errorDetails: profileError.details,
          },
        },
        { status: 403 }
      )
    }

    if (!profile) {
      console.error('Profile query returned null/undefined for user:', {
        userId: data.user.id,
        userEmail: data.user.email,
        usingServiceRole: !!serviceRoleKey,
      })
      
      return NextResponse.json(
        { 
          error: 'User profile not found. Please contact support.',
          details: 'Account exists but profile is missing',
          debug: process.env.NODE_ENV === 'development' ? {
            userId: data.user.id,
            userEmail: data.user.email,
            serviceRoleUsed: !!serviceRoleKey,
          } : undefined,
        },
        { status: 403 }
      )
    }

    console.log('Profile found:', {
      userId: profile.id,
      role: profile.role,
      email: data.user.email,
    })

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
      // Supabase returns companies as an array or object depending on the relationship
      const companies = profile.companies as { status: string }[] | { status: string } | null
      const companyData = Array.isArray(companies) ? companies[0] : companies
      const companyStatus = companyData?.status
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
          details: error.issues.map((e) => e.message).join(', ')
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

