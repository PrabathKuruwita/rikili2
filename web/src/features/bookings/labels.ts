import type { Enums } from '@/types/database'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'outline'

export const BOOKING_STATUS: Record<
  Enums<'booking_status'>,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  in_progress: { label: 'In progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
  no_show: { label: 'No show', variant: 'outline' },
}

export function bookingStatusLabel(status: Enums<'booking_status'>): string {
  return BOOKING_STATUS[status].label
}
