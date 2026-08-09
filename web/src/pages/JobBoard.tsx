import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { buttonClasses } from '@/components/ui/button-styles'
import { PageHeader } from '@/components/PageHeader'
import { BookingCard } from '@/components/BookingCard'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useBookings, useSetBookingStatus } from '@/features/bookings/useBookings'
import { useServiceRecords } from '@/features/records/useServiceRecords'

/**
 * What the shop floor is working on: everything live, plus what is due today
 * and what is still owed a write-up.
 */
export default function JobBoard() {
  const bookings = useBookings()
  const records = useServiceRecords()
  const setStatus = useSetBookingStatus()

  const loggedBookingIds = useMemo(
    () => new Set((records.data ?? []).map((record) => record.booking_id).filter(Boolean)),
    [records.data],
  )

  const { active, today, awaitingWriteUp } = useMemo(() => {
    const all = bookings.data ?? []

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const byStart = (a: { slot_start: string }, b: { slot_start: string }) =>
      a.slot_start.localeCompare(b.slot_start)

    return {
      active: all.filter((booking) => booking.status === 'in_progress').sort(byStart),
      today: all
        .filter((booking) => {
          const start = new Date(booking.slot_start)
          return booking.status === 'confirmed' && start >= startOfDay && start < endOfDay
        })
        .sort(byStart),
      // A completed job with no service record is unbilled work — the most
      // useful thing this screen can surface.
      awaitingWriteUp: all
        .filter((booking) => booking.status === 'completed' && !loggedBookingIds.has(booking.id))
        .sort(byStart),
    }
  }, [bookings.data, loggedBookingIds])

  if (bookings.isPending || records.isPending) return <LoadingRows rows={4} />
  if (bookings.isError) return <ErrorNotice error={bookings.error} what="the job board" />

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workshop"
        title="Job board"
        description="Live work, today's arrivals, and anything still owed a write-up."
      />

      {setStatus.isError ? <ErrorNotice error={setStatus.error} what="the change" /> : null}

      <Section
        title={`In progress (${active.length})`}
        empty="Nothing on the ramps right now."
        bookings={active}
        renderActions={(id) => (
          <Link to={`/station/jobs/${id}`} className={buttonClasses({ size: 'sm' })}>
            Log work
          </Link>
        )}
      />

      <Section
        title={`Arriving today (${today.length})`}
        empty="No confirmed arrivals left today."
        bookings={today}
        renderActions={(id) => (
          <Button
            size="sm"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate({ id, status: 'in_progress' })}
          >
            Start job
          </Button>
        )}
      />

      <Section
        title={`Awaiting write-up (${awaitingWriteUp.length})`}
        empty="Every completed job has a service record."
        bookings={awaitingWriteUp}
        renderActions={(id) => (
          <Link to={`/station/jobs/${id}`} className={buttonClasses({ size: 'sm' })}>
            Log work
          </Link>
        )}
      />
    </div>
  )
}

type SectionProps = {
  title: string
  empty: string
  bookings: Parameters<typeof BookingCard>[0]['booking'][]
  renderActions: (bookingId: string) => React.ReactNode
}

function Section({ title, empty, bookings, renderActions }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>

      {bookings.length === 0 ? (
        <EmptyState title="Clear" description={empty} />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              perspective="garage"
              actions={renderActions(booking.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
