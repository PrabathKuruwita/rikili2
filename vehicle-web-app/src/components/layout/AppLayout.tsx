import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  CarIcon,
  MapPinnedIcon,
  ClipboardListIcon,
  BellIcon,
  FileTextIcon,
  SettingsIcon,
  WrenchIcon,
  LogOutIcon,
  GaugeIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';
import { TopBar } from '../shell/TopBar';

const ownerNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/vehicles', label: 'My Vehicles', icon: CarIcon },
  { to: '/book', label: 'Book Service', icon: MapPinnedIcon },
  { to: '/records', label: 'Service Records', icon: ClipboardListIcon },
  { to: '/reminders', label: 'Reminders', icon: BellIcon },
  { to: '/reports', label: 'Reports', icon: FileTextIcon },
];

const stationNav = [
  { to: '/station', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/log-service', label: 'Log Service', icon: WrenchIcon },
  { to: '/reports', label: 'Reports', icon: FileTextIcon },
];

function AppLayout() {
  const { role, setRole, toastMessage } = useApp();
  const nav = role === 'owner' ? ownerNav : stationNav;

  function switchRole(next: UserRole) {
    setRole(next);
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside className="flex w-[230px] shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-7">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GaugeIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Garaje</p>
              <p className="text-[10px] text-slate-500">Vehicle Management</p>
            </div>
          </div>
          <nav className="space-y-1 px-3 py-7">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="space-y-1 border-t border-slate-200 px-3 py-5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-indigo-50 font-semibold text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <SettingsIcon className="h-5 w-5 shrink-0" />
            Settings
          </NavLink>

        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden">
          <header className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
              <GaugeIcon className="h-4 w-4" />
            </div>
            <p className="font-bold text-slate-900">Garaje</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`
              }
            >
              Settings
            </NavLink>
          </div>
          </header>
        </div>
        <TopBar />
        <main className="mx-auto w-full max-w-[1180px] flex-1 overflow-auto px-5 py-7 sm:px-8 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default AppLayout;