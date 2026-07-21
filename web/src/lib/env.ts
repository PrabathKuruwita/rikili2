/**
 * Validated environment access.
 *
 * Importing this module fails loudly at startup if config is missing, instead
 * of surfacing as a confusing "Invalid API key" error on the first query.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. ` +
        `Copy web/.env.example to web/.env.local and fill it in, then restart the dev server.`,
    )
  }
  return value
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
} as const
