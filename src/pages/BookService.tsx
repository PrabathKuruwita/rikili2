import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, StarIcon, MapPinIcon, FilterIcon } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  Select } from
'../components/ui/primitives';
import { StationMap } from '../components/booking/StationMap';
import { BookingModal } from '../components/booking/BookingModal';
import { stations } from '../data/mockData';
import type { Station } from '../types';
const ALL_SERVICES = [
'All services',
'Oil Change',
'Brakes',
'Tires',
'Diagnostics',
'Emission Test',
'EV Service'];

export function BookService() {
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All services');
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(stations[0].id);
  const [booking, setBooking] = useState<Station | null>(null);
  const filtered = useMemo(() => {
    return stations.
    filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q);
      const matchesService =
      serviceFilter === 'All services' || s.services.includes(serviceFilter);
      const matchesOpen = !openOnly || s.openNow;
      return matchesQuery && matchesService && matchesOpen;
    }).
    sort((a, b) => a.distanceKm - b.distanceKm);
  }, [query, serviceFilter, openOnly]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a Service"
        subtitle="Browse and filter participating stations, then pick a real-time slot." />
      

      {/* Filters */}
      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by station name or address"
            className="pl-9"
            aria-label="Search stations" />
          
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500">
            <FilterIcon className="h-4 w-4" />
          </div>
          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-44"
            aria-label="Filter by service">
            
            {ALL_SERVICES.map((s) =>
            <option key={s}>{s}</option>
            )}
          </Select>
          <label className="flex cursor-pointer select-none items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent" />
            
            Open now
          </label>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className="space-y-3 lg:col-span-2">
          <p className="text-sm text-slate-500">
            {filtered.length} station{filtered.length !== 1 && 's'} found
          </p>
          <div className="space-y-3">
            {filtered.map((s, i) =>
            <motion.div
              key={s.id}
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.05
              }}>
              
                <Card
                className={`cursor-pointer p-4 transition-shadow hover:shadow-pop ${selectedId === s.id ? 'ring-2 ring-accent' : ''}`}
                onClick={() => setSelectedId(s.id)}>
                
                  <div className="flex gap-3">
                    <img
                    src={s.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {s.name}
                        </h3>
                        <Badge tone={s.openNow ? 'green' : 'slate'}>
                          {s.openNow ? 'Open' : 'Closed'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPinIcon className="h-3 w-3" /> {s.address} ·{' '}
                        {s.distanceKm} km
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-600">
                        <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{s.rating}</span>
                        <span className="text-slate-400">
                          ({s.reviews.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {s.services.slice(0, 3).map((sv) =>
                  <Badge key={sv}>{sv}</Badge>
                  )}
                    {s.services.length > 3 &&
                  <Badge>+{s.services.length - 3}</Badge>
                  }
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBooking(s);
                    }}>
                    
                      Book here
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
            {filtered.length === 0 &&
            <Card className="p-6 text-center text-sm text-slate-500">
                No stations match your filters.
              </Card>
            }
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-[420px] overflow-hidden lg:h-[640px]">
            <StationMap
              stations={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId} />
            
          </Card>
        </div>
      </div>

      {booking &&
      <BookingModal station={booking} onClose={() => setBooking(null)} />
      }
    </div>);

}