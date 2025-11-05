import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createActivityLog } from '@/lib/activity-log'

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'declined', 'in_progress', 'completed']),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
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
    const validatedData = updateStatusSchema.parse(body)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Verify user
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and provider record
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
      .select('id, name, company_id')
      .eq('id', authUser.id)
      .single()

    if (providerError || !providerRecord) {
      return NextResponse.json({ error: 'Provider record not found' }, { status: 404 })
    }

    const providerId = providerRecord.id

    // Get current job card
    const { data: jobCard, error: jobCardError } = await querySupabase
      .from('job_cards')
      .select('id, title, status, company_id, provider_id')
      .eq('id', id)
      .single()

    if (jobCardError || !jobCard) {
      return NextResponse.json({ error: 'Job card not found' }, { status: 404 })
    }

    // Verify provider owns this job card
    if (jobCard.provider_id !== providerId) {
      return NextResponse.json({ error: 'Unauthorized - You can only update your own job cards' }, { status: 403 })
    }

    // Prepare update data
    const updateData: {
      status: string
      updated_at: string
      completed_at?: string | null
      completion_notes?: string
      completion_images?: string[]
    } = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Set completed_at and completion data if status is completed
    if (validatedData.status === 'completed') {
      // Require notes when completing
      if (!validatedData.notes || !validatedData.notes.trim()) {
        return NextResponse.json(
          { error: 'Completion notes are required' },
          { status: 400 }
        )
      }
      
      updateData.completed_at = new Date().toISOString()
      updateData.completion_notes = validatedData.notes.trim()
      
      if (validatedData.images && validatedData.images.length > 0) {
        updateData.completion_images = validatedData.images
      }
    } else if (jobCard.status === 'completed') {
      // If changing from completed to another status, clear completed_at
      updateData.completed_at = null
    }

    // Update job card
    const { data: updatedJobCard, error: updateError } = await querySupabase
      .from('job_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating job card:', updateError)
      return NextResponse.json(
        { error: 'Failed to update job card', details: updateError.message },
        { status: 500 }
      )
    }

    // Create activity log
    const statusLabels: Record<string, string> = {
      accepted: 'accepted',
      declined: 'declined',
      in_progress: 'started working on',
      completed: 'completed',
    }

    await createActivityLog({
      type: 'job_card',
      title: `Job Card ${statusLabels[validatedData.status] || 'updated'}`,
      message: `Provider ${providerRecord.name} ${statusLabels[validatedData.status] || 'updated'} job card "${jobCard.title}"${validatedData.notes ? ` with notes` : ''}${validatedData.images && validatedData.images.length > 0 ? ` with ${validatedData.images.length} image(s)` : ''}`,
      entityType: 'job_card',
      entityId: id,
      actorType: 'provider',
      actorId: providerId,
      actorName: providerRecord.name,
      companyId: providerRecord.company_id || jobCard.company_id,
      metadata: {
        previousStatus: jobCard.status,
        newStatus: validatedData.status,
        notes: validatedData.notes,
        imagesCount: validatedData.images?.length || 0,
      },
    })

    return NextResponse.json({
      success: true,
      jobCard: updatedJobCard,
    })
  } catch (error) {
    console.error('Error in PUT /api/provider/job-cards/[id]:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

