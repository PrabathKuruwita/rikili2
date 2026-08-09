import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  CalendarDays,
  CarFront,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Users,
  Wrench,
} from 'lucide-react'
import type { Role } from '@/features/auth/roles'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

/**
 * Sidebar links, per role.
 *
 * Every `to` must be a path the router actually serves, under a RequireRole
 * guard that allows this role — otherwise the link bounces the user straight
 * back to their home route. Keep this in step with src/app/router.tsx.
 */
export const NAV: Record<Role, NavItem[]> = {
  vehicle_owner: [
    { to: '/garage', label: 'My Vehicles', icon: CarFront },
    { to: '/book', label: 'Book Service', icon: Wrench },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/reminders', label: 'Reminders', icon: BellRing },
  ],
  garage_owner: [
    { to: '/station', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/station/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/station/jobs', label: 'Job Board', icon: ListChecks },
    { to: '/station/customers', label: 'Customers', icon: Users },
    { to: '/station/reports', label: 'Reports', icon: Gauge },
  ],
}

/** Label for the role chip in the top bar. */
export const ROLE_LABEL: Record<Role, string> = {
  vehicle_owner: 'Owner view',
  garage_owner: 'Garage owner',
}
