import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      : createClient(
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

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch stats
    // Handle missing tables gracefully
    const [companiesResult, pendingCompaniesResult, jobCardsResult, completedJobCardsResult] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('job_cards').select('id', { count: 'exact', head: true }).neq('status', 'completed'),
      supabase.from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    const stats = {
      totalCompanies: companiesResult.error ? 0 : (companiesResult.count || 0),
      pendingApprovals: pendingCompaniesResult.error ? 0 : (pendingCompaniesResult.count || 0),
      activeJobCards: jobCardsResult.error ? 0 : (jobCardsResult.count || 0),
      completedThisMonth: completedJobCardsResult.error ? 0 : (completedJobCardsResult.count || 0),
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

