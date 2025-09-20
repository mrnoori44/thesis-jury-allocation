// server/api/student/requests.post.ts
import { defineEventHandler, createError, readBody } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

type CreateReqBody = {
  title: string
  field: string
  abstract?: string
  proposed_date?: string | null   // 'YYYY-MM-DD' (optional)
  proposed_location?: string | null
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const body = await readBody<CreateReqBody>(event)
  if (!body?.title || !body?.field) {
    throw createError({ statusCode: 400, statusMessage: 'title_and_field_required' })
  }

  // 1) Ensure the caller is a student (and optionally approved)
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, role, full_name, approved')
    .eq('id', user.id)
    .single()
  if (pErr) throw createError({ statusCode: 500, statusMessage: 'profile_fetch_failed', data: pErr.message })
  if (!profile || profile.role !== 'student') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }
  // If you want to block unapproved students, uncomment:
  // if (!profile.approved) throw createError({ statusCode: 403, statusMessage: 'not_approved' })

  // 2) Insert the thesis request
  const authors = [
    { name: profile.full_name ?? 'دانشجو', role: 'author', profile_id: profile.id }
  ]

  const { data: inserted, error: insErr } = await supabase
    .from('thesis_requests')
    .insert({
      title: body.title,
      field: body.field,
      abstract: body.abstract ?? null,
      authors: authors as any,
      proposed_date: body.proposed_date ?? null,
      proposed_location: body.proposed_location ?? null,
      student_profile_id: profile.id,
      status: 'matching'
    })
    .select('id, title, field, status, proposed_date, proposed_location, created_at')
    .single()

  if (insErr) {
    throw createError({ statusCode: 500, statusMessage: 'insert_failed', data: insErr.message })
  }

  // 3) Invite initial candidates via RPC (SQL engine picks best by field + closest availability)
  //    Make sure you've created the SQL function public.invite_next_candidates(p_thesis uuid, p_limit int)
  const { data: invitedCount, error: rpcErr } =
  await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
    .rpc('invite_next_candidates', { p_thesis: inserted.id, p_limit: 3 })

  if (rpcErr) {
    // You can choose to proceed even if matching failed, but it's better to surface the error.
    throw createError({ statusCode: 500, statusMessage: 'match_invite_failed', data: rpcErr.message })
  }

  // 4) Optionally re-read status if you want the updated 'inviting' state from the RPC
  const { data: refreshed } = await supabase
    .from('thesis_requests')
    .select('id, title, field, status, proposed_date, proposed_location, created_at')
    .eq('id', inserted.id)
    .single()

  return {
    ok: true,
    data: {
      ...(refreshed ?? inserted),
      invited_count: invitedCount ?? 0,
    }
  }
})
