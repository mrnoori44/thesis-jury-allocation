// plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.SUPABASE_URL as string, config.public.SUPABASE_ANON_KEY as string)
  return {
    provide: {
      supabase
    }
  }
})
