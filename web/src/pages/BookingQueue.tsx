import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { BookingCard } from '@/components/BookingCard'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { bookingStatusLabel } from '@/features/bookings/labels'
import {
  useBookings,
  useSetBookingStatus,
  type BookingStatus,
} from '@/features/bookings/useBookings'

const FILTERS: (BookingStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]

export default function BookingQueue() {
  const bookings = useBookings()
  const setStatus = useSetBookingStatus()
  const [filter, setFilter] = useState<BookingStatus | 'all'>('pending')

  const counts = useMemo(() => {
    const tally = new Map<string, number>()
    for (const booking of bookings.data ?? []) {
      tally.set(booking.status, (tally.get(booking.status) ?? 0) + 1)
    }
    return tally
  }, [bookings.data])

  const shown = useMemo(
    () =>
      (bookings.data ?? [])
        .filter((booking) => filter === 'all' || booking.status === filter)
        .sort((a, b) => a.slot_start.localeCompare(b.slot_start)),
    [bookings.data, filter],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bookings"
        title="Booking queue"
        description="Every job booked at your garage."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              filter === value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {value === 'all'
              ? `All (${bookings.data?.length ?? 0})`
              : `${bookingStatusLabel(value)} (${counts.get(value) ?? 0})`}
          </button>
        ))}
      </div>

      {setStatus.isError ? <ErrorNotice error={setStatus.error} what="the change" /> : null}

      {bookings.isPending ? (
        <LoadingRows rows={4} />
      ) : bookings.isError ? (
        <ErrorNotice error={bookings.error} what="the booking queue" />
      ) : shown.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description={
            filter === 'pending'
              ? 'No requests are waiting on you.'
              : 'No bookings with that status.'
          }
        />
      ) : (
        <div className="space-y-3">
          {shown.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              perspective="garage"
              actions={
                <QueueActions
                  status={booking.status}
                  pending={setStatus.isPending}
                  onSet={(status) => setStatus.mutate({ id: booking.id, status })}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The transitions a garage can make from each status.
 *
 * The database allows a garage owner to set any status on their own bookings,
 * so this list is about what makes sense rather than what is permitted — there
 * is no route from 'completed' back to 'pending', and a cancelled job is done.
 */
function QueueActions({
  status,
  pending,
  onSet,
}: {
  status: BookingStatus
  pending: boolean
  onSet: (status: BookingStatus) => void
}) {
  const options: { label: string; next: BookingStatus; variant?: 'secondary' | 'danger' }[] =
    status === 'pending'
      ? [
          { label: 'Confirm', next: 'confirmed' },
          { label: 'Decline', next: 'cancelled', variant: 'danger' },
        ]
      : status === 'confirmed'
        ? [
            { label: 'Start', next: 'in_progress' },
            { label: 'No show', next: 'no_show', variant: 'secondary' },
          ]
        : status === 'in_progress'
          ? [{ label: 'Mark complete', next: 'completed' }]
          : []

  if (options.length === 0) return null

  return (
    <div className="flex gap-1.5">
      {options.map((option) => (
        <Button
          key={option.next}
          size="sm"
          variant={option.variant ?? 'default'}
          disabled={pending}
          onClick={() => onSet(option.next)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
