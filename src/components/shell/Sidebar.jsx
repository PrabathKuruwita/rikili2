import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboardIcon,
  CarIcon,
  MapPinnedIcon,
  ClipboardListIcon,
  BellIcon,
  FileBarChartIcon,
  SettingsIcon,
  XIcon,
  GaugeIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ownerNav = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    end: true,
  },
  {
    to: '/vehicles',
    label: 'My Vehicles',
    icon: CarIcon,
  },
  {
    to: '/book',
    label: 'Book Service',
    icon: MapPinnedIcon,
  },
  {
    to: '/records',
    label: 'Service Records',
    icon: ClipboardListIcon,
  },
  {
    to: '/reminders',
    label: 'Reminders',
    icon: BellIcon,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileBarChartIcon,
  },
];

const stationNav = [
  {
    to: '/station',
    label: 'Station Dashboard',
    icon: GaugeIcon,
    end: true,
  },
  {
    to: '/log-service', // Updated to match our router config '/log-service' instead of '/station/logs' if we use the same route
    label: 'Log Service',
    icon: ClipboardListIcon,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileBarChartIcon,
  },
];

function NavItems({ onNavigate }) {
  const { role } = useApp();
  const items = role === 'owner' ? ownerNav : stationNav;
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? 'text-accent-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
        <GaugeIcon className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-slate-900">Garaje</p>
        <p className="text-[11px] text-slate-400">Vehicle Management</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <Brand />
      <NavItems />
      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-50 text-accent-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <SettingsIcon className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white"
            initial={{
              x: -280,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: -280,
            }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 34,
            }}
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <NavItems onNavigate={onClose} />
            <div className="px-3 pb-4">
              <NavLink
                to="/settings"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <SettingsIcon className="h-[18px] w-[18px] text-slate-400" />
                Settings
              </NavLink>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
