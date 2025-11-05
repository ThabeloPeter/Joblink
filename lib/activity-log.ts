// Utility function to create activity log entries
import { createClient } from '@supabase/supabase-js'

interface CreateActivityLogParams {
  type: 'job_card' | 'company' | 'provider' | 'system' | 'approval'
  title: string
  message: string
  entityType?: string
  entityId?: string
  actorType: 'admin' | 'company' | 'provider'
  actorId: string
  actorName: string
  companyId?: string
  metadata?: Record<string, unknown>
}

export async function createActivityLog(params: CreateActivityLogParams) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.warn('Service role key not configured - activity log not created')
      return null
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        type: params.type,
        title: params.title,
        message: params.message,
        entity_type: params.entityType,
        entity_id: params.entityId,
        actor_type: params.actorType,
        actor_id: params.actorId,
        actor_name: params.actorName,
        company_id: params.companyId,
        metadata: params.metadata || {},
        read: false,
      })

    if (error) {
      // If table doesn't exist, just log and continue
      if (error.code === '42P01') {
        console.warn('Activity logs table does not exist - log not created')
        return null
      }
      console.error('Error creating activity log:', error)
      return null
    }

    return true
  } catch (error) {
    console.error('Error in createActivityLog:', error)
    return null
  }
}

