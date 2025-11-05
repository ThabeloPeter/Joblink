import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

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

    // Build query to mark all as read based on user role
    let query = supabase
      .from('activity_logs')
      .update({ read: true })
      .eq('read', false)

    // Filter based on role
    if (profile.role === 'company') {
      query = query.or(`company_id.eq.${profile.company_id},actor_type.eq.company`)
    } else if (profile.role === 'provider') {
      query = query.or(`actor_type.eq.provider,entity_type.eq.job_card`)
    }

    const { error } = await query

    if (error) {
      // If table doesn't exist, just return success
      if (error.code === '42P01') {
        return NextResponse.json({ success: true })
      }
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark notifications as read', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/notifications/read-all:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

