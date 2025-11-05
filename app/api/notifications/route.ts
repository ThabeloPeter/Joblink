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
    const supabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', authUser.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Build query based on user role
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Filter based on role
    if (profile.role === 'admin') {
      // Admins see all notifications
      // No additional filter needed
    } else if (profile.role === 'company') {
      // Company users see notifications related to their company
      query = query.or(`company_id.eq.${profile.company_id},actor_type.eq.company`)
    } else if (profile.role === 'provider') {
      // Providers see notifications related to them
      query = query.or(`actor_type.eq.provider,entity_type.eq.job_card`)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching activity logs:', error)
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({
          notifications: [],
          unreadCount: 0,
        })
      }
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error.message },
        { status: 500 }
      )
    }

    // Format notifications
    const notifications = (logs || []).map((log) => ({
      id: log.id,
      type: log.entity_type || 'system',
      title: log.title || 'Activity',
      message: log.message || '',
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      actor_type: log.actor_type,
      actor_name: log.actor_name || 'System',
      created_at: log.created_at,
      read: log.read || false,
    }))

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error in GET /api/notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

