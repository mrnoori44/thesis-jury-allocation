// server/api/professor/incoming.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  // 1) Find this professor's profile PK (professor_profiles.id)
  const { data: prof, error: pErr } = await supabase
    .from('professor_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()
  if (pErr) throw createError({ statusCode: 500, statusMessage: 'professor_profile_fetch_failed', data: pErr.message })
  if (!prof) throw createError({ statusCode: 404, statusMessage: 'professor_profile_not_found' })

  // 2) Their allocations (most recent first)
  const { data: allocs, error: aErr } = await supabase
    .from('jury_allocations')
    .select('id, thesis_request_id, status, invited_at, responded_at')
    .eq('professor_profile_id', prof.id)
    .order('invited_at', { ascending: false })
  if (aErr) throw createError({ statusCode: 500, statusMessage: 'allocations_fetch_failed', data: aErr.message })

  if (!allocs?.length) return { ok: true, data: [] }

    const requestIds = Array.from(
    new Set(
      allocs
        .map(a => a.thesis_request_id)
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
    )
  )

  // 3) Fetch thesis requests for those IDs
  const { data: reqs, error: rErr } = await supabase
    .from('thesis_requests')
    .select('id, title, field, abstract, created_at, proposed_date, proposed_location, student_profile_id')
    .in('id', requestIds)
  if (rErr) throw createError({ statusCode: 500, statusMessage: 'requests_fetch_failed', data: rErr.message })

  const byReq: Record<string, (typeof reqs)[number]> = {}
  for (const r of reqs ?? []) byReq[r.id] = r

  // 4) Fetch student names
    const studentIds = Array.from(
    new Set(
      (reqs ?? [])
        .map(r => r.student_profile_id)
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
    )
  )
  const { data: students, error: sErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentIds)
  if (sErr) throw createError({ statusCode: 500, statusMessage: 'students_fetch_failed', data: sErr.message })
  const nameMap = new Map(students?.map(s => [s.id, s.full_name ?? null]) ?? [])

  // 5) Compose output rows
  const safeStudentName = (id: string | null | undefined) =>
  (typeof id === 'string' && id.length > 0) ? (nameMap.get(id) ?? null) : null
  
  const out = (allocs ?? []).map(a => {
    const thesisId = a.thesis_request_id
    const r = thesisId ? byReq[thesisId] : undefined // guard narrows to string
    return {
      allocation_id: a.id,
      thesis_id: a.thesis_request_id,
      status: a.status,
      invited_at: a.invited_at,
      responded_at: a.responded_at,
      title: r?.title ?? '',
      field: r?.field ?? '',
      abstract: r?.abstract ?? null,
      created_at: r?.created_at ?? null,
      proposed_date: r?.proposed_date ?? null,
      proposed_location: r?.proposed_location ?? null,
      student_name: safeStudentName(r?.student_profile_id)
    }
  })

  return { ok: true, data: out }
})
