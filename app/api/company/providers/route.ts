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

    // Get current user and their company
    const { data: { user: authUser } } = await supabase.auth.getUser(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch providers for this company
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (providersError) {
      console.error('Error fetching providers:', providersError)
      return NextResponse.json(
        { error: 'Failed to fetch providers', details: providersError.message },
        { status: 500 }
      )
    }

    // Get job card statistics for each provider
    const providersWithStats = await Promise.all(
      providers.map(async (provider) => {
        const { count: completedCount } = await supabase
          .from('job_cards')
          .select('id', { count: 'exact', head: true })
          .eq('provider_id', provider.id)
          .eq('status', 'completed')

        return {
          id: provider.id,
          name: provider.name || 'Unknown',
          email: provider.email || '',
          phone: provider.phone || '',
          status: provider.status || 'active',
          jobCardsCompleted: completedCount || 0,
          rating: provider.rating || 0,
        }
      })
    )

    return NextResponse.json({ providers: providersWithStats })
  } catch (error) {
    console.error('Error in GET /api/company/providers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

