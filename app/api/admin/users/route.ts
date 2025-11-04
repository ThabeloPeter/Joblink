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

    // Fetch users with company information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        company_id,
        created_at,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    // Fetch auth users for additional info (name, phone, last login)
    const authUsers = serviceRoleKey
      ? await supabase.auth.admin.listUsers()
      : { data: { users: [] }, error: null }

    const usersWithDetails = users.map((user) => {
      const authUser = authUsers.data?.users?.find((au) => au.id === user.id)
      const company = Array.isArray(user.companies) ? user.companies[0] : user.companies

      return {
        id: user.id,
        name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Unknown',
        email: user.email,
        phone: authUser?.user_metadata?.phone || '+1 000 000 0000',
        role: user.role === 'company' ? 'company_manager' : user.role === 'provider' ? 'service_provider' : 'admin',
        company: company?.name || null,
        status: 'active', // Default to active, can be enhanced later
        lastLogin: authUser?.last_sign_in_at?.split('T')[0] || user.created_at?.split('T')[0] || '',
        createdAt: user.created_at?.split('T')[0] || '',
      }
    })

    return NextResponse.json({ users: usersWithDetails })
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

