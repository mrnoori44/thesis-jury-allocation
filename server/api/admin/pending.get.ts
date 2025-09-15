// server/api/admin/pending.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole , serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../types/database.types' // adjust path if needed

export default defineEventHandler(async (event) => {
  // 1) Trust Nuxt’s helper to read the auth cookies
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }

  // 2) Use a user-scoped client (RLS enforced)
  const supabase = await serverSupabaseClient<Database>(event)

  // 3) Your existing admin check (example)
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, approved')
    .eq('id', user.id)
    .maybeSingle()

  if (profileErr) throw createError({ statusCode: 500, statusMessage: profileErr.message })
  if (!profile || profile.role !== 'admin' || !profile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }
  // privileged client (service role) to bypass RLS for fetching signup requests
  const admin = serverSupabaseServiceRole(event) as unknown as SupabaseClient<Database>

  // typed statuses (matches Database union)
  const pendingStatuses: Database['public']['Tables']['signup_requests']['Row']['status'][] = [
    'pending_confirmation',
    'requested'
  ]

  const { data: requests, error: reqErr } = await admin
    .from('signup_requests')
    .select('id, email, full_name, student_number, user_id, status, created_at, updated_at')
    .in('status', pendingStatuses)
    .order('created_at', { ascending: false })

  if (reqErr) throw createError({ statusCode: 500, statusMessage: reqErr.message })

  // optional stats RPC (uncomment if you have it)
  // const { data: stats, error: statsErr } = await admin.rpc('dashboard_stats')
  // if (statsErr) console.warn('dashboard_stats RPC error:', statsErr)

  return {
    requests: requests ?? [],
    // stats: stats ?? null
  }
})
