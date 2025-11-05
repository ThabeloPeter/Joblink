import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createActivityLog } from '@/lib/activity-log'

const updateJobCardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  providerId: z.string().min(1, 'Please select a provider'),
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateJobCardSchema.parse(body)

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

    // Fetch current job card
    const { data: currentJobCard, error: fetchError } = await supabase
      .from('job_cards')
      .select('*')
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .single()

    if (fetchError || !currentJobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
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

    // Store previous version for tracking
    const previousVersion = {
      title: currentJobCard.title,
      description: currentJobCard.description,
      provider_id: currentJobCard.provider_id,
      priority: currentJobCard.priority,
      location: currentJobCard.location,
      due_date: currentJobCard.due_date,
      status: currentJobCard.status,
      updated_at: currentJobCard.updated_at,
    }

    // Determine if provider can be changed (only if status is pending)
    const providerChanged = currentJobCard.provider_id !== validatedData.providerId
    const canEditProvider = currentJobCard.status === 'pending'
    
    // If provider is being changed but card is already accepted, reject the change
    if (providerChanged && !canEditProvider) {
      return NextResponse.json(
        { 
          error: 'Provider cannot be changed. Job card has already been accepted.',
          details: 'Only pending job cards can have their provider changed.'
        },
        { status: 400 }
      )
    }
    
    const shouldRecall = providerChanged && canEditProvider

    // Prepare update data
    const updateData: {
      title: string
      description: string
      provider_id: string
      priority: string
      location: string
      due_date: string
      status?: string
      updated_at: string
    } = {
      title: validatedData.title,
      description: validatedData.description,
      provider_id: validatedData.providerId,
      priority: validatedData.priority,
      location: validatedData.location,
      due_date: validatedData.dueDate,
      updated_at: new Date().toISOString(),
    }

    // Note: Previous version is tracked and returned in the response
    // To store it in the database, add a previous_version JSONB column to job_cards table
    // For now, we return it in the API response for tracking purposes

    // If provider changed and status allows, reset to pending (recall)
    if (shouldRecall) {
      updateData.status = 'pending'
    }

    // Update job card
    const { data: updatedJobCard, error: updateError } = await supabase
      .from('job_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating job card:', {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        data: updateData,
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to update job card', 
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
        },
        { status: 500 }
      )
    }

    // Create activity log entry
    const { data: companyData } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()

    const { data: oldProviderData } = await supabase
      .from('service_providers')
      .select('name')
      .eq('id', currentJobCard.provider_id)
      .single()

    const { data: newProviderData } = await supabase
      .from('service_providers')
      .select('name')
      .eq('id', validatedData.providerId)
      .single()

    await createActivityLog({
      type: 'job_card',
      title: shouldRecall 
        ? `Job card "${validatedData.title}" recalled and reassigned`
        : `Job card "${validatedData.title}" updated`,
      message: shouldRecall
        ? `Job card was recalled from ${oldProviderData?.name || 'provider'} and reassigned to ${newProviderData?.name || 'new provider'}`
        : `Job card details were updated by ${companyData?.name || 'company'}`,
      entityType: 'job_card',
      entityId: id,
      actorType: 'company',
      actorId: authUser.id,
      actorName: companyData?.name || 'Company',
      companyId: profile.company_id,
      metadata: {
        previousVersion,
        providerChanged,
        recalled: shouldRecall,
      },
    })

    return NextResponse.json({
      success: true,
      jobCard: {
        id: updatedJobCard.id,
        title: updatedJobCard.title,
        description: updatedJobCard.description,
        status: updatedJobCard.status,
        priority: updatedJobCard.priority,
        location: updatedJobCard.location,
        dueDate: updatedJobCard.due_date?.split('T')[0] || '',
        providerId: updatedJobCard.provider_id,
        recalled: shouldRecall,
      },
      previousVersion: previousVersion, // Return previous version in response for tracking
      message: shouldRecall 
        ? 'Job card updated and recalled. New provider has been assigned.' 
        : 'Job card updated successfully',
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

    console.error('Error in PUT /api/company/job-cards/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

