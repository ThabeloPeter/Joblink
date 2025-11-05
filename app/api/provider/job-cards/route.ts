import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Verify user
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const querySupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase

    const { data: profile, error: profileError } = await querySupabase
      .from('users')
      .select('id, role')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile || profile.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized - Provider role required' }, { status: 403 })
    }

    // Get provider record - id matches auth user id
    const { data: providerRecord, error: providerError } = await querySupabase
      .from('service_providers')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (providerError || !providerRecord) {
      return NextResponse.json({ error: 'Provider record not found' }, { status: 404 })
    }

    const providerId = providerRecord.id

    // Fetch job cards for this provider
    const { data: jobCards, error: jobCardsError } = await querySupabase
      .from('job_cards')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        location,
        due_date,
        created_at,
        updated_at,
        completed_at,
        companies!job_cards_company_id_fkey(
          id,
          name
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (jobCardsError) {
      console.error('Error fetching job cards:', jobCardsError)
      return NextResponse.json(
        { error: 'Failed to fetch job cards', details: jobCardsError.message },
        { status: 500 }
      )
    }

    // Format job cards
    const formattedJobCards = (jobCards || []).map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.companies?.name || 'Unknown Company',
      companyId: job.companies?.id || '',
      status: job.status,
      priority: job.priority,
      location: job.location || '',
      dueDate: job.due_date || '',
      createdAt: job.created_at,
      completedAt: job.completed_at,
    }))

    return NextResponse.json({ jobCards: formattedJobCards })
  } catch (error) {
    console.error('Error in GET /api/provider/job-cards:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

