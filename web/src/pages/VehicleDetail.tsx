import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Gauge, Trash2, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClasses } from '@/components/ui/button-styles'
import { Field, TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { BookingCard } from '@/components/BookingCard'
import { ReminderCard } from '@/components/ReminderCard'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { HEALTH_LABEL, vehicleHealth } from '@/features/vehicles/health'
import { useDeleteVehicle, useUpdateVehicle, useVehicle } from '@/features/vehicles/useVehicles'
import { useReminders } from '@/features/reminders/useReminders'
import { useBookings } from '@/features/bookings/useBookings'
import { useVehicleServiceRecords } from '@/features/records/useServiceRecords'
import { currency, longDate, miles } from '@/lib/format'

const HEALTH_TONE = {
  green: 'success',
  orange: 'warning',
  red: 'outline',
} as const

export default function VehicleDetail() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  const vehicle = useVehicle(vehicleId)
  const reminders = useReminders()
  const bookings = useBookings()
  const records = useVehicleServiceRecords(vehicleId)

  const updateVehicle = useUpdateVehicle()
  const deleteVehicle = useDeleteVehicle()

  const [mileage, setMileage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const vehicleReminders = useMemo(
    () => (reminders.data ?? []).filter((reminder) => reminder.vehicle_id === vehicleId),
    [reminders.data, vehicleId],
  )

  const vehicleBookings = useMemo(
    () =>
      (bookings.data ?? [])
        .filter((booking) => booking.vehicle_id === vehicleId)
        .sort((a, b) => b.slot_start.localeCompare(a.slot_start)),
    [bookings.data, vehicleId],
  )

  if (vehicle.isPending) return <LoadingRows rows={4} />
  if (vehicle.isError) return <ErrorNotice error={vehicle.error} what="this vehicle" />

  const health = reminders.data ? vehicleHealth(vehicle.data, reminders.data) : 'green'
  const title = [vehicle.data.brand, vehicle.data.model].filter(Boolean).join(' ') || 'Vehicle'
  const totalSpend = (records.data ?? []).reduce(
    (sum, record) => sum + Number(record.total_cost ?? 0),
    0,
  )

  async function saveMileage() {
    const next = Number(mileage)
    if (!Number.isFinite(next) || next < 0) return
    await updateVehicle.mutateAsync({ id: vehicleId!, mileage: next })
    setMileage('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/garage', label: 'My Vehicles' }}
        eyebrow={vehicle.data.registration_number}
        title={title}
        description={`${vehicle.data.year ?? '—'} · ${miles(vehicle.data.mileage)}`}
        actions={
          <>
            <Link
              to={`/garage/${vehicleId}/history`}
              className={buttonClasses({ variant: 'secondary' })}
            >
              Service history
            </Link>
            <Link to="/book" className={buttonClasses()}>
              Book a service
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Condition</p>
          <div className="mt-3">
            <Badge variant={HEALTH_TONE[health]}>{HEALTH_LABEL[health]}</Badge>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {vehicleReminders.filter((r) => r.status === 'due').length} reminder(s) due now
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Lifetime spend</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {currency(totalSpend)}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Across {records.data?.length ?? 0} service record(s)
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Update odometer</p>
          <div className="mt-3 flex items-end gap-2">
            <Field label="">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={vehicle.data.mileage}
                  inputMode="numeric"
                  placeholder={String(vehicle.data.mileage)}
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value)}
                />
              )}
            </Field>
            <Button onClick={saveMileage} disabled={updateVehicle.isPending || mileage === ''}>
              <Gauge className="h-4 w-4" />
              Save
            </Button>
          </div>
          {updateVehicle.error ? (
            <p className="mt-2 text-xs text-rose-600">{updateVehicle.error.message}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Mileage reminders are measured against this.
            </p>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Bookings</h2>
          {bookings.isPending ? (
            <LoadingRows rows={2} />
          ) : vehicleBookings.length === 0 ? (
            <EmptyState title="No bookings" description="This vehicle has never been booked in." />
          ) : (
            <div className="space-y-3">
              {vehicleBookings.slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Reminders</h2>
          {reminders.isPending ? (
            <LoadingRows rows={2} />
          ) : vehicleReminders.length === 0 ? (
            <EmptyState
              title="No reminders"
              description="Add one from the Reminders screen to get warned before something is due."
            />
          ) : (
            <div className="space-y-3">
              {vehicleReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Recent work</h2>
          <Link
            to={`/garage/${vehicleId}/history`}
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            Full history
          </Link>
        </div>

        {records.isPending ? (
          <LoadingRows rows={2} />
        ) : records.error ? (
          <ErrorNotice error={records.error} what="the service history" />
        ) : records.data.length === 0 ? (
          <EmptyState
            title="No service history"
            description="Work logged by a garage shows up here, and you can back-fill older jobs yourself."
          />
        ) : (
          <div className="space-y-3">
            {records.data.slice(0, 3).map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">
                        {record.work_performed ?? 'Service'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {longDate(record.service_date)} ·{' '}
                        {record.garage?.name ?? record.external_garage_name ?? 'Unknown garage'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currency(record.total_cost)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-rose-200 bg-rose-50/50 p-5">
        <div>
          <p className="text-sm font-semibold text-rose-900">Remove this vehicle</p>
          <p className="mt-1 text-sm text-rose-700">
            Its bookings, reminders and service history are deleted with it. This cannot be undone.
          </p>
        </div>

        {confirmDelete ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              disabled={deleteVehicle.isPending}
              onClick={async () => {
                await deleteVehicle.mutateAsync(vehicleId!)
                navigate('/garage')
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete permanently
            </Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </Card>

      {deleteVehicle.error ? (
        <ErrorNotice error={deleteVehicle.error} what="the delete request" />
      ) : null}
    </div>
  )
}
