import { useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field, Select, TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { ReminderCard } from '@/components/ReminderCard'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useSetReminderStatus,
} from '@/features/reminders/useReminders'
import { useVehicles } from '@/features/vehicles/useVehicles'
import type { Enums } from '@/types/database'

const TYPES: Enums<'reminder_type'>[] = [
  'service',
  'oil_change',
  'insurance_renewal',
  'emission_test',
  'other',
]

const TYPE_LABEL: Record<Enums<'reminder_type'>, string> = {
  service: 'Service',
  oil_change: 'Oil change',
  insurance_renewal: 'Insurance renewal',
  emission_test: 'Emission test',
  other: 'Other',
}

export default function RemindersPage() {
  const reminders = useReminders()
  const vehicles = useVehicles()
  const createReminder = useCreateReminder()
  const setStatus = useSetReminderStatus()
  const deleteReminder = useDeleteReminder()

  const [open, setOpen] = useState(false)

  const { active, done } = useMemo(() => {
    const all = reminders.data ?? []
    return {
      active: all.filter((r) => r.status === 'due' || r.status === 'scheduled'),
      done: all.filter((r) => r.status === 'completed' || r.status === 'dismissed'),
    }
  }, [reminders.data])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reminders"
        title="Stay ahead of the next job"
        description="Set a date or a mileage and Rikili will flag the vehicle before it is due."
        actions={
          <Button onClick={() => setOpen((value) => !value)}>
            <Plus className="h-4 w-4" />
            {open ? 'Close' : 'New reminder'}
          </Button>
        }
      />

      {open ? (
        <ReminderForm
          vehicles={vehicles.data ?? []}
          pending={createReminder.isPending}
          error={createReminder.error}
          onSubmit={async (input) => {
            await createReminder.mutateAsync(input)
            setOpen(false)
          }}
        />
      ) : null}

      {setStatus.isError ? <ErrorNotice error={setStatus.error} what="the change" /> : null}
      {deleteReminder.isError ? (
        <ErrorNotice error={deleteReminder.error} what="the delete" />
      ) : null}

      {reminders.isPending ? (
        <LoadingRows rows={4} />
      ) : reminders.isError ? (
        <ErrorNotice error={reminders.error} what="your reminders" />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Open ({active.length})
            </h2>

            {active.length === 0 ? (
              <EmptyState
                title="Nothing outstanding"
                description="Every reminder you have set is either done or not due yet."
              />
            ) : (
              <div className="space-y-3">
                {active.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    actions={
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: reminder.id, status: 'completed' })}
                        >
                          Done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: reminder.id, status: 'dismissed' })}
                        >
                          Dismiss
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {done.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Closed ({done.length})
              </h2>
              <div className="space-y-3">
                {done.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    actions={
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deleteReminder.isPending}
                        onClick={() => deleteReminder.mutate(reminder.id)}
                      >
                        Remove
                      </Button>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

type ReminderFormProps = {
  vehicles: {
    id: string
    brand: string | null
    model: string | null
    registration_number: string
  }[]
  pending: boolean
  error: Error | null
  onSubmit: (input: {
    vehicle_id: string
    type: Enums<'reminder_type'>
    trigger_type: Enums<'reminder_trigger'>
    due_date: string | null
    due_mileage: number | null
  }) => Promise<void>
}

function ReminderForm({ vehicles, pending, error, onSubmit }: ReminderFormProps) {
  const [vehicleId, setVehicleId] = useState('')
  const [type, setType] = useState<Enums<'reminder_type'>>('service')
  const [trigger, setTrigger] = useState<Enums<'reminder_trigger'>>('date')
  const [dueDate, setDueDate] = useState('')
  const [dueMileage, setDueMileage] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // reminders_trigger_value_check requires exactly the threshold that matches
    // the trigger, so the unused one has to go as null rather than an empty
    // string — Postgres would reject the row otherwise.
    await onSubmit({
      vehicle_id: vehicleId,
      type,
      trigger_type: trigger,
      due_date: trigger === 'date' ? dueDate : null,
      due_mileage: trigger === 'mileage' ? Number(dueMileage) : null,
    })
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState title="Add a vehicle first" description="Reminders are attached to a vehicle." />
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Vehicle">
            {(id) => (
              <Select
                id={id}
                required
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
              >
                <option value="">Choose a vehicle…</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')} ·{' '}
                    {vehicle.registration_number}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="What for">
            {(id) => (
              <Select
                id={id}
                value={type}
                onChange={(event) => setType(event.target.value as Enums<'reminder_type'>)}
              >
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {TYPE_LABEL[value]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Trigger on">
            {(id) => (
              <Select
                id={id}
                value={trigger}
                onChange={(event) => setTrigger(event.target.value as Enums<'reminder_trigger'>)}
              >
                <option value="date">A date</option>
                <option value="mileage">A mileage</option>
              </Select>
            )}
          </Field>

          {trigger === 'date' ? (
            <Field label="Due date">
              {(id) => (
                <TextInput
                  id={id}
                  type="date"
                  required
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              )}
            </Field>
          ) : (
            <Field label="Due at mileage">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={0}
                  required
                  placeholder="66000"
                  value={dueMileage}
                  onChange={(event) => setDueMileage(event.target.value)}
                />
              )}
            </Field>
          )}
        </div>

        {error ? <ErrorNotice error={error} what="the reminder" /> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Create reminder'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
