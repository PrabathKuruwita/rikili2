import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field, TextInput, Textarea } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useBooking } from '@/features/bookings/useBookings'
import { useLogWork, type PartInput } from '@/features/records/useServiceRecords'
import { currency, dateTime } from '@/lib/format'

const EMPTY_PART: PartInput = { name: '', quantity: 1, unit_cost: 0 }

export default function LogWork() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const booking = useBooking(jobId)
  const logWork = useLogWork()

  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [technician, setTechnician] = useState('')
  const [work, setWork] = useState('')
  const [odometer, setOdometer] = useState('')
  const [labour, setLabour] = useState('')
  const [parts, setParts] = useState<PartInput[]>([{ ...EMPTY_PART }])

  if (booking.isPending) return <LoadingRows rows={3} />
  if (booking.isError) return <ErrorNotice error={booking.error} what="this job" />

  // Bound once here: narrowing from the guards above does not reach into the
  // submit handler's closure.
  const job = booking.data

  // Parts total is derived, never typed. Two fields that must agree is a bug
  // waiting to happen, and service_records.total_cost is generated from it.
  const partsTotal = parts.reduce(
    (sum, part) => sum + (Number(part.quantity) || 0) * (Number(part.unit_cost) || 0),
    0,
  )
  const labourCost = Number(labour) || 0

  function updatePart(index: number, patch: Partial<PartInput>) {
    setParts((current) => current.map((part, i) => (i === index ? { ...part, ...patch } : part)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!job.garage_id) return

    await logWork.mutateAsync({
      booking_id: job.id,
      vehicle_id: job.vehicle_id,
      garage_id: job.garage_id,
      service_date: serviceDate,
      odometer: odometer ? Number(odometer) : null,
      work_performed: work.trim(),
      technician_name: technician.trim(),
      labour_cost: labourCost,
      parts_cost: partsTotal,
      parts,
    })

    navigate('/station/jobs')
  }

  const vehicle = [job.vehicle?.brand, job.vehicle?.model].filter(Boolean).join(' ')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        back={{ to: '/station/jobs', label: 'Job board' }}
        eyebrow={job.service_type?.name ?? 'Service'}
        title={`${vehicle} · ${job.vehicle?.registration_number ?? ''}`}
        description={`${job.owner?.full_name ?? 'Customer'} · booked ${dateTime(job.slot_start)}`}
      />

      {job.notes ? (
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Customer note
          </p>
          <p className="mt-1 text-sm italic text-slate-700">“{job.notes}”</p>
        </Card>
      ) : null}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date">
              {(id) => (
                <TextInput
                  id={id}
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(event) => setServiceDate(event.target.value)}
                />
              )}
            </Field>

            <Field label="Technician" hint="Who actually did the work.">
              {(id) => (
                <TextInput
                  id={id}
                  required
                  maxLength={120}
                  placeholder="Danny R."
                  value={technician}
                  onChange={(event) => setTechnician(event.target.value)}
                />
              )}
            </Field>

            <Field label="Odometer" hint="Advances the vehicle's mileage if higher.">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={0}
                  placeholder="62400"
                  value={odometer}
                  onChange={(event) => setOdometer(event.target.value)}
                />
              )}
            </Field>

            <Field label="Labour">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={labour}
                  onChange={(event) => setLabour(event.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label="Work performed">
            {(id) => (
              <Textarea
                id={id}
                rows={3}
                required
                placeholder="Front pads and rotors replaced. Brake fluid flushed."
                value={work}
                onChange={(event) => setWork(event.target.value)}
              />
            )}
          </Field>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">Parts</legend>
            {parts.map((part, index) => (
              <div key={index} className="grid grid-cols-[1fr_5rem_7rem] gap-2">
                <TextInput
                  aria-label="Part name"
                  placeholder="Brake pad set (front)"
                  value={part.name}
                  onChange={(event) => updatePart(index, { name: event.target.value })}
                />
                <TextInput
                  aria-label="Quantity"
                  type="number"
                  min={1}
                  value={part.quantity}
                  onChange={(event) => updatePart(index, { quantity: Number(event.target.value) })}
                />
                <TextInput
                  aria-label="Unit cost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={part.unit_cost}
                  onChange={(event) => updatePart(index, { unit_cost: Number(event.target.value) })}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setParts((current) => [...current, { ...EMPTY_PART }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Add a part
            </Button>
          </fieldset>

          <dl className="space-y-1 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Labour</dt>
              <dd className="tabular-nums text-slate-700">{currency(labourCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Parts</dt>
              <dd className="tabular-nums text-slate-700">{currency(partsTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <dt className="text-slate-900">Total</dt>
              <dd className="tabular-nums text-slate-900">{currency(labourCost + partsTotal)}</dd>
            </div>
          </dl>

          {logWork.isError ? <ErrorNotice error={logWork.error} what="the service record" /> : null}

          <p className="text-xs text-slate-500">
            Saving also marks the booking completed and makes this record visible to the customer.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/station/jobs')}>
              Cancel
            </Button>
            <Button type="submit" disabled={logWork.isPending}>
              {logWork.isPending ? 'Saving…' : 'Save and complete'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
