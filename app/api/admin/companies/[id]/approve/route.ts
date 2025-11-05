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

    // Update company status to approved
    const { data: company, error: updateError } = await supabase
      .from('companies')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error approving company:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve company', details: updateError.message },
        { status: 500 }
      )
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Create activity log entry
    const { data: adminData } = await supabase
      .from('users')
      .select('email')
      .eq('id', authUser.id)
      .single()

    await createActivityLog({
      type: 'approval',
      title: `Company "${company.name}" approved`,
      message: `Company "${company.name}" has been approved by admin`,
      entityType: 'company',
      entityId: id,
      actorType: 'admin',
      actorId: authUser.id,
      actorName: adminData?.email || 'Admin',
      companyId: id,
      metadata: {
        companyName: company.name,
        companyEmail: company.email,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Company approved successfully',
      company,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/companies/[id]/approve:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

