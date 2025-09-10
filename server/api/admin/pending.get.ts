// server/api/admin/pending.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // client bound to the incoming request (reads session cookie)
  const supabase = await serverSupabaseClient(event)

  // 1) get current authenticated user from the request
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }
  const userId = userData.user.id

  // 2) ensure the caller is an approved admin (can read own profile)
  const { data: callerProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role,approved')
    .eq('id', userId)
    .single<{ role: string; approved: boolean }>()

  if (profileErr || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }

  // 3) run privileged queries using the service-role client (bypass RLS)
  const admin = serverSupabaseServiceRole(event)

  const { data: pending, error } = await admin
    .from('profiles')
    .select('id,full_name,student_number,created_at')
    .eq('role', 'student')
    .eq('approved', false)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // optional: call RPC/dashboard stats using admin client; adjust if you don't have RPC
  const { data: stats, error: statsErr } = await admin.rpc('dashboard_stats')
  if (statsErr) {
    // not fatal — return pending anyway and log if needed
    console.warn('dashboard_stats RPC error:', statsErr)
  }

  return { pending, stats }
})
