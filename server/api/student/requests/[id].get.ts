// server/api/student/requests/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing_id' })

  // ensure ownership
  const { data: req, error: rErr } = await supabase
    .from('thesis_requests')
    .select('id, title, field, abstract, status, created_at, proposed_date, proposed_location, student_profile_id')
    .eq('id', id)
    .single()
  if (rErr) throw createError({ statusCode: 500, statusMessage: 'request_fetch_failed', data: rErr.message })
  if (!req) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  if (req.student_profile_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  // invitations
  const { data: inv, error: iErr } = await supabase
    .from('jury_allocations')
    .select('id, professor_profile_id, status, invited_at, responded_at')
    .eq('thesis_request_id', req.id)
    .order('invited_at', { ascending: true })
  if (iErr) throw createError({ statusCode: 500, statusMessage: 'allocations_fetch_failed', data: iErr.message })

  return { ok: true, data: { request: req, invitations: inv ?? [] } }
})
