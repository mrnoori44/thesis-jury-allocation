// middleware/auth-student.ts
import type { Database } from '~~/types/database.types'
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }

  const client = useSupabaseClient<Database>()
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, role, approved')
    .eq('id', user.value.id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'profile_fetch_failed' })
  }
  if (!profile || profile.role !== 'student') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  // Optional: gate access until admin approves the student
  // if (!profile.approved) {
  //   return navigateTo('/student/pending-approval')
  // }
})
