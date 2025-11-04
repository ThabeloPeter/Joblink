import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface CompanyData {
  id: string
  name: string
  status: string
  contact_person: string
  phone: string
}

export async function GET(request: NextRequest) {
  try {
    // Get the session from the request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create a Supabase client to verify the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client with the token
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Fetch user profile with company info
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from('users')
      .select('id, email, role, company_id, companies(id, name, status, contact_person, phone)')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error in /me:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      })
      return NextResponse.json(
        { 
          error: 'Failed to fetch user profile',
          details: profileError.message,
        },
        { status: 500 }
      )
    }

    // Supabase returns companies as an array or object depending on the relationship
    const companies = profile.companies as CompanyData[] | CompanyData | null
    const companyData = Array.isArray(companies) ? companies[0] : companies

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
        companyId: profile.company_id,
        company: companyData ? {
          id: companyData.id,
          name: companyData.name,
          status: companyData.status,
          contactPerson: companyData.contact_person,
          phone: companyData.phone,
        } : null,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

