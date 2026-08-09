import { Badge } from '@/components/ui/badge'
import { BOOKING_STATUS } from '@/features/bookings/labels'
import { REMINDER_STATUS } from '@/features/reminders/labels'
import type { Enums } from '@/types/database'

export function BookingStatusBadge({ status }: { status: Enums<'booking_status'> }) {
  const { label, variant } = BOOKING_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ReminderStatusBadge({ status }: { status: Enums<'reminder_status'> }) {
  const { label, variant } = REMINDER_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}
