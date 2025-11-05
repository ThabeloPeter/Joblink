import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

    // Get job cards statistics
    const { data: jobCards, error: jobCardsError } = await adminSupabase
      .from('job_cards')
      .select('id, status, priority, created_at, completed_at, due_date')
      .eq('company_id', profile.company_id)

    if (jobCardsError) {
      console.error('Error fetching job cards:', jobCardsError)
      return NextResponse.json({ error: 'Failed to fetch job cards' }, { status: 500 })
    }

    // Calculate statistics
    const total = jobCards?.length || 0
    const byStatus = {
      pending: jobCards?.filter((j) => j.status === 'pending').length || 0,
      accepted: jobCards?.filter((j) => j.status === 'accepted').length || 0,
      in_progress: jobCards?.filter((j) => j.status === 'in_progress').length || 0,
      completed: jobCards?.filter((j) => j.status === 'completed').length || 0,
      declined: jobCards?.filter((j) => j.status === 'declined').length || 0,
    }

    const byPriority = {
      high: jobCards?.filter((j) => j.priority === 'high').length || 0,
      medium: jobCards?.filter((j) => j.priority === 'medium').length || 0,
      low: jobCards?.filter((j) => j.priority === 'low').length || 0,
    }

    // Average completion time (in days)
    const completedCards = jobCards?.filter((j) => j.status === 'completed' && j.completed_at && j.created_at) || []
    const avgCompletionDays = completedCards.length > 0
      ? completedCards.reduce((sum, card) => {
          const created = new Date(card.created_at).getTime()
          const completed = new Date(card.completed_at!).getTime()
          return sum + (completed - created) / (1000 * 60 * 60 * 24)
        }, 0) / completedCards.length
      : 0

    // Completion rate
    const completionRate = total > 0 ? (byStatus.completed / total) * 100 : 0

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = jobCards?.filter((j) => new Date(j.created_at) >= thirtyDaysAgo).length || 0

    // Overdue job cards
    const now = new Date()
    const overdue = jobCards?.filter((j) => {
      if (!j.due_date || j.status === 'completed' || j.status === 'declined') return false
      return new Date(j.due_date) < now
    }).length || 0

    return NextResponse.json({
      stats: {
        total,
        byStatus,
        byPriority,
        avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        recent,
        overdue,
      },
      jobCards: jobCards?.slice(0, 100) || [], // Limit for performance
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

