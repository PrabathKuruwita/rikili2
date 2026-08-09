import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  WrenchIcon,
  DropletIcon,
  ShieldIcon,
  LeafIcon,
  CalendarCheckIcon,
  MailIcon,
  SmartphoneIcon,
  BellIcon,
  CheckCheckIcon } from
'lucide-react';
import { PageHeader, Card, Button, Badge } from '../components/ui/primitives';
import { fmtDate } from '../components/shared/helpers';
import { vehicles } from '../data/mockData';
import type { ReminderType } from '../types';
import { useApp } from '../context/AppContext';
import { formatDistanceToNowStrict } from 'date-fns';
const iconFor: Record<ReminderType, React.ElementType> = {
  service: WrenchIcon,
  oil: DropletIcon,
  insurance: ShieldIcon,
  emission: LeafIcon,
  booking: CalendarCheckIcon
};
const toneFor: Record<ReminderType, string> = {
  service: 'bg-indigo-50 text-indigo-600',
  oil: 'bg-amber-50 text-amber-600',
  insurance: 'bg-blue-50 text-blue-600',
  emission: 'bg-emerald-50 text-emerald-600',
  booking: 'bg-slate-100 text-slate-600'
};
const channelIcon = {
  email: MailIcon,
  sms: SmartphoneIcon,
  push: BellIcon
};
export function Reminders() {
  const { reminders, markReminderRead, markAllRemindersRead, toast } = useApp();
  const [filter, setFilter] = useState<'all' | ReminderType>('all');
  const filtered = reminders.
  filter((r) => filter === 'all' || r.type === filter).
  sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const filters: {
    key: 'all' | ReminderType;
    label: string;
  }[] = [
  {
    key: 'all',
    label: 'All'
  },
  {
    key: 'service',
    label: 'Service'
  },
  {
    key: 'oil',
    label: 'Oil'
  },
  {
    key: 'insurance',
    label: 'Insurance'
  },
  {
    key: 'emission',
    label: 'Emission'
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders & Notifications"
        subtitle="Automated service, oil, insurance, and emission alerts across your vehicles."
        action={
        <Button variant="secondary" onClick={markAllRemindersRead}>
            <CheckCheckIcon className="h-4 w-4" /> Mark all read
          </Button>
        } />
      

      <div className="flex flex-wrap gap-2">
        {filters.map((f) =>
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${filter === f.key ? 'border-accent bg-accent-50 text-accent-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          
            {f.label}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => {
          const Icon = iconFor[r.type];
          const v = vehicles.find((x) => x.id === r.vehicleId);
          return (
            <motion.div
              key={r.id}
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.04
              }}>
              
              <Card
                className={`flex items-start gap-4 p-4 ${r.read ? '' : 'ring-1 ring-accent/20'}`}>
                
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneFor[r.type]}`}>
                  
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.title}
                    </p>
                    {!r.read &&
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    }
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{r.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge>{v?.nickname}</Badge>
                    <span className="text-xs text-slate-400">
                      Due {fmtDate(r.dueDate)} · in{' '}
                      {formatDistanceToNowStrict(new Date(r.dueDate))}
                    </span>
                    <span className="flex items-center gap-1">
                      {r.channel.map((c) => {
                        const CI = channelIcon[c];
                        return (
                          <span
                            key={c}
                            className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-400"
                            title={c}>
                            
                            <CI className="h-3 w-3" />
                          </span>);

                      })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {!r.read &&
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReminderRead(r.id)}>
                    
                      Mark read
                    </Button>
                  }
                  <Button
                    size="sm"
                    onClick={() => toast('Opening booking flow (demo)')}>
                    
                    Schedule
                  </Button>
                </div>
              </Card>
            </motion.div>);

        })}
      </div>
    </div>);

}