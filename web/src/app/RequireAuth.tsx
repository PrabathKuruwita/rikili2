import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { HOME_ROUTE, type Role } from '@/features/auth/roles'

/**
 * Route guards.
 *
 * These are a UX convenience, not a security boundary. Anyone can edit the
 * bundle and render any page. The real enforcement is Row Level Security in
 * Postgres — a guarded page whose queries are not covered by RLS is a bug.
 */

function Loading() {
  return <div className="grid min-h-dvh place-items-center text-slate-500">Loading…</div>
}

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />
  if (!session) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export function RequireRole({ allow }: { allow: Role[] }) {
  const { role, loading } = useAuth()

  if (loading) return <Loading />
  if (!role) return <Navigate to="/onboarding" replace />
  if (!allow.includes(role)) return <Navigate to={HOME_ROUTE[role]} replace />

  return <Outlet />
}
