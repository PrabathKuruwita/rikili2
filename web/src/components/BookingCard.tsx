import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { BookingStatusBadge } from '@/components/StatusBadge'
import { dateTime, relativeTime, time } from '@/lib/format'
import type { BookingDetail } from '@/features/bookings/useBookings'

type BookingCardProps = {
  booking: BookingDetail
  /** Garage side wants the customer and car; owner side wants the shop. */
  perspective?: 'owner' | 'garage'
  actions?: ReactNode
}

export function BookingCard({ booking, perspective = 'owner', actions }: BookingCardProps) {
  const vehicle = [booking.vehicle?.brand, booking.vehicle?.model].filter(Boolean).join(' ')
  const service = booking.service_type?.name ?? 'Service'

  const subtitle =
    perspective === 'owner'
      ? [vehicle, booking.garage?.name].filter(Boolean).join(' · ')
      : [vehicle, booking.vehicle?.registration_number, booking.owner?.full_name]
          .filter(Boolean)
          .join(' · ')

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Wrench className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950">{service}</h3>
              <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {dateTime(booking.slot_start)} – {time(booking.slot_end)}
                {booking.bay_number ? ` · Bay ${booking.bay_number}` : ''}
                <span className="text-slate-400"> · {relativeTime(booking.slot_start)}</span>
              </p>
              {booking.notes ? (
                <p className="mt-2 line-clamp-2 text-xs italic text-slate-500">“{booking.notes}”</p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <BookingStatusBadge status={booking.status} />
            {actions}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
