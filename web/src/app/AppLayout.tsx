import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/features/auth/roles'

const NAV: Record<Role, { to: string; label: string }[]> = {
  owner: [
    { to: '/garage', label: 'My Vehicles' },
    { to: '/book', label: 'Book Service' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/reminders', label: 'Reminders' },
  ],
  mechanic: [
    { to: '/station/jobs', label: 'Job Board' },
    { to: '/station/bookings', label: 'Bookings' },
  ],
  station_manager: [
    { to: '/station', label: 'Dashboard' },
    { to: '/station/bookings', label: 'Bookings' },
    { to: '/station/jobs', label: 'Job Board' },
    { to: '/station/customers', label: 'Customers' },
    { to: '/station/reports', label: 'Reports' },
  ],
  admin: [{ to: '/admin', label: 'Admin' }],
}

export function AppLayout() {
  const { user, role, signOut } = useAuth()
  const links = role ? NAV[role] : []

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link to="/" className="font-semibold tracking-tight text-slate-900">
            Rikili
          </Link>

          <nav className="flex flex-1 items-center gap-4 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  isActive ? 'font-medium text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <Outlet />
      </main>
    </div>
  )
}
