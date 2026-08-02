import React, { useState } from 'react';
import { PlusIcon, Trash2Icon, SaveIcon, SearchIcon } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge } from
'../components/ui/primitives';
import { vehicles } from '../data/mockData';
import { currency } from '../components/shared/helpers';
import { useApp } from '../context/AppContext';
interface PartRow {
  id: number;
  name: string;
  cost: string;
}
export function LogService() {
  const { toast } = useApp();
  const [vehicleId, setVehicleId] = useState(vehicles[0].id);
  const [serviceType, setServiceType] = useState('Oil Change');
  const [mileage, setMileage] = useState('');
  const [work, setWork] = useState('');
  const [labor, setLabor] = useState('');
  const [parts, setParts] = useState<PartRow[]>([
  {
    id: 1,
    name: '',
    cost: ''
  }]
  );
  const partsTotal = parts.reduce((s, p) => s + (parseFloat(p.cost) || 0), 0);
  const total = partsTotal + (parseFloat(labor) || 0);
  function addPart() {
    setParts((p) => [
    ...p,
    {
      id: Date.now(),
      name: '',
      cost: ''
    }]
    );
  }
  function updatePart(id: number, key: 'name' | 'cost', value: string) {
    setParts((p) =>
    p.map((r) =>
    r.id === id ?
    {
      ...r,
      [key]: value
    } :
    r
    )
    );
  }
  function removePart(id: number) {
    setParts((p) => p.length === 1 ? p : p.filter((r) => r.id !== id));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast('Service log saved & invoice generated (demo)');
    setWork('');
    setLabor('');
    setMileage('');
    setParts([
    {
      id: 1,
      name: '',
      cost: ''
    }]
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Service"
        subtitle="Record work performed, parts, and mileage for a completed visit." />
      

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="space-y-5 lg:col-span-2">
          <Card className="space-y-5 p-6">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search customer vehicle by plate or VIN…"
                className="pl-9"
                aria-label="Search vehicle" />
              
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Vehicle
                </span>
                <Select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}>
                  
                  {vehicles.map((v) =>
                  <option key={v.id} value={v.id}>
                      {v.nickname} — {v.make} {v.model} ({v.plate})
                    </option>
                  )}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Service type
                </span>
                <Select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}>
                  
                  {[
                  'Oil Change',
                  'Full Service',
                  'Brakes',
                  'Tires',
                  'Diagnostics',
                  'Emission Test',
                  'Transmission'].
                  map((s) =>
                  <option key={s}>{s}</option>
                  )}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Current mileage
                </span>
                <Input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 34500"
                  required />
                
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Labor cost ($)
                </span>
                <Input
                  type="number"
                  value={labor}
                  onChange={(e) => setLabor(e.target.value)}
                  placeholder="e.g. 120" />
                
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Work performed
              </span>
              <textarea
                value={work}
                onChange={(e) => setWork(e.target.value)}
                rows={3}
                placeholder="Describe the work carried out…"
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required />
              
            </label>
          </Card>

          {/* Parts */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Parts replaced
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addPart}>
                
                <PlusIcon className="h-3.5 w-3.5" /> Add part
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {parts.map((p) =>
              <div key={p.id} className="flex items-center gap-3">
                  <Input
                  value={p.name}
                  onChange={(e) => updatePart(p.id, 'name', e.target.value)}
                  placeholder="Part name"
                  className="flex-1"
                  aria-label="Part name" />
                
                  <Input
                  type="number"
                  value={p.cost}
                  onChange={(e) => updatePart(p.id, 'cost', e.target.value)}
                  placeholder="Cost"
                  className="w-28"
                  aria-label="Part cost" />
                
                  <button
                  type="button"
                  onClick={() => removePart(p.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove part">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">
              <SaveIcon className="h-4 w-4" /> Save log & generate invoice
            </Button>
          </div>
        </form>

        {/* Summary */}
        <div>
          <Card className="sticky top-24 p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Invoice summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Service</dt>
                <dd className="font-medium text-slate-800">{serviceType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Parts</dt>
                <dd className="font-medium text-slate-800">
                  {currency(partsTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Labor</dt>
                <dd className="font-medium text-slate-800">
                  {currency(parseFloat(labor) || 0)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-lg font-semibold text-slate-900">
                  {currency(total)}
                </dd>
              </div>
            </dl>
            <Badge tone="green" className="mt-4">
              Auto-synced to owner records
            </Badge>
          </Card>
        </div>
      </div>
    </div>);

}