import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from '@/types/database'

/**
 * The single Supabase client for the whole app.
 *
 * Import this — do not call createClient() anywhere else. Multiple clients each
 * keep their own auth state and will fight over the session in localStorage.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
