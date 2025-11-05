import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  contactPerson: z.string().min(2, 'Contact person name required').optional(),
  phone: z.string().min(10, 'Valid phone number required').optional(),
  address: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const profileSupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )

    const { data: profile, error: profileError } = await profileSupabase
      .from('users')
      .select('id, email, role, company_id, companies(*)')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile.company_id) {
      return NextResponse.json(
        { error: 'User is not associated with a company' },
        { status: 400 }
      )
    }

    const companies = profile.companies as any
    const companyData = Array.isArray(companies) ? companies[0] : companies

    if (!companyData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company: {
        id: companyData.id,
        name: companyData.name || '',
        email: companyData.email || '',
        contactPerson: companyData.contact_person || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        status: companyData.status,
      },
    })
  } catch (error) {
    console.error('Get company settings error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const profileSupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )

    const { data: profile, error: profileError } = await profileSupabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return NextResponse.json(
        { error: 'User is not associated with a company' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.contactPerson !== undefined) updateData.contact_person = validatedData.contactPerson
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    updateData.updated_at = new Date().toISOString()

    const { data: updatedCompany, error: updateError } = await profileSupabase
      .from('companies')
      .update(updateData)
      .eq('id', profile.company_id)
      .select()
      .single()

    if (updateError) {
      console.error('Update company error:', updateError)
      return NextResponse.json(
        { 
          error: 'Failed to update company settings',
          details: updateError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name || '',
        email: updatedCompany.email || '',
        contactPerson: updatedCompany.contact_person || '',
        phone: updatedCompany.phone || '',
        address: updatedCompany.address || '',
        status: updatedCompany.status,
      },
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update company settings error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

