import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BellRing, CalendarDays, CarFront, Gauge } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'
import { PageHeader } from '@/components/PageHeader'
import { StatsCard } from '@/components/StatsCard'
import { VehicleCard } from '@/components/VehicleCard'
import { BookingCard } from '@/components/BookingCard'
import { ReminderCard } from '@/components/ReminderCard'
import { reminderDueLabel } from '@/features/reminders/labels'
import { EmptyState, ErrorNotice, LoadingCards, LoadingRows } from '@/components/QueryState'
import { useVehicles } from '@/features/vehicles/useVehicles'
import { useReminders } from '@/features/reminders/useReminders'
import { useBookings, isUpcoming } from '@/features/bookings/useBookings'
import { useProfile } from '@/features/profile/useProfile'
import { fleetHealthScore, vehicleHealth } from '@/features/vehicles/health'

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export default function Dashboard() {
  const profile = useProfile()
  const vehicles = useVehicles()
  const reminders = useReminders()
  const bookings = useBookings()

  const health = useMemo(() => {
    if (!vehicles.data || !reminders.data)
      return new Map<string, ReturnType<typeof vehicleHealth>>()
    return new Map(
      vehicles.data.map((vehicle) => [vehicle.id, vehicleHealth(vehicle, reminders.data)]),
    )
  }, [vehicles.data, reminders.data])

  const upcoming = useMemo(
    () =>
      (bookings.data ?? [])
        .filter(isUpcoming)
        .sort((a, b) => a.slot_start.localeCompare(b.slot_start))
        .slice(0, 3),
    [bookings.data],
  )

  const openReminders = useMemo(
    () =>
      (reminders.data ?? [])
        .filter((reminder) => reminder.status === 'due' || reminder.status === 'scheduled')
        .slice(0, 3),
    [reminders.data],
  )

  const dueCount = (reminders.data ?? []).filter((r) => r.status === 'due').length
  const score = fleetHealthScore([...health.values()])
  const firstName = profile.data?.full_name?.split(' ')[0]

  /** The next thing due on a vehicle, for the line under its name. */
  function noteFor(vehicleId: string): string | undefined {
    const next = (reminders.data ?? []).find(
      (reminder) =>
        reminder.vehicle_id === vehicleId &&
        (reminder.status === 'due' || reminder.status === 'scheduled'),
    )
    return next ? reminderDueLabel(next) : undefined
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        eyebrow="Garage overview"
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        description="Here's what's happening across your vehicles today."
        actions={
          <Link to="/book" className={buttonClasses()}>
            Book a Service
          </Link>
        }
      />

      {vehicles.isPending ? (
        <LoadingCards />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            label="Vehicles"
            value={String(vehicles.data?.length ?? 0)}
            detail="In your garage"
            icon={CarFront}
            accent="indigo"
          />
          <StatsCard
            label="Average Health Score"
            value={score === null ? '—' : `${score}%`}
            detail={score === null ? 'Add a vehicle to see this' : 'Across your fleet'}
            icon={Gauge}
            accent="emerald"
          />
          <StatsCard
            label="Upcoming Services"
            value={String(upcoming.length)}
            detail={upcoming.length ? 'Next few days' : 'Nothing booked'}
            icon={CalendarDays}
            accent="sky"
          />
          <StatsCard
            label="Reminders Due"
            value={String(dueCount)}
            detail={dueCount ? 'Action needed' : 'All clear'}
            icon={BellRing}
            accent="amber"
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Your vehicles</h2>
          </div>

          {vehicles.isPending ? (
            <LoadingRows rows={2} />
          ) : vehicles.error ? (
            <ErrorNotice error={vehicles.error} what="your vehicles" />
          ) : vehicles.data.length === 0 ? (
            <EmptyState
              title="No vehicles yet"
              description="Add your first vehicle to start tracking service history and reminders."
              action={
                <Link to="/garage/new" className={buttonClasses()}>
                  Add a vehicle
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.data.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  health={health.get(vehicle.id) ?? 'green'}
                  note={noteFor(vehicle.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Upcoming Services
              </h2>
              <Link
                to="/bookings"
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
              >
                All
              </Link>
            </div>

            {bookings.isPending ? (
              <LoadingRows rows={2} />
            ) : bookings.error ? (
              <ErrorNotice error={bookings.error} what="your bookings" />
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="Nothing booked"
                description="When you book a service it will show up here."
              />
            ) : (
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Reminders</h2>
              <Link
                to="/reminders"
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
              >
                All
              </Link>
            </div>

            {reminders.isPending ? (
              <LoadingRows rows={2} />
            ) : reminders.error ? (
              <ErrorNotice error={reminders.error} what="your reminders" />
            ) : openReminders.length === 0 ? (
              <EmptyState title="Nothing outstanding" description="No reminders are due." />
            ) : (
              <div className="space-y-3">
                {openReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </motion.div>
  )
}
