import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const jobCardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  providerId: z.string().min(1, 'Please select a provider'),
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
})

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

    if (profileError || !profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch job cards for this company
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
        provider_id,
        service_providers (
          id,
          name
        )
      `)
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (jobCardsError) {
      console.error('Error fetching job cards:', jobCardsError)
      return NextResponse.json(
        { error: 'Failed to fetch job cards', details: jobCardsError.message },
        { status: 500 }
      )
    }

    const formattedJobCards = (jobCards || []).map((job) => {
      const provider = Array.isArray(job.service_providers) ? job.service_providers[0] : job.service_providers

      return {
        id: job.id,
        title: job.title || 'Untitled Job Card',
        description: job.description || '',
        provider: provider?.name || 'Unassigned',
        providerId: job.provider_id || '',
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
    console.error('Error in GET /api/company/job-cards:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = jobCardSchema.parse(body)

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

    // Verify provider belongs to the same company
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id, company_id')
      .eq('id', validatedData.providerId)
      .eq('company_id', profile.company_id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found or does not belong to your company' },
        { status: 404 }
      )
    }

    // Create job card
    const jobCardData: {
      title: string
      description: string
      company_id: string
      provider_id: string
      priority: string
      location: string
      due_date: string
      status: string
    } = {
      title: validatedData.title,
      description: validatedData.description,
      company_id: profile.company_id,
      provider_id: validatedData.providerId,
      priority: validatedData.priority,
      location: validatedData.location,
      due_date: validatedData.dueDate,
      status: 'pending', // New job cards start as pending
    }

    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .insert(jobCardData)
      .select()
      .single()

    if (jobCardError) {
      console.error('Error creating job card:', {
        error: jobCardError,
        message: jobCardError.message,
        code: jobCardError.code,
        details: jobCardError.details,
        hint: jobCardError.hint,
        data: jobCardData,
      })
      
      // Return detailed error to help debug
      return NextResponse.json(
        { 
          error: 'Failed to create job card', 
          details: jobCardError.message,
          code: jobCardError.code,
          hint: jobCardError.hint,
          debug: process.env.NODE_ENV === 'development' ? {
            attemptedData: jobCardData,
            errorObject: jobCardError,
          } : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      jobCard: {
        id: jobCard.id,
        title: jobCard.title,
        description: jobCard.description,
        status: jobCard.status,
        priority: jobCard.priority,
        location: jobCard.location,
        dueDate: jobCard.due_date?.split('T')[0] || '',
      },
      message: 'Job card created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map((e) => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/company/job-cards:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
