import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinnedIcon,
  ShieldIcon,
  LeafIcon,
  WrenchIcon,
  DownloadIcon } from
'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  HealthRing,
  Badge,
  EmptyState } from
'../components/ui/primitives';
import { StatusBadge, fmtDate, currency } from '../components/shared/helpers';
import { vehicles, serviceLogs, stations } from '../data/mockData';
import { useApp } from '../context/AppContext';
export function VehicleDetail() {
  const { id } = useParams();
  const { appointments, toast } = useApp();
  const v = vehicles.find((x) => x.id === id);
  if (!v) {
    return (
      <EmptyState
        icon={<WrenchIcon className="h-6 w-6" />}
        title="Vehicle not found"
        description="This vehicle may have been removed."
        action={
        <Link to="/vehicles">
            <Button variant="secondary">Back to vehicles</Button>
          </Link>
        } />);


  }
  const logs = serviceLogs.filter((l) => l.vehicleId === v.id);
  const appts = appointments.filter((a) => a.vehicleId === v.id);
  return (
    <div className="space-y-6">
      <Link
        to="/vehicles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        
        <ArrowLeftIcon className="h-4 w-4" /> All vehicles
      </Link>

      <PageHeader
        title={v.nickname}
        subtitle={`${v.year} ${v.make} ${v.model} · ${v.plate}`}
        action={
        <Link to="/book">
            <Button>
              <MapPinnedIcon className="h-4 w-4" />
              Book service
            </Button>
          </Link>
        } />
      

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="h-56 overflow-hidden bg-slate-100 sm:h-72">
            <img
              src={v.imageUrl}
              alt={`${v.year} ${v.make} ${v.model}`}
              className="h-full w-full object-cover" />
            
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-3">
            {[
            ['VIN', v.vin],
            ['Mileage', `${v.mileage.toLocaleString()} mi`],
            ['Color', v.color],
            ['Plate', v.plate],
            ['Next service', fmtDate(v.nextServiceDue)],
            ['Year', String(v.year)]].
            map(([k, val]) =>
            <div key={k}>
                <dt className="text-xs text-slate-400">{k}</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-800">
                  {val}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="flex items-center gap-4 p-6">
            <HealthRing score={v.healthScore} size={72} />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Health score
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Based on service history & mileage.
              </p>
            </div>
          </Card>

          <Card className="divide-y divide-slate-100">
            <ComplianceRow
              icon={ShieldIcon}
              label="Insurance"
              date={v.insuranceExpiry} />
            
            <ComplianceRow
              icon={LeafIcon}
              label="Emission test"
              date={v.emissionExpiry} />
            
          </Card>
        </div>
      </div>

      {/* Appointments */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Appointments</h2>
        <Card className="divide-y divide-slate-100">
          {appts.length === 0 &&
          <p className="p-4 text-sm text-slate-500">
              No appointments for this vehicle.
            </p>
          }
          {appts.map((a) => {
            const s = stations.find((x) => x.id === a.stationId);
            return (
              <div key={a.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {a.serviceType}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s?.name} · {fmtDate(a.date)} · {a.time}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>);

          })}
        </Card>
      </section>

      {/* Service history + mileage timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Service history
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Downloading records… (demo)')}>
            
            <DownloadIcon className="h-4 w-4" /> Export
          </Button>
        </div>
        {logs.length === 0 ?
        <EmptyState
          icon={<WrenchIcon className="h-6 w-6" />}
          title="No service records yet"
          description="Records will appear here after your first logged service visit." /> :


        <ol className="relative space-y-4 border-l border-slate-200 pl-6">
            {logs.map((l) =>
          <li key={l.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-accent" />
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {l.serviceType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {l.stationName} · {fmtDate(l.date)} ·{' '}
                        {l.mileage.toLocaleString()} mi
                      </p>
                    </div>
                    <Badge tone="indigo">{currency(l.totalCost)}</Badge>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {l.workPerformed.map((w) =>
                <li key={w}>
                        <Badge>{w}</Badge>
                      </li>
                )}
                  </ul>
                </Card>
              </li>
          )}
          </ol>
        }
      </section>
    </div>);

}
function ComplianceRow({
  icon: Icon,
  label,
  date




}: {icon: React.ElementType;label: string;date: string;}) {
  const daysLeft = Math.ceil((+new Date(date) - Date.now()) / 86400000);
  const soon = daysLeft < 45;
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">Expires {fmtDate(date)}</p>
      </div>
      <Badge tone={soon ? 'amber' : 'green'}>{daysLeft} days</Badge>
    </div>);

}