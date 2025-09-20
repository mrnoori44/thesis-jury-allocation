// server/api/student/requests/[id]/jury.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const id = event.context.params?.id as string | undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing_id' })

  // 1) Ownership check: the request must belong to this student
  const { data: req, error: rErr } = await supabase
    .from('thesis_requests')
    .select('id, student_profile_id, title, field, status, proposed_date, proposed_location, created_at')
    .eq('id', id)
    .single()

  if (rErr) throw createError({ statusCode: 500, statusMessage: 'request_fetch_failed', data: rErr.message })
  if (!req) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  if (req.student_profile_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  // 2) Accepted allocations for this thesis
  const { data: allocs, error: aErr } = await supabase
    .from('jury_allocations')
    .select('id, professor_profile_id, status, invited_at, responded_at')
    .eq('thesis_request_id', req.id)
    .eq('status', 'accepted')
    .order('responded_at', { ascending: true })

  if (aErr) throw createError({ statusCode: 500, statusMessage: 'allocations_fetch_failed', data: aErr.message })

  if (!allocs?.length) {
    // Still no accepted professor—return request summary anyway
    return { ok: true, data: { request: req, jury: [] as any[] } }
  }

  // 3) Fetch professor_profiles for those allocations
  const profProfileIds = Array.from(
    new Set(
      allocs
        .map(a => a.professor_profile_id)
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
    )
  )
  const { data: profProfiles, error: pErr } = await supabase
    .from('professor_profiles')
    .select('id, profile_id, preferred_fields')
    .in('id', profProfileIds)

  if (pErr) throw createError({ statusCode: 500, statusMessage: 'professor_profiles_fetch_failed', data: pErr.message })

  const byPP = new Map<string, (typeof profProfiles)[number]>()
  for (const pp of profProfiles ?? []) if (pp?.id) byPP.set(pp.id, pp)

  // 4) Fetch names from profiles
  const profileIds = Array.from(
    new Set(
      (profProfiles ?? [])
        .map(pp => pp.profile_id)
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
    )
  )
  let names = new Map<string, string | null>()
  if (profileIds.length) {
    const { data: professors, error: nErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', profileIds)
    if (nErr) throw createError({ statusCode: 500, statusMessage: 'professor_names_fetch_failed', data: nErr.message })
    names = new Map(professors?.map(p => [p.id as string, p.full_name ?? null]) ?? [])
  }

  const jury = (allocs ?? []).map(a => {
    const pp = a.professor_profile_id ? byPP.get(a.professor_profile_id) : undefined
    const name = pp?.profile_id ? (names.get(pp.profile_id) ?? null) : null
    return {
      allocation_id: a.id,
      accepted_at: a.responded_at,
      professor_profile_id: a.professor_profile_id as string,
      professor_name: name,
      preferred_fields: (pp?.preferred_fields ?? []) as string[],
    }
  })

  return { ok: true, data: { request: req, jury } }
})
