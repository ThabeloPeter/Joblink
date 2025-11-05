import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    })

    if (verifyError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Update password using service role key if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
      
      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        user.id,
        { password: validatedData.newPassword }
      )

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update password', details: updateError.message },
          { status: 500 }
        )
      }
    } else {
      // Fallback: use updateUser with token
      const { error: updateError } = await supabase.auth.updateUser({
        password: validatedData.newPassword,
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update password', details: updateError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as Error & { errors?: unknown }
      return NextResponse.json(
        { error: 'Validation error', details: zodError.errors },
        { status: 400 }
      )
    }
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

