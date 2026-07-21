import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { isRole, type Role } from './roles'

export type AuthState = {
  session: Session | null
  user: User | null
  role: Role | null
  /** True until we know whether a session exists. Gate redirects on this. */
  loading: boolean
  signOut: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | undefined>(undefined)

/**
 * Role lives in `app_metadata`, which only the server can write and which is
 * embedded in the JWT. That makes the same value usable in Postgres RLS
 * policies via `auth.jwt() -> 'app_metadata' ->> 'role'`.
 *
 * Never read a role out of `user_metadata` — users can edit that themselves.
 */
function readRole(user: User | null): Role | null {
  const value = user?.app_metadata?.role
  return isRole(value) ? value : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // getSession() resolves from localStorage first, so a refresh does not
    // flash the login page before the session is rehydrated.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      role: readRole(session?.user ?? null),
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
