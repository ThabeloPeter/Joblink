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

    // Verify user and get provider ID
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to find provider_id
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

    // Get job card statistics
    const [
      { count: pendingCount } = { count: 0 },
      { count: acceptedCount } = { count: 0 },
      { count: inProgressCount } = { count: 0 },
      { count: completedCount } = { count: 0 },
      { count: totalCount } = { count: 0 },
    ] = await Promise.all([
      querySupabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'pending'),
      querySupabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'accepted'),
      querySupabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'in_progress'),
      querySupabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'completed'),
      querySupabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId),
    ])

    // Get completed today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: completedToday } = await querySupabase
      .from('job_cards')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString())

    // Calculate completion rate
    const completionRate = (totalCount || 0) > 0 
      ? Math.round(((completedCount || 0) / (totalCount || 1)) * 100) 
      : 0

    return NextResponse.json({
      stats: {
        pendingJobCards: pendingCount || 0,
        acceptedJobCards: acceptedCount || 0,
        inProgressJobCards: inProgressCount || 0,
        completedJobCards: completedCount || 0,
        totalJobCards: totalCount || 0,
        completedToday: completedToday || 0,
        completionRate,
      },
    })
  } catch (error) {
    console.error('Error fetching provider stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

