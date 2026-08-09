import React from 'react';
import { motion } from 'framer-motion';
import {
  FileTextIcon,
  DownloadIcon,
  DollarSignIcon,
  WrenchIcon,
  TrendingUpIcon } from
'lucide-react';
import { PageHeader, Card, Button, Badge } from '../components/ui/primitives';
import { fmtDate, currency } from '../components/shared/helpers';
import { StatCard } from '../components/shared/StatCard';
import { vehicles, serviceLogs } from '../data/mockData';
import { useApp } from '../context/AppContext';
export function Reports() {
  const { role, toast } = useApp();
  const totalSpend = serviceLogs.reduce((s, l) => s + l.totalCost, 0);
  const services = serviceLogs.length;
  // spend per vehicle for a simple bar chart
  const perVehicle = vehicles.map((v) => ({
    name: v.nickname,
    total: serviceLogs.
    filter((l) => l.vehicleId === v.id).
    reduce((s, l) => s + l.totalCost, 0)
  }));
  const maxSpend = Math.max(...perVehicle.map((p) => p.total), 1);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Exports"
        subtitle={
        role === 'owner' ?
        'Prove your vehicle upkeep with comprehensive service-history reports.' :
        'Operational and performance reporting for your station.'
        } />
      

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          icon={DollarSignIcon}
          label="Total maintenance spend"
          value={currency(totalSpend)}
          index={0} />
        
        <StatCard
          icon={WrenchIcon}
          label="Services completed"
          value={String(services)}
          index={1} />
        
        <StatCard
          icon={TrendingUpIcon}
          label="Avg. cost / visit"
          value={currency(Math.round(totalSpend / services))}
          index={2} />
        
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Spend by vehicle
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Lifetime maintenance cost per vehicle.
          </p>
          <div className="mt-6 space-y-4">
            {perVehicle.map((p, i) =>
            <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-slate-500">{currency(p.total)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{
                    width: 0
                  }}
                  animate={{
                    width: `${p.total / maxSpend * 100}%`
                  }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.5
                  }} />
                
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Downloadable reports */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Generate report
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Export a PDF of your service history.
          </p>
          <div className="mt-5 space-y-3">
            {[
            {
              label: 'Full service history (all vehicles)',
              tone: 'indigo' as const
            },
            {
              label: 'Per-vehicle upkeep certificate',
              tone: 'blue' as const
            },
            {
              label: 'Annual maintenance summary',
              tone: 'green' as const
            }].
            map((r) =>
            <div
              key={r.label}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileTextIcon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {r.label}
                </span>
                <Button
                variant="secondary"
                size="sm"
                onClick={() => toast('Generating PDF report… (demo)')}>
                
                  <DownloadIcon className="h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent invoices table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Recent invoices
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast('Exported to CSV (demo)')}>
            
            <DownloadIcon className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceLogs.map((l) => {
                const v = vehicles.find((x) => x.id === l.vehicleId);
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Badge>{l.invoiceNo}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{v?.nickname}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {l.serviceType}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {fmtDate(l.date)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">
                      {currency(l.totalCost)}
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}