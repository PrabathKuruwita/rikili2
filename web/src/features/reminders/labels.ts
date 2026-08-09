import { longDate, miles, relativeTime } from '@/lib/format'
import type { Enums } from '@/types/database'
import type { BadgeVariant } from '@/features/bookings/labels'
import type { ReminderWithVehicle } from './useReminders'

export const REMINDER_STATUS: Record<
  Enums<'reminder_status'>,
  { label: string; variant: BadgeVariant }
> = {
  scheduled: { label: 'Scheduled', variant: 'outline' },
  due: { label: 'Due', variant: 'warning' },
  completed: { label: 'Done', variant: 'success' },
  dismissed: { label: 'Dismissed', variant: 'outline' },
}

/**
 * One line describing when a reminder fires.
 *
 * The two trigger types are not interchangeable: a date reminder counts down in
 * time, a mileage one counts down in distance, and a vehicle can sit unused for
 * a month without getting any closer to the second.
 */
export function reminderDueLabel(reminder: ReminderWithVehicle): string {
  if (reminder.trigger_type === 'date' && reminder.due_date) {
    return `${longDate(reminder.due_date)} · ${relativeTime(reminder.due_date)}`
  }

  if (reminder.trigger_type === 'mileage' && reminder.due_mileage !== null) {
    const current = reminder.vehicle?.mileage ?? 0
    const remaining = reminder.due_mileage - current
    return remaining > 0
      ? `At ${miles(reminder.due_mileage)} · ${miles(remaining)} to go`
      : `At ${miles(reminder.due_mileage)} · passed ${miles(Math.abs(remaining))} ago`
  }

  return 'No threshold set'
}
