import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { ReminderStatusBadge } from '@/components/StatusBadge'
import { titleCase } from '@/lib/format'
import { reminderDueLabel } from '@/features/reminders/labels'
import type { ReminderWithVehicle } from '@/features/reminders/useReminders'

export function ReminderCard({
  reminder,
  actions,
}: {
  reminder: ReminderWithVehicle
  actions?: ReactNode
}) {
  const vehicle = [reminder.vehicle?.brand, reminder.vehicle?.model].filter(Boolean).join(' ')

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">
              {titleCase(reminder.type)}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-500">
              {vehicle || 'Vehicle'}
              {reminder.vehicle?.registration_number
                ? ` · ${reminder.vehicle.registration_number}`
                : ''}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{reminderDueLabel(reminder)}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <ReminderStatusBadge status={reminder.status} />
            {actions}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
