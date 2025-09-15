// server/api/auth/finalize.post.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/types/database.types' // adjust if needed

export default defineEventHandler(async (event) => {
  // serverSupabaseClient(event) binds to the session cookie sent by the client,
  // so it runs as the authenticated user (auth.uid() available).
  const supabase = serverSupabaseClient(event) as unknown as SupabaseClient<Database>

  // 1) Auth via cookies (Nuxt helper)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const userEmail = (user.email || '').toLowerCase()
  const userId = user.id

  // check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existingProfile) {
    // already finalized
    return { ok: true, message: 'profile_exists' }
  }

  // find the signup request by email (case-insensitive)
  const { data: requests, error: reqErr } = await supabase
    .from('signup_requests')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false })
    .limit(1)

  if (reqErr) {
    throw createError({ statusCode: 500, statusMessage: reqErr.message })
  }

  const req = (requests && requests[0]) || null

  // create profile row with the data from the signup_request (or with defaults)
  const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
    id: userId,
    full_name: req?.full_name ?? null,
    role: 'student',
    student_number: req?.student_number ?? null,
    professor_number: null,
    degree: null,
    field_of_science: null,
    approved: false,
    approved_by: null,
    approved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // insert profile (this runs under the user's session, RLS permits insert when auth.uid() = id)
  const { error: insertErr } = await supabase
    .from('profiles')
    .insert(profilePayload)

  if (insertErr) {
    // possible conflict if someone else created it; return failure
    throw createError({ statusCode: 500, statusMessage: insertErr.message })
  }

  // update the signup_request to link it to user_id and change status
  if (req) {
    await supabase
      .from('signup_requests')
      .update({ user_id: userId, status: 'requested' })
      .eq('id', req.id)
  }

  // log the request in profile_approvals (using the user's identity is okay)
  await supabase.from('profile_approvals').insert({
    profile_id: userId,
    action: 'requested',
    actor: userId
  })

  // done
  return { ok: true, message: 'profile_created' }
})
