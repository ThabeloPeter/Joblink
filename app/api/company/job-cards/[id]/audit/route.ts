import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createActivityLog } from '@/lib/activity-log'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Fetch job card
    const { data: jobCard, error: fetchError } = await supabase
      .from('job_cards')
      .select(`
        *,
        service_providers (
          id,
          name
        )
      `)
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .single()

    if (fetchError || !jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Verify job card is completed
    if (jobCard.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'Job card is not completed',
          details: 'Only completed job cards can be audited.'
        },
        { status: 400 }
      )
    }

    const provider = Array.isArray(jobCard.service_providers) 
      ? jobCard.service_providers[0] 
      : jobCard.service_providers

    // Get company name
    const { data: companyData } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()

    // Create activity log for company (audit notification)
    await createActivityLog({
      type: 'job_card',
      title: `Job card "${jobCard.title}" audited`,
      message: `Company ${companyData?.name || 'Company'} has audited and approved the completion of job card "${jobCard.title}" by ${provider?.name || 'provider'}.`,
      entityType: 'job_card',
      entityId: id,
      actorType: 'company',
      actorId: authUser.id,
      actorName: companyData?.name || 'Company',
      companyId: profile.company_id,
      metadata: {
        audited: true,
        providerId: provider?.id,
      },
    })

    // Create activity log for provider (notification that their completion was audited)
    if (provider?.id) {
      await createActivityLog({
        type: 'job_card',
        title: `Your completion of "${jobCard.title}" was audited`,
        message: `Your completion of job card "${jobCard.title}" has been audited and approved by ${companyData?.name || 'the company'}.`,
        entityType: 'job_card',
        entityId: id,
        actorType: 'company',
        actorId: authUser.id,
        actorName: companyData?.name || 'Company',
        companyId: profile.company_id,
        metadata: {
          audited: true,
          providerId: provider.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Job card audited successfully. Provider has been notified.',
    })
  } catch (error) {
    console.error('Error in POST /api/company/job-cards/[id]/audit:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

