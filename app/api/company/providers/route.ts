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

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!profile.company_id) {
      console.error('User has no company_id:', { userId: authUser.id, profile })
      return NextResponse.json(
        { error: 'User is not associated with a company' },
        { status: 400 }
      )
    }

    // Fetch providers for this company - use service role key if available
    const querySupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase

    const { data: providers, error: providersError } = await querySupabase
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

    // Handle case where providers is null or undefined
    if (!providers) {
      return NextResponse.json({ providers: [] })
    }

    // Get job card statistics for each provider
    const providersWithStats = await Promise.all(
      providers.map(async (provider) => {
        try {
          const { count: completedCount } = await querySupabase
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
        } catch (error) {
          console.error(`Error fetching stats for provider ${provider.id}:`, error)
          return {
            id: provider.id,
            name: provider.name || 'Unknown',
            email: provider.email || '',
            phone: provider.phone || '',
            status: provider.status || 'active',
            jobCardsCompleted: 0,
            rating: provider.rating || 0,
          }
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

// Generate a unique 8-character code
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone } = body

    // Validate input
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Create Supabase client - use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get current user and verify they're a company user
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

    if (!profile.company_id) {
      return NextResponse.json(
        { error: 'User is not associated with a company' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Generate unique 8-character code
    let providerCode = generateUniqueCode()
    
    // Ensure code is unique (check if it exists in providers table)
    let codeExists = true
    let attempts = 0
    while (codeExists && attempts < 10) {
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('code', providerCode)
        .single()
      
      if (!existingProvider) {
        codeExists = false
      } else {
        providerCode = generateUniqueCode()
        attempts++
      }
    }

    // Create auth user with generated code as password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: providerCode,
      email_confirm: true, // Auto-confirm email for providers
      user_metadata: {
        name,
        phone,
        provider_code: providerCode,
      },
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create provider account', details: authError?.message },
        { status: 500 }
      )
    }

    // Create provider record
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        company_id: profile.company_id,
        code: providerCode,
        status: 'active',
        rating: 0,
      })
      .select()
      .single()

    if (providerError) {
      console.error('Error creating provider:', providerError)
      // Try to delete the auth user if provider creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create provider record', details: providerError.message },
        { status: 500 }
      )
    }

    // Create user profile record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role: 'provider',
        company_id: profile.company_id,
      })

    if (userError) {
      console.error('Error creating user profile:', userError)
      // Try to clean up
      await supabase.from('providers').delete().eq('id', authData.user.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: providerData.id,
        name: providerData.name,
        email: providerData.email,
        phone: providerData.phone,
        code: providerCode,
      },
      message: 'Provider created successfully. They can login with their email and the generated code.',
    })
  } catch (error) {
    console.error('Error in POST /api/company/providers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
