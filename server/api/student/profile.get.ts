// server/api/student/profile.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // same pattern as your finalize.post.ts

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event) as unknown as SupabaseClient<Database>

  // 1) Auth
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  // 2) Fetch profile (must be student)
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, role, approved, full_name')
    .eq('id', user.id)
    .single()

  if (pErr) throw createError({ statusCode: 500, statusMessage: 'profile_fetch_failed', data: pErr.message })
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'profile_not_found' })
  if (profile.role !== 'student') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  // 3) Lightweight stats for UI (optional but useful)
  const { data: requests, error: rErr } = await supabase
    .from('thesis_requests')
    .select('id, status, created_at')
    .eq('student_profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (rErr) throw createError({ statusCode: 500, statusMessage: 'requests_fetch_failed', data: rErr.message })

  const latest = requests?.[0] ?? null

  // 4) Count requests (separate fast count; avoids selecting all rows)
  const { count, error: cErr } = await supabase
    .from('thesis_requests')
    .select('id', { count: 'exact', head: true })
    .eq('student_profile_id', profile.id)

  if (cErr) throw createError({ statusCode: 500, statusMessage: 'requests_count_failed', data: cErr.message })

  return {
    ok: true,
    data: {
      profile,                // { id, role, approved, full_name }
      stats: {
        total_requests: count ?? 0,
        latest_status: latest?.status ?? null,
        latest_created_at: latest?.created_at ?? null,
      }
    }
  }
})
