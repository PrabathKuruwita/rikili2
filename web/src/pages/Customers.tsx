import { useMemo, useState } from 'react'
import { Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useGarageCustomers } from '@/features/profile/useProfile'
import { useBookings } from '@/features/bookings/useBookings'
import { useServiceRecords } from '@/features/records/useServiceRecords'
import { currency, initials, longDate } from '@/lib/format'

export default function Customers() {
  const customers = useGarageCustomers()
  const bookings = useBookings()
  const records = useServiceRecords()
  const [search, setSearch] = useState('')

  /**
   * Per-customer totals, computed from the bookings and records this garage can
   * already see. There is no join for it: RLS gives a garage the bookings at
   * its own garage and the records it wrote, so summing them here is both
   * correct and cheap at this scale.
   */
  const summary = useMemo(() => {
    const spendByVehicle = new Map<string, number>()
    for (const record of records.data ?? []) {
      spendByVehicle.set(
        record.vehicle_id,
        (spendByVehicle.get(record.vehicle_id) ?? 0) + Number(record.total_cost ?? 0),
      )
    }

    const byOwner = new Map<
      string,
      { visits: number; lastVisit: string | null; spend: number; vehicles: Set<string> }
    >()

    for (const booking of bookings.data ?? []) {
      const entry = byOwner.get(booking.owner_id) ?? {
        visits: 0,
        lastVisit: null,
        spend: 0,
        vehicles: new Set<string>(),
      }

      entry.visits += 1
      entry.vehicles.add(booking.vehicle_id)
      if (!entry.lastVisit || booking.slot_start > entry.lastVisit) {
        entry.lastVisit = booking.slot_start
      }
      byOwner.set(booking.owner_id, entry)
    }

    for (const [, entry] of byOwner) {
      entry.spend = [...entry.vehicles].reduce(
        (sum, vehicleId) => sum + (spendByVehicle.get(vehicleId) ?? 0),
        0,
      )
    }

    return byOwner
  }, [bookings.data, records.data])

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (customers.data ?? []).filter((customer) =>
      needle
        ? [customer.full_name, customer.email, customer.phone]
            .join(' ')
            .toLowerCase()
            .includes(needle)
        : true,
    )
  }, [customers.data, search])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="People who have booked with you"
        description="Visible because they booked in — not a directory of every Rikili user."
      />

      <Card className="p-4">
        <TextInput
          type="search"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {customers.isPending ? (
        <LoadingRows rows={3} />
      ) : customers.isError ? (
        <ErrorNotice error={customers.error} what="your customers" />
      ) : shown.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Once someone books a job at your garage they will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((customer) => {
            const stats = summary.get(customer.id)

            return (
              <Card key={customer.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700">
                    {initials(customer.full_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-950">
                      {customer.full_name ?? 'Unnamed customer'}
                    </h2>

                    <div className="mt-1 space-y-0.5">
                      {customer.email ? (
                        <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {customer.email}
                        </p>
                      ) : null}
                      {customer.phone ? (
                        <p className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {customer.phone}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {stats?.visits ?? 0} booking{stats?.visits === 1 ? '' : 's'}
                      </Badge>
                      <Badge variant="outline">
                        {stats?.vehicles.size ?? 0} vehicle{stats?.vehicles.size === 1 ? '' : 's'}
                      </Badge>
                      <Badge variant="success">{currency(stats?.spend ?? 0)} billed</Badge>
                    </div>

                    {stats?.lastVisit ? (
                      <p className="mt-3 text-xs text-slate-500">
                        Last booking {longDate(stats.lastVisit)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
