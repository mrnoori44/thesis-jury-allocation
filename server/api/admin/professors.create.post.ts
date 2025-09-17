// server/api/admin/professors.create.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/database.types'

type Body = {
  full_name?: string
  email?: string
  professor_number?: string
  degree?: string
  field_of_science?: string[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const full_name = (body.full_name || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const professor_number = (body.professor_number || '').trim()
  const degree = (body.degree || '').trim()
  const field_of_science = Array.isArray(body.field_of_science) ? body.field_of_science : []

  if (!full_name || !email || !professor_number || !degree || !field_of_science.length) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات ارسالی ناقص است.' })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'ایمیل نامعتبر است.' })
  }

  // 1) احراز هویت
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'ورود لازم است.' })
  const callerId = user.id

  // 2) بررسی نقش/تأیید ادمین با کلاینت کاربری (RLS)
  const userClient = await serverSupabaseClient<Database>(event)
  const { data: caller, error: callerErr } = await userClient
    .from('profiles')
    .select('role, approved')
    .eq('id', callerId)
    .single()

  if (callerErr || !caller || caller.role !== 'admin' || !caller.approved) {
    throw createError({ statusCode: 403, statusMessage: 'دسترسی مجاز نیست (فقط ادمین‌های تایید شده).' })
  }

  // 3) عملیات مدیریتی با Service Role
  const admin = await serverSupabaseServiceRole<Database>(event)

  // 3a) دعوت کاربر (ارسال ایمیل از طریق SMTP پیکربندی‌شده در Supabase)
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: 'professor', professor_number },
  })
  if (inviteErr || !invited?.user) {
    throw createError({ statusCode: 500, statusMessage: inviteErr?.message || 'خطا در دعوت کاربر' })
  }
  const newUserId = invited.user.id

  // 3b) درج پروفایل استاد
  const profileInsert: Database['public']['Tables']['profiles']['Insert'] = {
    id: newUserId,
    user_id: newUserId as any,
    full_name,
    role: 'professor' as any,
    professor_number,
    degree,
    field_of_science,
    approved: true as any,
    approved_at: new Date().toISOString(),
    approved_by: callerId,
  }
  const { error: profErr } = await admin.from('profiles').insert(profileInsert)
  if (profErr) {
    // در صورت خطا در درج پروفایل، کاربر احراز هویت را حذف می‌کنیم
    await admin.auth.admin.deleteUser(newUserId)
    throw createError({ statusCode: 500, statusMessage: profErr.message || 'خطا در ایجاد پروفایل استاد' })
  }

  return { ok: true, profileId: newUserId, userId: newUserId }
})