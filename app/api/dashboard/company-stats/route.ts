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

    // Get user and company
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'company' || !profile.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Fetch stats for this company
    // Note: If providers table doesn't exist, we'll default to 0
    const [providersResult, activeJobCardsResult, completedTodayResult, pendingJobsResult, allJobCardsResult] = await Promise.all([
      supabase.from('providers').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id),
      supabase.from('job_cards').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id).neq('status', 'completed'),
      supabase.from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'completed')
        .gte('completed_at', todayISO),
      supabase.from('job_cards').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'pending'),
      supabase.from('job_cards').select('id, status').eq('company_id', profile.company_id),
    ])

    const totalJobs = allJobCardsResult.error ? 0 : (allJobCardsResult.count || (allJobCardsResult.data?.length || 0))
    const completedJobs = allJobCardsResult.error ? 0 : (allJobCardsResult.data?.filter((j: any) => j.status === 'completed').length || 0)
    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0

    const stats = {
      totalProviders: providersResult.error ? 0 : (providersResult.count || 0),
      activeJobCards: activeJobCardsResult.error ? 0 : (activeJobCardsResult.count || 0),
      completedToday: completedTodayResult.error ? 0 : (completedTodayResult.count || 0),
      pendingJobs: pendingJobsResult.error ? 0 : (pendingJobsResult.count || 0),
      completionRate,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Company dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

