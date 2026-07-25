import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/features/auth/roles'

const NAV: Record<Role, { to: string; label: string }[]> = {
  vehicle_owner: [
    { to: '/garage', label: 'My Vehicles' },
    { to: '/book', label: 'Book Service' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/reminders', label: 'Reminders' },
  ],
  garage_owner: [
    { to: '/station', label: 'Dashboard' },
    { to: '/station/bookings', label: 'Bookings' },
    { to: '/station/jobs', label: 'Job Board' },
    { to: '/station/customers', label: 'Customers' },
    { to: '/station/reports', label: 'Reports' },
  ],
}

export function AppLayout() {
  const { user, role, signOut } = useAuth()
  const links = role ? NAV[role] : []

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-dvh max-w-[1440px] gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 p-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">
                R
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-950">Garaje</p>
                <p className="text-xs text-slate-500">Vehicle Management</p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-4 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
              >
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full',
                    link.to === '/garage' ? 'bg-indigo-500' : 'bg-slate-300',
                  ].join(' ')}
                />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <NavLink
              to="/settings"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Settings
            </NavLink>
            <button
              type="button"
              onClick={signOut}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white px-5 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] xl:flex-row xl:items-center xl:justify-between">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <input
                type="search"
                placeholder="Search vehicles, records, stations..."
                className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                {role === 'garage_owner' ? 'Garage owner' : 'Owner view'}
              </span>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500"
                aria-label="Notifications"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </button>
              <button
                type="button"
                className="flex items-center gap-3 rounded-full bg-slate-100 px-2 py-2 pr-4 text-sm font-medium text-slate-700"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 text-xs font-semibold text-slate-600">
                  {user?.email?.slice(0, 1).toUpperCase() ?? 'D'}
                </span>
                <span className="hidden sm:inline">{user?.email?.split('@')[0] ?? 'Daniel'}</span>
              </button>
            </div>
          </header>

          <main className="min-w-0 pb-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
