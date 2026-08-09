import { daysUntil } from '@/lib/format'
import type { Reminder } from '@/features/reminders/useReminders'
import type { Vehicle } from './useVehicles'

export type Health = 'green' | 'orange' | 'red'

/** Inside this window a date-triggered reminder counts as approaching. */
const SOON_DAYS = 30
/** Same idea for mileage: this close to the threshold is "approaching". */
const SOON_MILES = 1_000

/**
 * A vehicle's health, derived from its outstanding reminders.
 *
 * There is no health column in the database and there should not be one — it
 * is a view of the reminders, so storing it would mean keeping a cache correct
 * against every reminder write. Computing it costs nothing at these sizes.
 *
 *   red    something is due or overdue right now
 *   orange something crosses its threshold soon
 *   green  nothing outstanding
 *
 * Reminders already completed or dismissed are ignored: they are history.
 */
export function vehicleHealth(vehicle: Vehicle, reminders: Reminder[]): Health {
  const open = reminders.filter(
    (reminder) =>
      reminder.vehicle_id === vehicle.id &&
      (reminder.status === 'scheduled' || reminder.status === 'due'),
  )

  let health: Health = 'green'

  for (const reminder of open) {
    // 'due' is set by the backend sweep and outranks anything we can infer.
    if (reminder.status === 'due') return 'red'

    if (reminder.trigger_type === 'date' && reminder.due_date) {
      const days = daysUntil(reminder.due_date)
      if (days < 0) return 'red'
      if (days <= SOON_DAYS) health = 'orange'
    }

    if (reminder.trigger_type === 'mileage' && reminder.due_mileage !== null) {
      const remaining = reminder.due_mileage - vehicle.mileage
      if (remaining <= 0) return 'red'
      if (remaining <= SOON_MILES) health = 'orange'
    }
  }

  return health
}

export const HEALTH_LABEL: Record<Health, string> = {
  green: 'Healthy',
  orange: 'Due soon',
  red: 'Needs attention',
}

/**
 * A fleet-level percentage for the dashboard tile. Weighted so one red car in
 * a healthy fleet is visible without dragging the number to nothing.
 */
export function fleetHealthScore(healths: Health[]): number | null {
  if (healths.length === 0) return null
  const score = healths.reduce(
    (total, health) => total + (health === 'green' ? 100 : health === 'orange' ? 65 : 25),
    0,
  )
  return Math.round(score / healths.length)
}
