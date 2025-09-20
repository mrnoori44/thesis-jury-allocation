// server/api/student/requests.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // same style as finalize.post.ts

export default defineEventHandler(async (event) => {
  // This client runs with the user session from cookies
  const supabase = await serverSupabaseClient(event) as unknown as SupabaseClient<Database>

  // 1) Auth via cookies (Nuxt helper)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  // 2) Minimal role guard (must be a student)
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, role, approved, full_name')
    .eq('id', user.id)
    .single()

  if (pErr) throw createError({ statusCode: 500, statusMessage: 'profile_fetch_failed', data: pErr.message })
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'profile_not_found' })
  if (profile.role !== 'student') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  // 3) Pull this student’s thesis requests (newest first)
  // Keep it simple for MVP; we’ll add richer joins later if needed.
  const { data, error } = await supabase
    .from('thesis_requests')
    .select('id, title, field, status, created_at, proposed_date, proposed_location')
    .eq('student_profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: 'fetch_failed', data: error.message })

  // 4) Lightweight derived flag so your UI can show the “Allocation” action
  // (For MVP we treat `assigned` as “has allocation”. You can switch to a real join later.)
  const out = (data ?? []).map((t) => ({
    ...t,
    has_allocation: t.status === 'assigned'
  }))

  return { ok: true, data: out }
})
