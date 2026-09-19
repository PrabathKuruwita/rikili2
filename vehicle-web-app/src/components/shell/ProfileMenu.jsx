import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  RepeatIcon,
  ChevronDownIcon,
  CheckIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { currentUser } from '../../data/mockData';

export function ProfileMenu() {
  const { role, setRole, toast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function switchRole(next) {
    setRole(next);
    setOpen(false);
    if (toast) {
      toast(
        next === 'owner'
          ? 'Switched to Vehicle Owner view'
          : 'Switched to Station Manager view'
      );
    }
    navigate(next === 'owner' ? '/dashboard' : '/station');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <img
          src={currentUser.avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="hidden text-sm font-medium text-slate-700 sm:block">
          {currentUser.name.split(' ')[0]}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
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
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop"
            role="menu"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="p-1.5">
              <MenuItem
                icon={UserIcon}
                label="Profile"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings');
                }}
              />
              <MenuItem
                icon={SettingsIcon}
                label="Settings"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings');
                }}
              />
            </div>

            <div className="border-t border-slate-100 p-1.5">
              <p className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Switch view
              </p>
              <RoleItem
                label="Vehicle Owner"
                active={role === 'owner'}
                onClick={() => switchRole('owner')}
              />
              <RoleItem
                label="Station Manager"
                active={role === 'station'}
                onClick={() => switchRole('station')}
              />
            </div>

            <div className="border-t border-slate-100 p-1.5">
              <MenuItem
                icon={LogOutIcon}
                label="Sign out"
                danger
                onClick={() => {
                  setOpen(false);
                  if (toast) toast('Signed out (demo)');
                  navigate('/login');
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function RoleItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      role="menuitemradio"
      aria-checked={active}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      <span className="flex items-center gap-3">
        <RepeatIcon className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      {active && <CheckIcon className="h-4 w-4 text-accent" />}
    </button>
  );
}
