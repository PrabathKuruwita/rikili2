import React from 'react';
import { MenuIcon, SearchIcon } from 'lucide-react';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/primitives';

export function TopBar({ onOpenMenu }) {
  const { role } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="relative max-w-md flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search vehicles, records, stations…"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Badge
          tone={role === 'owner' ? 'indigo' : 'amber'}
          className="hidden md:inline-flex"
        >
          {role === 'owner' ? 'Owner view' : 'Station view'}
        </Badge>
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
