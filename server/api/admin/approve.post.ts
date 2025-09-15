// server/api/admin/approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // adjust if your types path differs

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body?.id as string | number | undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  // 1) authenticate caller via cookies (Nuxt helper)
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }
  const callerId = user.id

  // Use a user-scoped client (RLS enforced) for the role/approval check
  const supabase = await serverSupabaseClient<Database>(event)

  // 2) verify caller is an approved admin
  const { data: callerProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role,approved')
    .eq('id', callerId)
    .single()
  if (profileErr || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.approved) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }

  // 3) Use service-role client for privileged operations
  const admin = serverSupabaseServiceRole(event) as unknown as SupabaseClient<Database>

  // Determine whether the supplied id is a numeric signup_request id (pending request)
  // or a profiles.id (uuid). If it's numeric and matches a signup_requests row we handle it as a request.
  let requestId: number | null = null
  let profileId: string | null = null

  const maybeReqId = Number(id)
  if (Number.isInteger(maybeReqId)) {
    // try to find signup_request with this id
    const { data: reqRow, error: reqErr } = await admin
      .from('signup_requests')
      .select('*')
      .eq('id', maybeReqId)
      .maybeSingle()

    if (reqErr) throw createError({ statusCode: 500, statusMessage: reqErr.message })

    if (!reqRow) {
      // No signup_request found with this numeric id → treat as profile id fallback
      profileId = String(id)
    } else {
      requestId = maybeReqId
      // If the signup request references a user_id (the user already confirmed), approve that profile
      if (reqRow.user_id) {
        profileId = reqRow.user_id
      } else {
        // user has not yet confirmed email / no auth user exists — cannot approve profile yet
        throw createError({
          statusCode: 400,
          statusMessage:
            'Applicant has not confirmed their email yet — cannot approve. Wait until they confirm or contact them.'
        })
      }
    }
  } else {
    // not numeric -> assume it's profile UUID
    profileId = String(id)
  }

  if (!profileId) {
    throw createError({ statusCode: 400, statusMessage: 'Unable to determine profile to approve' })
  }

  const nowIso = new Date().toISOString()
  const upsertPayload: Database['public']['Tables']['profiles']['Insert'] = {
    id: profileId,
    approved: true,
    approved_at: nowIso,
    approved_by: callerId
  }
  const { error: upsertErr } = await admin
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' })
  if (upsertErr) throw createError({ statusCode: 500, statusMessage: upsertErr.message })

  // 6) Audit log — now safe because profiles(id) exists
  const { error: logErr } = await admin
    .from('profile_approvals')
    .insert({
      profile_id: profileId,
      action: 'approved',
      actor: callerId,
      // optional: metadata fields if your schema has them
      // reason: null,
      // created_at: nowIso
    } as Database['public']['Tables']['profile_approvals']['Insert'])
  if (logErr) throw createError({ statusCode: 500, statusMessage: logErr.message })

  // 7) Mark the signup request processed (optional)
  if (requestId) {
    const { error: rUpdateErr } = await admin
      .from('signup_requests')
      .update({ status: 'processed' } as Database['public']['Tables']['signup_requests']['Update'])
      .eq('id', requestId)
    if (rUpdateErr) {
      // Not fatal; surface as warning
      console.warn('Failed to update signup_requests.status:', rUpdateErr)
    }
  }

  // TODO: send approval email via Edge Function / mailer (do not use service role on client)

  return { ok: true, profileId, requestId }
})
