import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CircleDollarSign, Users, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonClasses } from '@/components/ui/button-styles'
import { Field, TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { StatsCard } from '@/components/StatsCard'
import { BookingCard } from '@/components/BookingCard'
import { EmptyState, ErrorNotice, LoadingCards, LoadingRows } from '@/components/QueryState'
import { useCreateGarage, useMyGarage } from '@/features/garages/useGarages'
import { useBookings } from '@/features/bookings/useBookings'
import { useServiceRecords } from '@/features/records/useServiceRecords'
import { currencyRounded } from '@/lib/format'

export default function StationDashboard() {
  const garage = useMyGarage()
  const bookings = useBookings()
  const records = useServiceRecords()

  const { todays, pending, revenue, customers } = useMemo(() => {
    const all = bookings.data ?? []
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    return {
      todays: all
        .filter((booking) => {
          const start = new Date(booking.slot_start)
          return start >= startOfDay && start < endOfDay
        })
        .sort((a, b) => a.slot_start.localeCompare(b.slot_start)),
      pending: all.filter((booking) => booking.status === 'pending'),
      revenue: (records.data ?? [])
        .filter((record) => new Date(record.service_date) >= monthStart)
        .reduce((sum, record) => sum + Number(record.total_cost ?? 0), 0),
      customers: new Set(all.map((booking) => booking.owner_id)).size,
    }
  }, [bookings.data, records.data])

  if (garage.isPending) return <LoadingRows rows={3} />
  if (garage.isError) return <ErrorNotice error={garage.error} what="your garage" />
  if (!garage.data) return <CreateGaragePrompt />

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Station overview"
        title={garage.data.name}
        description={garage.data.address ?? 'No address set'}
        actions={
          <>
            <Link to="/station/bookings" className={buttonClasses({ variant: 'secondary' })}>
              Booking queue
            </Link>
            <Link to="/station/jobs" className={buttonClasses()}>
              Job board
            </Link>
          </>
        }
      />

      {bookings.isPending ? (
        <LoadingCards />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            label="Today's jobs"
            value={String(todays.length)}
            detail={`Across ${garage.data.bay_count} bay${garage.data.bay_count === 1 ? '' : 's'}`}
            icon={Wrench}
            accent="indigo"
          />
          <StatsCard
            label="Awaiting confirmation"
            value={String(pending.length)}
            detail={pending.length ? 'Customers are waiting' : 'Queue is clear'}
            icon={CalendarClock}
            accent="amber"
          />
          <StatsCard
            label="Revenue this month"
            value={currencyRounded(revenue)}
            detail="From logged work"
            icon={CircleDollarSign}
            accent="emerald"
          />
          <StatsCard
            label="Customers"
            value={String(customers)}
            detail="Have booked with you"
            icon={Users}
            accent="sky"
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Today</h2>
            <Link
              to="/station/jobs"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
            >
              Job board
            </Link>
          </div>

          {bookings.isPending ? (
            <LoadingRows rows={2} />
          ) : todays.length === 0 ? (
            <EmptyState title="Nothing in today" description="No bookings start today." />
          ) : (
            <div className="space-y-3">
              {todays.map((booking) => (
                <BookingCard key={booking.id} booking={booking} perspective="garage" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Awaiting confirmation
            </h2>
            <Link
              to="/station/bookings"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
            >
              All
            </Link>
          </div>

          {bookings.isPending ? (
            <LoadingRows rows={2} />
          ) : pending.length === 0 ? (
            <EmptyState title="Queue is clear" description="Every request has been answered." />
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 4).map((booking) => (
                <BookingCard key={booking.id} booking={booking} perspective="garage" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * A garage_owner with no garage row yet.
 *
 * This is a normal first-run state, not an error: the role is granted by an
 * administrator, and the shop details are the owner's to fill in.
 */
function CreateGaragePrompt() {
  const createGarage = useCreateGarage()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [bays, setBays] = useState('2')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await createGarage.mutateAsync({
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      bay_count: Number(bays),
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Set up"
        title="Tell us about your garage"
        description="Customers cannot book with you until this exists."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Garage name">
            {(id) => (
              <TextInput
                id={id}
                required
                autoFocus
                maxLength={160}
                placeholder="Patel Auto Works"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>

          <Field label="Address">
            {(id) => (
              <TextInput
                id={id}
                maxLength={400}
                placeholder="412 Rosewood Ave, Durham NC"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone">
              {(id) => (
                <TextInput
                  id={id}
                  maxLength={30}
                  placeholder="+1-555-0301"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              )}
            </Field>

            <Field label="Bays" hint="How many vehicles you can work on at once.">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={bays}
                  onChange={(event) => setBays(event.target.value)}
                />
              )}
            </Field>
          </div>

          {createGarage.isError ? (
            <ErrorNotice error={createGarage.error} what="the garage" />
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={createGarage.isPending}>
              {createGarage.isPending ? 'Creating…' : 'Create garage'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
