// server/api/admin/approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // <- adjust path if needed

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body?.id as string | undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  // 1) authenticate the caller based on session cookie
  const supabase = await serverSupabaseClient(event)
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }
  const callerId = userData.user.id

  // 2) verify caller is an approved admin
  const { data: callerProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role,approved')
    .eq('id', callerId)
    .single() as any

  if (profileErr || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }

  // 3) perform privileged update with service-role client (typed)
  const admin = serverSupabaseServiceRole(event) as unknown as SupabaseClient<Database>

  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: callerId
    } as Database['public']['Tables']['profiles']['Update'])
    .eq('id', id)

  if (updateErr) throw createError({ statusCode: 500, statusMessage: updateErr.message })

  // 4) insert audit/log
  const { error: logErr } = await admin
    .from('profile_approvals')
    .insert({
      profile_id: id,
      action: 'approved',
      actor: callerId
    } as Database['public']['Tables']['profile_approvals']['Insert'])

  if (logErr) {
    // not fatal, but surface as server error
    throw createError({ statusCode: 500, statusMessage: logErr.message })
  }

  // TODO: trigger approval email (Edge Function / external mailer)

  return { ok: true }
})
