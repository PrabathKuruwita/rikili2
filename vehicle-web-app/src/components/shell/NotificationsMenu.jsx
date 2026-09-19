import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  WrenchIcon,
  DropletIcon,
  ShieldIcon,
  LeafIcon,
  CalendarCheckIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNowStrict } from 'date-fns';

const iconFor = {
  service: WrenchIcon,
  oil: DropletIcon,
  insurance: ShieldIcon,
  emission: LeafIcon,
  booking: CalendarCheckIcon,
};

const toneFor = {
  service: 'bg-indigo-50 text-indigo-600',
  oil: 'bg-amber-50 text-amber-600',
  insurance: 'bg-blue-50 text-blue-600',
  emission: 'bg-emerald-50 text-emerald-600',
  booking: 'bg-slate-100 text-slate-600',
};

export function NotificationsMenu() {
  const { reminders, markReminderRead, markAllRemindersRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const unread = reminders.filter((r) => !r.read).length;

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 6,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.98,
            }}
            transition={{
              duration: 0.14,
            }}
            className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop"
            role="menu"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                Notifications
              </p>
              {unread > 0 && (
                <button
                  onClick={markAllRemindersRead}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {reminders.map((r) => {
                const Icon = iconFor[r.type] || BellIcon;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => {
                        markReminderRead(r.id);
                        setOpen(false);
                        navigate('/reminders');
                      }}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        r.read ? '' : 'bg-accent-50/40'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          toneFor[r.type] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-slate-900">
                            {r.title}
                          </span>
                          {!r.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                          {r.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          Due in{' '}
                          {formatDistanceToNowStrict(new Date(r.dueDate))}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => {
                setOpen(false);
                navigate('/reminders');
              }}
              className="w-full border-t border-slate-100 py-2.5 text-center text-sm font-medium text-accent hover:bg-slate-50"
            >
              View all reminders
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
