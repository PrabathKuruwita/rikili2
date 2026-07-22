/**
 * Rikili has two audiences: vehicle owners, and the garage side.
 *
 * These values mirror the `user_role` enum in Postgres exactly — see
 * supabase/migrations. Mechanics work under their garage owner's login rather
 * than having accounts of their own, which is why there is no separate
 * mechanic role: who did the work is recorded on the service record instead.
 */
export const ROLES = ['vehicle_owner', 'garage_owner'] as const

export type Role = (typeof ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/** Where each role lands after logging in. */
export const HOME_ROUTE: Record<Role, string> = {
  vehicle_owner: '/garage',
  garage_owner: '/station',
}
