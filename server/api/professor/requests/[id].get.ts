// server/api/professor/requests/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing_id' })

  // Find professor_profile PK for this user
  const { data: prof, error: pErr } = await supabase
    .from('professor_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()
  if (pErr) throw createError({ statusCode: 500, statusMessage: 'professor_profile_fetch_failed', data: pErr.message })
  if (!prof) throw createError({ statusCode: 404, statusMessage: 'professor_profile_not_found' })

  // Fetch thesis request joined with this professor's allocation (must exist)
  const { data: req, error: rErr } = await supabase
    .from('thesis_requests')
    .select(`
      id, title, field, abstract, created_at, proposed_date, proposed_location, status, student_profile_id,
      jury_allocations!inner(id, status, invited_at, responded_at, professor_profile_id)
    `)
    .eq('id', id)
    .eq('jury_allocations.professor_profile_id', prof.id)
    .single()

  if (rErr) throw createError({ statusCode: 404, statusMessage: 'not_found', data: rErr.message })

  // Pull the specific allocation row for this professor
  // (supabase returns an array for the joined table)
  const allocRow = Array.isArray((req as any).jury_allocations)
    ? (req as any).jury_allocations.find((a: any) => a.professor_profile_id === prof.id)
    : null
  if (!allocRow) throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  // Student name
  let studentName: string | null = null
  if (req.student_profile_id) {
    const { data: student, error: sErr } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', req.student_profile_id)
      .maybeSingle()
    if (sErr) throw createError({ statusCode: 500, statusMessage: 'student_fetch_failed', data: sErr.message })
    studentName = student?.full_name ?? null
  }

  // Shape response
  return {
    ok: true,
    data: {
      thesis: {
        id: req.id,
        title: req.title,
        field: req.field,
        abstract: req.abstract,
        status: req.status,
        created_at: req.created_at,
        proposed_date: req.proposed_date,
        proposed_location: req.proposed_location,
        student_profile_id: req.student_profile_id
      },
      allocation: {
        id: allocRow.id,
        status: allocRow.status,
        invited_at: allocRow.invited_at,
        responded_at: allocRow.responded_at
      },
      student_name: studentName
    }
  }
})
