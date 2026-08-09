import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DownloadIcon,
  SearchIcon,
  FileTextIcon,
  PencilIcon,
  XCircleIcon,
  ClipboardListIcon } from
'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  Select,
  EmptyState } from
'../components/ui/primitives';
import { StatusBadge, fmtDate, currency } from '../components/shared/helpers';
import { BookingModal } from '../components/booking/BookingModal';
import { serviceLogs, vehicles, stations } from '../data/mockData';
import type { Appointment, Station } from '../types';
import { useApp } from '../context/AppContext';
export function ServiceRecords() {
  const { appointments, cancelAppointment, toast } = useApp();
  const [tab, setTab] = useState<'appointments' | 'logs'>('appointments');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<{
    station: Station;
    appt: Appointment;
  } | null>(null);
  const filteredAppts = useMemo(
    () =>
    appointments.
    filter((a) => vehicleFilter === 'all' || a.vehicleId === vehicleFilter).
    filter((a) =>
    a.serviceType.toLowerCase().includes(query.toLowerCase())
    ).
    sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [appointments, vehicleFilter, query]
  );
  const filteredLogs = useMemo(
    () =>
    serviceLogs.
    filter((l) => vehicleFilter === 'all' || l.vehicleId === vehicleFilter).
    filter(
      (l) =>
      l.serviceType.toLowerCase().includes(query.toLowerCase()) ||
      l.stationName.toLowerCase().includes(query.toLowerCase())
    ).
    sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [vehicleFilter, query]
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Records"
        subtitle="Your complete maintenance history, invoices, and appointments."
        action={
        <Button
          variant="secondary"
          onClick={() => toast('Exported records to CSV (demo)')}>
          
            <DownloadIcon className="h-4 w-4" /> Export all
          </Button>
        } />
      

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 sm:w-fit">
        {(['appointments', 'logs'] as const).map((t) =>
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`relative flex-1 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors sm:flex-none ${tab === t ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          
            {tab === t &&
          <motion.span
            layoutId="records-tab"
            className="absolute inset-0 rounded-md bg-accent"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 34
            }} />

          }
            <span className="relative">
              {t === 'logs' ? 'Digital Logs' : 'Appointments'}
            </span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records"
            className="pl-9"
            aria-label="Search records" />
          
        </div>
        <Select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="sm:w-52"
          aria-label="Filter by vehicle">
          
          <option value="all">All vehicles</option>
          {vehicles.map((v) =>
          <option key={v.id} value={v.id}>
              {v.nickname}
            </option>
          )}
        </Select>
      </div>

      {tab === 'appointments' ?
      <div className="space-y-3">
          {filteredAppts.length === 0 ?
        <EmptyState
          icon={<ClipboardListIcon className="h-6 w-6" />}
          title="No appointments found"
          description="Try adjusting your filters." /> :


        filteredAppts.map((a, i) => {
          const v = vehicles.find((x) => x.id === a.vehicleId);
          const s = stations.find((x) => x.id === a.stationId);
          return (
            <motion.div
              key={a.id}
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
              
                  <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {a.serviceType}
                        </p>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {v?.nickname} · {s?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {fmtDate(a.date)} · {a.time}
                      </p>
                    </div>
                    {a.status === 'upcoming' &&
                <div className="flex items-center gap-2">
                        <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                    s &&
                    setEditing({
                      station: s,
                      appt: a
                    })
                    }>
                    
                          <PencilIcon className="h-3.5 w-3.5" /> Modify
                        </Button>
                        <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      cancelAppointment(a.id);
                      toast('Appointment cancelled');
                    }}>
                    
                          <XCircleIcon className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                }
                  </Card>
                </motion.div>);

        })
        }
        </div> :

      <div className="space-y-3">
          {filteredLogs.length === 0 ?
        <EmptyState
          icon={<FileTextIcon className="h-6 w-6" />}
          title="No logs found"
          description="Try adjusting your filters." /> :


        filteredLogs.map((l, i) => {
          const v = vehicles.find((x) => x.id === l.vehicleId);
          return (
            <motion.div
              key={l.id}
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
              
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {l.serviceType}
                          </h3>
                          <Badge>{l.invoiceNo}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {v?.nickname} · {l.stationName} · {fmtDate(l.date)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {l.mileage.toLocaleString()} mi · Mechanic{' '}
                          {l.mechanic}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {currency(l.totalCost)}
                        </p>
                        <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                      toast(`Downloading ${l.invoiceNo}.pdf (demo)`)
                      }>
                      
                          <DownloadIcon className="h-3.5 w-3.5" /> Invoice
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Work performed
                        </p>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {l.workPerformed.map((w) =>
                      <li key={w} className="flex gap-2">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                              {w}
                            </li>
                      )}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Parts replaced
                        </p>
                        {l.partsReplaced.length === 0 ?
                    <p className="text-sm text-slate-400">None</p> :

                    <ul className="space-y-1 text-sm text-slate-600">
                            {l.partsReplaced.map((p) =>
                      <li key={p.name} className="flex justify-between">
                                <span>{p.name}</span>
                                <span className="text-slate-400">
                                  {currency(p.cost)}
                                </span>
                              </li>
                      )}
                          </ul>
                    }
                      </div>
                    </div>
                  </Card>
                </motion.div>);

        })
        }
        </div>
      }

      {editing &&
      <BookingModal
        station={editing.station}
        existing={editing.appt}
        onClose={() => setEditing(null)} />

      }
    </div>);

}