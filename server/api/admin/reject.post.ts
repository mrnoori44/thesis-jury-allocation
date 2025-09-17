// server/api/admin/reject.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // adjust path if needed

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body?.id as string | number | undefined
  const reason = (body?.reason as string | null | undefined) ?? null

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  // 1) authenticate caller via cookies (Nuxt helper)
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }
  const callerId = user.id

  // Use a user-scoped client (RLS enforced) for the role/approval check
  const supabase = await serverSupabaseClient<Database>(event)

  // 2) verify caller is approved admin
  const { data: callerProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role,approved')
    .eq('id', callerId)
    .single()
  if (profileErr || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }

  // 3) service-role admin client for privileged operations
  const admin = serverSupabaseServiceRole(event) as unknown as SupabaseClient<Database>

  // Decide whether id is numeric signup_request id or a profile id (uuid)
  let requestId: number | null = null
  let profileId: string | null = null

  const maybeReqId = Number(id)
  if (Number.isInteger(maybeReqId)) {
    // treat as signup_requests.id
    const { data: reqRow, error: reqErr } = await admin
      .from('signup_requests')
      .select('*')
      .eq('id', maybeReqId)
      .maybeSingle()

    if (reqErr) throw createError({ statusCode: 500, statusMessage: reqErr.message })

    if (!reqRow) {
      // No request found; fallback to treating id as profile id
      profileId = String(id)
    } else {
      requestId = maybeReqId
      if (reqRow.user_id) {
        profileId = reqRow.user_id
      } else {
        // No auth user created yet: mark request rejected and skip profile update
        const { error: rUpdateErr } = await admin
          .from('signup_requests')
          .update({ status: 'rejected' } as Database['public']['Tables']['signup_requests']['Update'])
          .eq('id', requestId)

        if (rUpdateErr) throw createError({ statusCode: 500, statusMessage: rUpdateErr.message })

        // Log the rejection (no profile_id available)
        const { error: logErr } = await admin
          .from('profile_approvals')
          .insert({
            profile_id: null,
            action: 'rejected',
            actor: callerId,
            reason
          } as Database['public']['Tables']['profile_approvals']['Insert'])

        if (logErr) throw createError({ statusCode: 500, statusMessage: logErr.message })

        return { ok: true, requestId, profileId: null }
      }
    }
  } else {
    // not numeric => assume profile uuid
    profileId = String(id)
  }

  if (!profileId) {
    throw createError({ statusCode: 400, statusMessage: 'Unable to determine profile to reject' })
  }

  // 4) Update profiles.approved = false for the profileId (if exists)
  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      approved: false
    } as Database['public']['Tables']['profiles']['Update'])
    .eq('id', profileId)

  if (updateErr) throw createError({ statusCode: 500, statusMessage: updateErr.message })

  // 5) Log the rejection in profile_approvals
  const { error: logErr } = await admin
    .from('profile_approvals')
    .insert({
      profile_id: profileId,
      action: 'rejected',
      actor: callerId,
      reason
    } as Database['public']['Tables']['profile_approvals']['Insert'])

  if (logErr) throw createError({ statusCode: 500, statusMessage: logErr.message })

  // 6) If we handled a signup_request, mark it rejected
  if (requestId) {
    const { error: rUpdateErr } = await admin
      .from('signup_requests')
      .update({ status: 'rejected' } as Database['public']['Tables']['signup_requests']['Update'])
      .eq('id', requestId)

    if (rUpdateErr) {
      // not fatal for the rejection, but log / surface warning
      console.warn('Failed to update signup_requests.status to rejected:', rUpdateErr)
    }
  }

  // TODO: optionally notify the applicant via email

  return { ok: true, profileId, requestId }
})
