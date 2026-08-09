import { useMemo, useState } from 'react'
import { CircleDollarSign, Receipt, TrendingUp, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { StatsCard } from '@/components/StatsCard'
import { EmptyState, ErrorNotice, LoadingCards } from '@/components/QueryState'
import { useServiceRecords } from '@/features/records/useServiceRecords'
import { useBookings } from '@/features/bookings/useBookings'
import { currency, currencyRounded, longDate } from '@/lib/format'

const RANGES = [
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last 12 months', months: 12 },
  { label: 'All time', months: 0 },
] as const

export default function StationReports() {
  const records = useServiceRecords()
  const bookings = useBookings()
  const [months, setMonths] = useState<number>(6)

  const inRange = useMemo(() => {
    const all = records.data ?? []
    if (months === 0) return all

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months)
    return all.filter((record) => new Date(record.service_date) >= cutoff)
  }, [records.data, months])

  const totals = useMemo(() => {
    const revenue = inRange.reduce((sum, r) => sum + Number(r.total_cost ?? 0), 0)
    const labour = inRange.reduce((sum, r) => sum + Number(r.labour_cost ?? 0), 0)
    const parts = inRange.reduce((sum, r) => sum + Number(r.parts_cost ?? 0), 0)
    return {
      revenue,
      labour,
      parts,
      jobs: inRange.length,
      average: inRange.length ? revenue / inRange.length : 0,
    }
  }, [inRange])

  /** Revenue per calendar month, oldest first — the bar chart below. */
  const byMonth = useMemo(() => {
    const buckets = new Map<string, number>()

    for (const record of inRange) {
      const key = record.service_date.slice(0, 7) // YYYY-MM
      buckets.set(key, (buckets.get(key) ?? 0) + Number(record.total_cost ?? 0))
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => {
        const [year, month] = key.split('-').map(Number)
        return {
          key,
          label: new Date(year ?? 2000, (month ?? 1) - 1, 1).toLocaleString('en-US', {
            month: 'short',
          }),
          total,
        }
      })
  }, [inRange])

  const peak = Math.max(1, ...byMonth.map((bucket) => bucket.total))

  /** Which services actually bring the money in. */
  const byService = useMemo(() => {
    const nameByBooking = new Map(
      (bookings.data ?? []).map((booking) => [booking.id, booking.service_type?.name ?? 'Other']),
    )

    const buckets = new Map<string, { jobs: number; total: number }>()
    for (const record of inRange) {
      const name = record.booking_id ? (nameByBooking.get(record.booking_id) ?? 'Other') : 'Other'
      const entry = buckets.get(name) ?? { jobs: 0, total: 0 }
      entry.jobs += 1
      entry.total += Number(record.total_cost ?? 0)
      buckets.set(name, entry)
    }

    return [...buckets.entries()]
      .map(([name, entry]) => ({ name, ...entry }))
      .sort((a, b) => b.total - a.total)
  }, [inRange, bookings.data])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="How the shop is doing"
        description="Built from the service records your garage has logged."
      />

      <div className="flex flex-wrap gap-2">
        {RANGES.map((range) => (
          <button
            key={range.label}
            type="button"
            onClick={() => setMonths(range.months)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              months === range.months
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {range.label}
          </button>
        ))}
      </div>

      {records.isPending ? (
        <LoadingCards />
      ) : records.isError ? (
        <ErrorNotice error={records.error} what="your reports" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Revenue"
              value={currencyRounded(totals.revenue)}
              detail={`${totals.jobs} job${totals.jobs === 1 ? '' : 's'} logged`}
              icon={CircleDollarSign}
              accent="emerald"
            />
            <StatsCard
              label="Average job"
              value={currencyRounded(totals.average)}
              detail="Labour plus parts"
              icon={TrendingUp}
              accent="indigo"
            />
            <StatsCard
              label="Labour"
              value={currencyRounded(totals.labour)}
              detail={
                totals.revenue
                  ? `${Math.round((totals.labour / totals.revenue) * 100)}% of revenue`
                  : '—'
              }
              icon={Wrench}
              accent="sky"
            />
            <StatsCard
              label="Parts"
              value={currencyRounded(totals.parts)}
              detail={
                totals.revenue
                  ? `${Math.round((totals.parts / totals.revenue) * 100)}% of revenue`
                  : '—'
              }
              icon={Receipt}
              accent="amber"
            />
          </section>

          {inRange.length === 0 ? (
            <EmptyState
              title="Nothing logged in this period"
              description="Reports are built from completed jobs with a service record. Log work from the job board and it will show up here."
            />
          ) : (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-slate-950">Revenue by month</h2>

                {/*
                  A plain flex bar chart. A charting library for one view of a
                  dozen bars would cost more in bundle size than it saves, and
                  this scales to whatever the range returns.
                */}
                <div className="mt-6 flex h-56 gap-3">
                  {byMonth.map((bucket) => (
                    <div
                      key={bucket.key}
                      className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-xs font-medium tabular-nums text-slate-500">
                        {bucket.total >= 1000
                          ? `${Math.round(bucket.total / 100) / 10}k`
                          : Math.round(bucket.total)}
                      </span>

                      {/*
                        The bar's percentage height needs a parent with a
                        resolved height to measure against. This track is a
                        flex child of a fixed-height column, so it has one —
                        put the bar straight in the column and the percentage
                        resolves against `auto` and collapses to nothing.
                      */}
                      <div className="flex w-full min-h-0 flex-1 items-end">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all"
                          style={{ height: `${Math.max(4, (bucket.total / peak) * 100)}%` }}
                          title={`${bucket.label}: ${currency(bucket.total)}`}
                        />
                      </div>

                      <span className="text-xs text-slate-500">{bucket.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-slate-950">By service</h2>

                <ul className="mt-4 space-y-3">
                  {byService.map((service) => (
                    <li key={service.name}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-slate-700">{service.name}</span>
                        <span className="font-medium tabular-nums text-slate-900">
                          {currency(service.total)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.max(2, (service.total / (byService[0]?.total || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {service.jobs} job{service.jobs === 1 ? '' : 's'}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {inRange.length > 0 ? (
            <Card className="overflow-hidden">
              <h2 className="border-b border-slate-100 p-5 text-base font-semibold text-slate-950">
                Logged work
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Vehicle</th>
                      <th className="px-5 py-3 font-medium">Work</th>
                      <th className="px-5 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inRange.slice(0, 20).map((record) => (
                      <tr key={record.id}>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                          {longDate(record.service_date)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                          {[record.vehicle?.brand, record.vehicle?.model].filter(Boolean).join(' ')}
                        </td>
                        <td className="max-w-xs truncate px-5 py-3 text-slate-600">
                          {record.work_performed}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-slate-900">
                          {currency(record.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
