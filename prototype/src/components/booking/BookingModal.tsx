import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button, Input, Select } from '../ui/primitives';
import { vehicles } from '../../data/mockData';
import type { Appointment, Station } from '../../types';
import { useApp } from '../../context/AppContext';

const TIME_SLOTS = [
  '9:00 AM',
  '10:30 AM',
  '12:00 PM',
  '2:00 PM',
  '3:30 PM',
  '5:00 PM',
];

const SERVICE_TYPES = [
  'Oil Change',
  'Full Service',
  'Brakes',
  'Tires',
  'Diagnostics',
  'Emission Test',
  'EV Service',
];

export function BookingModal({
  station,
  existing,
  onClose,
}: {
  station: Station;
  existing?: Appointment;
  onClose: () => void;
}) {
  const { bookAppointment, updateAppointment, toast } = useApp();
  const [vehicleId, setVehicleId] = useState(existing?.vehicleId ?? vehicles[0].id);
  const [serviceType, setServiceType] = useState(
    existing?.serviceType ?? station.services[0] ?? 'Oil Change',
  );
  const [date, setDate] = useState(existing?.date ?? '2026-07-25');
  const [time, setTime] = useState(existing?.time ?? TIME_SLOTS[1]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existing) {
      updateAppointment(existing.id, { vehicleId, serviceType, date, time });
      toast('Appointment updated');
    } else {
      bookAppointment({
        vehicleId,
        stationId: station.id,
        serviceType,
        date,
        time,
      });
      toast('Appointment booked successfully');
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {existing ? 'Modify appointment' : 'Book appointment'}
            </h2>
            <p className="text-sm text-slate-500">{station.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Vehicle
            </span>
            <Select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname} — {v.plate}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Service type
            </span>
            <Select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              {SERVICE_TYPES.filter(
                (s) => station.services.includes(s) || s === serviceType,
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Date
              </span>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Time
              </span>
              <Select value={time} onChange={(e) => setTime(e.target.value)}>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </Select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {existing ? 'Save changes' : 'Confirm booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
