import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { buttonClasses } from '@/components/ui/button-styles'
import { PageHeader } from '@/components/PageHeader'
import { BookingCard } from '@/components/BookingCard'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useBookings, useSetBookingStatus, isUpcoming } from '@/features/bookings/useBookings'

type Tab = 'upcoming' | 'past'

export default function MyBookings() {
  const bookings = useBookings()
  const setStatus = useSetBookingStatus()
  const [tab, setTab] = useState<Tab>('upcoming')

  const { upcoming, past } = useMemo(() => {
    const all = bookings.data ?? []
    return {
      upcoming: all.filter(isUpcoming).sort((a, b) => a.slot_start.localeCompare(b.slot_start)),
      past: all.filter((booking) => !isUpcoming(booking)),
    }
  }, [bookings.data])

  const shown = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bookings"
        title="My bookings"
        description="Everything you have booked, past and future."
        actions={
          <Link to="/book" className={buttonClasses()}>
            Book a service
          </Link>
        }
      />

      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              tab === value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {value === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {setStatus.isError ? <ErrorNotice error={setStatus.error} what="the change" /> : null}

      {bookings.isPending ? (
        <LoadingRows rows={3} />
      ) : bookings.isError ? (
        <ErrorNotice error={bookings.error} what="your bookings" />
      ) : shown.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'Nothing coming up' : 'No past bookings'}
          description={
            tab === 'upcoming'
              ? 'Book a service and it will appear here.'
              : 'Completed and cancelled jobs collect here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {shown.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={
                /*
                  Only cancelling is offered. The owner UPDATE policy's WITH
                  CHECK allows 'pending' and 'cancelled' and nothing else, so
                  confirming or completing your own job is refused by Postgres
                  — those are the garage's calls. Showing the button anyway
                  would just produce an error the customer cannot act on.
                */
                tab === 'upcoming' && booking.status !== 'cancelled' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: booking.id, status: 'cancelled' })}
                  >
                    Cancel
                  </Button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
