import { ChevronRight, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { NAV } from '@/app/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { Badge } from '@/components/ui/badge'

const ITEM_BASE =
  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:translate-x-1'

export function Sidebar() {
  const { role, signOut } = useAuth()
  const links = role ? NAV[role] : []

  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-5 py-6">
        <Link to="/" className="flex items-center gap-3 px-1 pb-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <span className="text-sm font-bold">M</span>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">MyVehicle</p>
            <p className="text-sm text-slate-500">Vehicle Management</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                [
                  ITEM_BASE,
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon
                      className={['h-4 w-4', isActive ? 'text-white' : 'text-slate-400'].join(' ')}
                    />
                    {label}
                  </span>
                  {isActive ? <ChevronRight className="h-4 w-4 text-white/80" /> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your fleet organized and service-ready.
                </p>
              </div>
              <Badge variant="outline">Pro</Badge>
            </div>
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                ITEM_BASE,
                'mt-4',
                isActive
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')
            }
          >
            <span className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </span>
          </NavLink>

          <button
            type="button"
            onClick={signOut}
            className={[
              ITEM_BASE,
              'w-full text-left text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            ].join(' ')}
          >
            <span className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Sign out
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
