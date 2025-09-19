// server/api/student/requests.post.ts
import { defineEventHandler, createError, readBody } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

type CreateReqBody = {
  title: string
  field: string
  abstract?: string
  proposed_date?: string | null // ISO date (yyyy-mm-dd)
  proposed_location?: string | null
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const body = await readBody<CreateReqBody>(event)
  if (!body?.title || !body?.field) {
    throw createError({ statusCode: 400, statusMessage: 'title_and_field_required' })
  }

  // 1) Ensure user is a student
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, role, full_name, approved')
    .eq('id', user.id)
    .single()
  if (pErr) throw createError({ statusCode: 500, statusMessage: 'profile_fetch_failed', data: pErr.message })
  if (!profile || profile.role !== 'student') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }
  // (Optional) block unapproved students:
  // if (!profile.approved) throw createError({ statusCode: 403, statusMessage: 'not_approved' })

  // 2) Insert thesis request
  const authors = [
    { name: profile.full_name ?? 'دانشجو', role: 'author', profile_id: profile.id }
  ]

  const { data: inserted, error: insErr } = await supabase
    .from('thesis_requests')
    .insert({
      title: body.title,
      field: body.field, // Persian field string
      abstract: body.abstract ?? null,
      authors: authors as any,
      proposed_date: body.proposed_date ?? null,
      proposed_location: body.proposed_location ?? null,
      student_profile_id: profile.id,
      status: 'matching'
    })
    .select('id, title, field, status, proposed_date')
    .single()

  if (insErr) throw createError({ statusCode: 500, statusMessage: 'insert_failed', data: insErr.message })

  // 3) Match professors (very simple: field contains + availability on date)
  //    - professor_profiles.preferred_fields @> [field]
  const { data: profs, error: profErr } = await supabase
    .from('professor_profiles')
    .select('id, profile_id, preferred_fields')
    .contains('preferred_fields', [body.field])
  if (profErr) throw createError({ statusCode: 500, statusMessage: 'match_failed', data: profErr.message })

  let candidates = (profs ?? []).map(p => p.id) // PKs of professor_profiles

  // If a proposed_date is provided, require availability that day
  if (body.proposed_date && candidates.length) {
    const { data: slots, error: slotErr } = await supabase
      .from('time_slots')
      .select('professor_profile_id')
      .in('professor_profile_id', candidates)
      .eq('slot_date', body.proposed_date)
      .eq('status', 'available')
    if (slotErr) throw createError({ statusCode: 500, statusMessage: 'availability_failed', data: slotErr.message })
    const canSet = new Set((slots ?? []).map(s => s.professor_profile_id))
    candidates = candidates.filter(id => canSet.has(id))
  }

  // cap to K=3 invitations (MVP)
  const picks = candidates.slice(0, 3)

  if (picks.length) {
    // 4) Insert invitations
    const rows = picks.map(ppk => ({
      thesis_request_id: inserted.id,
      professor_profile_id: ppk,
      role: 'jury',
      status: 'invited',
      invited_at: new Date().toISOString()
    }))
    const { error: invErr } = await supabase.from('jury_allocations').insert(rows)
    if (invErr) throw createError({ statusCode: 500, statusMessage: 'invite_failed', data: invErr.message })

    // 5) update thesis status to inviting
    await supabase.from('thesis_requests')
      .update({ status: 'inviting' })
      .eq('id', inserted.id)
  }

  return {
    ok: true,
    data: { ...inserted, invited_count: picks.length }
  }
})
