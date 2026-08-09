import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field, Select, TextInput, Textarea } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useGarage } from '@/features/garages/useGarages'
import { useVehicles } from '@/features/vehicles/useVehicles'
import { useCreateBooking } from '@/features/bookings/useBookings'
import { currency } from '@/lib/format'

/** Opening hours are not in the schema yet — see the note in the component. */
const OPENS_AT = 8
const CLOSES_AT = 18
const STEP_MINUTES = 30
const DEFAULT_DURATION = 60

function timeOptions(): string[] {
  const options: string[] = []
  for (let minutes = OPENS_AT * 60; minutes < CLOSES_AT * 60; minutes += STEP_MINUTES) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0')
    const minute = String(minutes % 60).padStart(2, '0')
    options.push(`${hour}:${minute}`)
  }
  return options
}

const TIMES = timeOptions()

export default function PickSlot() {
  const { stationId } = useParams()
  const navigate = useNavigate()

  const garage = useGarage(stationId)
  const vehicles = useVehicles()
  const createBooking = useCreateBooking()

  const [vehicleId, setVehicleId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [startTime, setStartTime] = useState('09:00')
  const [notes, setNotes] = useState('')

  const chosenService = useMemo(
    () => garage.data?.garage_services.find((service) => service.service_type_id === serviceId),
    [garage.data, serviceId],
  )

  const duration = chosenService?.duration_minutes ?? DEFAULT_DURATION

  if (garage.isPending) return <LoadingRows rows={3} />
  if (garage.isError) return <ErrorNotice error={garage.error} what="this garage" />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // Build the slot in the browser's timezone, then hand Postgres a real
    // instant. Sending a naive "2026-08-12 09:00" would be read as UTC and
    // silently shift the booking by the user's offset.
    const slotStart = new Date(`${date}T${startTime}`)
    const slotEnd = new Date(slotStart.getTime() + duration * 60_000)

    await createBooking.mutateAsync({
      vehicle_id: vehicleId,
      garage_id: stationId!,
      service_type_id: serviceId || null,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      notes: notes.trim() || null,
    })

    navigate('/bookings')
  }

  const noVehicles = !vehicles.isPending && (vehicles.data?.length ?? 0) === 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        back={{ to: '/book', label: 'Find a garage' }}
        eyebrow={garage.data.address ?? undefined}
        title={garage.data.name}
        description={`${garage.data.bay_count} bay${garage.data.bay_count === 1 ? '' : 's'} · open ${OPENS_AT}:00–${CLOSES_AT}:00`}
      />

      {noVehicles ? (
        <EmptyState
          title="Add a vehicle first"
          description="A booking has to be against one of your vehicles."
        />
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Vehicle">
              {(id) => (
                <Select
                  id={id}
                  required
                  value={vehicleId}
                  onChange={(event) => setVehicleId(event.target.value)}
                >
                  <option value="">Choose a vehicle…</option>
                  {(vehicles.data ?? []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')} ·{' '}
                      {vehicle.registration_number}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field
              label="Service"
              hint={
                chosenService
                  ? `${duration} minutes · ${chosenService.price === null ? 'price on request' : currency(chosenService.price)}`
                  : 'Optional — leave blank if you are not sure yet.'
              }
            >
              {(id) => (
                <Select
                  id={id}
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {garage.data.garage_services.map((service) => (
                    <option key={service.id} value={service.service_type_id}>
                      {service.service_type?.name}
                      {service.price === null ? '' : ` — ${currency(service.price)}`}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Date">
                {(id) => (
                  <TextInput
                    id={id}
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                )}
              </Field>

              <Field label="Start time" hint={`Ends around ${endLabel(startTime, duration)}.`}>
                {(id) => (
                  <Select
                    id={id}
                    required
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  >
                    {TIMES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>

            <Field label="Notes for the garage">
              {(id) => (
                <Textarea
                  id={id}
                  rows={3}
                  maxLength={500}
                  placeholder="Grinding noise on the front left when braking."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              )}
            </Field>

            {/*
              Availability is not shown as a grid of free slots, and cannot be
              with the policies as they stand: a customer may only read their
              own bookings, so the browser has no way to know which bays are
              already taken — by design, since that would expose another
              customer's schedule. The database is the one that knows, and
              assign_booking_bay rejects the insert if every bay is busy. So we
              submit and report what it says. A garage-hours + availability RPC
              is in flight on vidur/garage-hours-availability-rpc; when that
              lands this form can show real free slots up front.
            */}
            {createBooking.isError ? (
              <ErrorNotice error={friendly(createBooking.error)} what="this slot" />
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/book')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBooking.isPending}>
                {createBooking.isPending ? 'Requesting…' : 'Request booking'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

function endLabel(start: string, durationMinutes: number): string {
  const [hours = 0, minutes = 0] = start.split(':').map(Number)
  const total = hours * 60 + minutes + durationMinutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * assign_booking_bay raises 23P01 when the garage is full for the window. The
 * raw message names the garage by uuid, which means nothing to a customer.
 */
function friendly(error: Error): Error {
  if (error.message.includes('no bay available')) {
    return new Error('Every bay is booked for that time. Try another time or another day.')
  }
  return error
}
