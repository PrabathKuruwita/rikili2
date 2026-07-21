/**
 * Rikili has two audiences (see the spec): vehicle owners, and the garage side.
 * We model the garage side as two distinct roles because they see different
 * screens — a mechanic logs work, a manager runs the station.
 */
export const ROLES = ['owner', 'mechanic', 'station_manager', 'admin'] as const

export type Role = (typeof ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/** Where each role lands after logging in. */
export const HOME_ROUTE: Record<Role, string> = {
  owner: '/garage',
  mechanic: '/station/jobs',
  station_manager: '/station',
  admin: '/admin',
}
