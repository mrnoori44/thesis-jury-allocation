// server/api/admin/reject.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // <- adjust path if needed

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body?.id as string | undefined
  const reason = body?.reason as string | null | undefined

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  // authenticate caller 0604755b
  const supabase = await serverSupabaseClient(event)
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }
  const callerId = userData.user.id

  // verify admin
  const { data: callerProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role,approved')
    .eq('id', callerId)
    .single() as any

  if (profileErr || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }

  // perform reject update with service-role client
  const admin = serverSupabaseServiceRole(event) as unknown as SupabaseClient<Database>

  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      approved: false
    } as Database['public']['Tables']['profiles']['Update'])
    .eq('id', id)

  if (updateErr) throw createError({ statusCode: 500, statusMessage: updateErr.message })

  // log rejection
  const { error: logErr } = await admin
    .from('profile_approvals')
    .insert({
      profile_id: id,
      action: 'rejected',
      actor: callerId,
      reason: reason ?? null
    } as Database['public']['Tables']['profile_approvals']['Insert'])

  if (logErr) throw createError({ statusCode: 500, statusMessage: logErr.message })

  // TODO: notify user via email

  return { ok: true }
})
