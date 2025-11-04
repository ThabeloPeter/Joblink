import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })

    // Get current user and verify admin
    const { data: { user: authUser } } = await supabase.auth.getUser(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch companies with job card counts
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: companiesError.message },
        { status: 500 }
      )
    }

    // Fetch job card counts for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const [totalResult, activeResult] = await Promise.all([
          supabase
            .from('job_cards')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
          supabase
            .from('job_cards')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .neq('status', 'completed'),
        ])

        return {
          id: company.id,
          name: company.name,
          email: company.email,
          contactPerson: company.contact_person,
          phone: company.phone,
          status: company.status,
          createdAt: company.created_at?.split('T')[0] || '',
          totalJobCards: totalResult.count || 0,
          activeJobCards: activeResult.count || 0,
        }
      })
    )

    return NextResponse.json({ companies: companiesWithStats })
  } catch (error) {
    console.error('Error in GET /api/admin/companies:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

