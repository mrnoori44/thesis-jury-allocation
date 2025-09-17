// export default defineNuxtRouteMiddleware(async (to, from) => {
//     const { data: user } = await useSupabaseUser()
//     if (!user.value) {
//       return navigateTo('/login')
//     }
  
//     // fetch profile quickly (client-side) — you can also check server-side in layout
//     const { data: profile } = await useFetch(`/api/profile/${user.value.id}`)
//     if (!profile.value || profile.value.role !== 'admin' || !profile.value.approved) {
//       return navigateTo('/')
//     }
//   })