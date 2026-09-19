import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  DollarSignIcon,
  SearchIcon } from
'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  Input,
  Button } from
'../components/ui/primitives';
import { StatCard } from '../components/shared/StatCard.tsx';
import { stationBookings } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { currency } from '../components/shared/helpers';
const statusTone: Record<string, 'amber' | 'blue' | 'green' | 'slate'> = {
  'in-progress': 'amber',
  waiting: 'slate',
  completed: 'green'
};
export function StationDashboard() {
  const { toast } = useApp();
  const maxDay = Math.max(...stationBookings.daily);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Station Dashboard"
        subtitle="Precision Auto Care · 450 Bryant St" />
      

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarIcon}
          label="Bookings today"
          value={String(stationBookings.today)}
          index={0} />
        
        <StatCard
          icon={CalendarDaysIcon}
          label="This week"
          value={String(stationBookings.week)}
          trend={{
            value: '8%',
            up: true
          }}
          index={1} />
        
        <StatCard
          icon={CalendarRangeIcon}
          label="This month"
          value={String(stationBookings.month)}
          index={2} />
        
        <StatCard
          icon={DollarSignIcon}
          label="Revenue (mo)"
          value={currency(stationBookings.revenue)}
          trend={{
            value: '12%',
            up: true
          }}
          index={3} />
        
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Weekly bookings
          </h2>
          <div className="mt-6 flex h-48 items-end justify-between gap-3">
            {stationBookings.daily.map((val, i) =>
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                className="w-full rounded-t-md bg-accent"
                initial={{
                  height: 0
                }}
                animate={{
                  height: `${val / maxDay * 100}%`
                }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.4
                }}
                style={{
                  minHeight: 4
                }} />
              
                <span className="text-xs text-slate-400">{dayLabels[i]}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col justify-center p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Completion rate
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10" />
                
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{
                    strokeDashoffset: 2 * Math.PI * 42
                  }}
                  animate={{
                    strokeDashoffset:
                    2 *
                    Math.PI *
                    42 * (
                    1 - stationBookings.completionRate / 100)
                  }}
                  transition={{
                    duration: 0.7
                  }} />
                
              </svg>
              <span className="absolute text-xl font-semibold text-slate-900">
                {stationBookings.completionRate}%
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Jobs completed on schedule this month.
            </p>
          </div>
        </Card>
      </div>

      {/* Active jobs */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Active jobs
          </h2>
          <div className="relative sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search customer or plate…"
              className="pl-9"
              aria-label="Search jobs" />
            
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Mechanic</th>
                <th className="px-5 py-3 font-medium">Bay</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stationBookings.jobs.map((j) =>
              <tr key={j.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {j.customer}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {j.vehicle}{' '}
                    <span className="text-slate-400">· {j.plate}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{j.service}</td>
                  <td className="px-5 py-3 text-slate-600">{j.mechanic}</td>
                  <td className="px-5 py-3 text-slate-600">{j.bay || '—'}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[j.status]}>
                      {j.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                    toast(`Updated ${j.customer}'s job (demo)`)
                    }>
                    
                      Update
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}