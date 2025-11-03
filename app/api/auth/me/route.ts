import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

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
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch user profile with company info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, company_id, companies(id, name, status, contact_person, phone)')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const companyData = profile.companies as CompanyData | null

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

