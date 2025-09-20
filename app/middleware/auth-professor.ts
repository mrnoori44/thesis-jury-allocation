// middleware/auth-professor.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  const client = useSupabaseClient()
  const { data: pp } = await client.from('professor_profiles').select('id').eq('profile_id', user.value.id).maybeSingle()
  if (!pp) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
})
