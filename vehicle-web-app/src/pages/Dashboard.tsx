import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CarIcon,
  CalendarClockIcon,
  BellIcon,
  GaugeIcon,
  ArrowRightIcon,
  MapPinnedIcon,
  WrenchIcon 
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  HealthRing,
  Badge 
} from '../components/ui/primitives';
import { StatCard } from '../components/shared/StatCard.tsx';
import { StatusBadge, fmtDate, fmtShort } from '../components/shared/helpers';
import { vehicles, stations, currentUser } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const { appointments, reminders } = useApp();
  
  const upcoming = appointments
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    
  const unread = reminders.filter((r) => !r.read);
  
  const avgHealth = Math.round(
    vehicles.reduce((s, v) => s + v.healthScore, 0) / vehicles.length
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${currentUser.name.split(' ')[0]}`}
        subtitle="Here's what's happening across your vehicles today."
        action={
          <Link to="/book">
            <Button>
              <MapPinnedIcon className="h-4 w-4" />
              Book a service
            </Button>
          </Link>
        } 
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CarIcon}
          label="Vehicles"
          value={String(vehicles.length)}
          index={0} 
        />
        
        <StatCard
          icon={GaugeIcon}
          label="Avg. health score"
          value={`${avgHealth}%`}
          trend={{
            value: '3%',
            up: true
          }}
          index={1} 
        />
        
        <StatCard
          icon={CalendarClockIcon}
          label="Upcoming services"
          value={String(upcoming.length)}
          index={2} 
        />
        
        <StatCard
          icon={BellIcon}
          label="Unread reminders"
          value={String(unread.length)}
          index={3} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicles */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Your vehicles
            </h2>
            <Link
              to="/vehicles"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/vehicles/${v.id}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-pop">
                    <div className="relative h-32 overflow-hidden bg-slate-100">
                      <img
                        src={v.imageUrl}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute right-3 top-3 rounded-full bg-white/90 p-0.5 backdrop-blur">
                        <HealthRing score={v.healthScore} size={40} />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {v.nickname}
                        </p>
                        <Badge>{v.plate}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {v.year} {v.make} {v.model}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{v.mileage.toLocaleString()} mi</span>
                        <span>Service due {fmtShort(v.nextServiceDue)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming appointments */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Upcoming
              </h2>
              <Link
                to="/records"
                className="text-sm font-medium text-accent hover:underline"
              >
                History
              </Link>
            </div>
            <Card className="divide-y divide-slate-100">
              {upcoming.length === 0 && (
                <p className="p-4 text-sm text-slate-500">
                  No upcoming appointments.
                </p>
              )}
              {upcoming.slice(0, 3).map((a) => {
                const v = vehicles.find((x) => x.id === a.vehicleId);
                const s = stations.find((x) => x.id === a.stationId);
                return (
                  <div key={a.id} className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent">
                      <WrenchIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {a.serviceType}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {v?.nickname} · {s?.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {fmtDate(a.date)} · {a.time}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </Card>
          </section>

          {/* Reminders */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Reminders
              </h2>
              <Link
                to="/reminders"
                className="text-sm font-medium text-accent hover:underline"
              >
                All
              </Link>
            </div>
            <Card className="divide-y divide-slate-100">
              {unread.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  to="/reminders"
                  className="block p-4 transition-colors hover:bg-slate-50"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {r.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {r.message}
                  </p>
                </Link>
              ))}
              {unread.length === 0 && (
                <p className="p-4 text-sm text-slate-500">
                  You're all caught up.
                </p>
              )}
            </Card>
          </section>
        </div>
      </div>

      {/* Nearby stations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Nearby service stations
          </h2>
          <Link
            to="/book"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Open map <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stations.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="h-24 overflow-hidden bg-slate-100">
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {s.distanceKm} km away
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone="amber">★ {s.rating}</Badge>
                  <Badge tone={s.openNow ? 'green' : 'slate'}>
                    {s.openNow ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}