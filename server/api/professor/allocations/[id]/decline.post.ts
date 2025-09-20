import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing_id' })

  const { data: alloc, error: aErr } = await supabase
    .from('jury_allocations')
    .select('id, professor_profile_id, status, thesis_request_id, professor_profiles!inner(profile_id)')
    .eq('id', id)
    .single()
  if (aErr) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  if (alloc.professor_profiles.profile_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  if (alloc.status !== 'invited') throw createError({ statusCode: 409, statusMessage: 'not_invited' })

  const { error } = await supabase
    .from('jury_allocations')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
