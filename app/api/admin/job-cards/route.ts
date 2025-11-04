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

    // Fetch job cards with company and provider information
    const { data: jobCards, error: jobCardsError } = await supabase
      .from('job_cards')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        location,
        created_at,
        due_date,
        completed_at,
        company_id,
        provider_id,
        companies (
          id,
          name
        ),
        providers (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (jobCardsError) {
      console.error('Error fetching job cards:', jobCardsError)
      return NextResponse.json(
        { error: 'Failed to fetch job cards', details: jobCardsError.message },
        { status: 500 }
      )
    }

    const formattedJobCards = jobCards.map((job) => {
      const company = Array.isArray(job.companies) ? job.companies[0] : job.companies
      const provider = Array.isArray(job.providers) ? job.providers[0] : job.providers

      return {
        id: job.id,
        title: job.title || 'Untitled Job Card',
        description: job.description || '',
        company: company?.name || 'Unknown Company',
        provider: provider?.name || 'Unassigned',
        status: job.status || 'pending',
        priority: job.priority || 'medium',
        location: job.location || '',
        createdAt: job.created_at?.split('T')[0] || '',
        dueDate: job.due_date?.split('T')[0] || '',
        completedAt: job.completed_at?.split('T')[0] || null,
      }
    })

    return NextResponse.json({ jobCards: formattedJobCards })
  } catch (error) {
    console.error('Error in GET /api/admin/job-cards:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

