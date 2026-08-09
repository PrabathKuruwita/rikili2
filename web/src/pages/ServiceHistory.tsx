import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, TextInput, Textarea } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useVehicle } from '@/features/vehicles/useVehicles'
import {
  useAddManualRecord,
  useVehicleServiceRecords,
  type PartInput,
} from '@/features/records/useServiceRecords'
import { currency, longDate, miles } from '@/lib/format'

const EMPTY_PART: PartInput = { name: '', quantity: 1, unit_cost: 0 }

export default function ServiceHistory() {
  const { vehicleId } = useParams()
  const vehicle = useVehicle(vehicleId)
  const records = useVehicleServiceRecords(vehicleId)
  const addRecord = useAddManualRecord()

  const [open, setOpen] = useState(false)

  if (vehicle.error) return <ErrorNotice error={vehicle.error} what="this vehicle" />

  const title = [vehicle.data?.brand, vehicle.data?.model].filter(Boolean).join(' ') || 'Vehicle'
  const total = (records.data ?? []).reduce((sum, r) => sum + Number(r.total_cost ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: `/garage/${vehicleId}`, label: title }}
        eyebrow={vehicle.data?.registration_number}
        title="Service history"
        description={`${records.data?.length ?? 0} record(s) · ${currency(total)} lifetime`}
        actions={
          <Button onClick={() => setOpen((value) => !value)}>
            <Plus className="h-4 w-4" />
            {open ? 'Close' : 'Add past work'}
          </Button>
        }
      />

      {open ? (
        <ManualRecordForm
          vehicleId={vehicleId!}
          currentMileage={vehicle.data?.mileage ?? 0}
          pending={addRecord.isPending}
          error={addRecord.error}
          onSubmit={async (input) => {
            await addRecord.mutateAsync(input)
            setOpen(false)
          }}
        />
      ) : null}

      {records.isPending ? (
        <LoadingRows rows={4} />
      ) : records.error ? (
        <ErrorNotice error={records.error} what="the service history" />
      ) : records.data.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Work done through Rikili is added automatically by the garage. Anything from before that, you can add yourself."
        />
      ) : (
        <div className="space-y-3">
          {records.data.map((record) => (
            <Card key={record.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Wrench className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-950">
                        {record.work_performed ?? 'Service'}
                      </h3>
                      <Badge variant={record.source === 'booking' ? 'default' : 'outline'}>
                        {record.source === 'booking' ? 'Via Rikili' : 'Added by you'}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {longDate(record.service_date)} ·{' '}
                      {record.garage?.name ?? record.external_garage_name ?? 'Unknown garage'}
                      {record.technician_name ? ` · ${record.technician_name}` : ''}
                      {record.odometer !== null ? ` · ${miles(record.odometer)}` : ''}
                    </p>

                    {record.service_parts.length > 0 ? (
                      <ul className="mt-3 space-y-1">
                        {record.service_parts.map((part) => (
                          <li key={part.id} className="flex gap-2 text-xs text-slate-600">
                            <span className="text-slate-400">{part.quantity}×</span>
                            <span className="min-w-0 flex-1 truncate">{part.name}</span>
                            <span className="tabular-nums">{currency(part.line_total)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-semibold text-slate-950">
                    {currency(record.total_cost)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {currency(record.labour_cost)} labour · {currency(record.parts_cost)} parts
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

type ManualRecordFormProps = {
  vehicleId: string
  currentMileage: number
  pending: boolean
  error: Error | null
  onSubmit: (input: {
    vehicle_id: string
    service_date: string
    odometer: number | null
    work_performed: string
    external_garage_name: string
    labour_cost: number
    parts_cost: number
    parts: PartInput[]
  }) => Promise<void>
}

/**
 * Back-filling work done off-platform.
 *
 * The garage name is required and there is no way to attribute this to a garage
 * on Rikili: the RLS policy only lets an owner write source='manual' records,
 * so history for a real platform job can only be written by the shop that did
 * it. That is the point — otherwise anyone could invent a service record.
 */
function ManualRecordForm({
  vehicleId,
  currentMileage,
  pending,
  error,
  onSubmit,
}: ManualRecordFormProps) {
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [garageName, setGarageName] = useState('')
  const [work, setWork] = useState('')
  const [odometer, setOdometer] = useState('')
  const [labour, setLabour] = useState('')
  const [partsCost, setPartsCost] = useState('')
  const [parts, setParts] = useState<PartInput[]>([{ ...EMPTY_PART }])

  function updatePart(index: number, patch: Partial<PartInput>) {
    setParts((current) => current.map((part, i) => (i === index ? { ...part, ...patch } : part)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit({
      vehicle_id: vehicleId,
      service_date: serviceDate,
      odometer: odometer ? Number(odometer) : null,
      work_performed: work.trim(),
      external_garage_name: garageName.trim(),
      labour_cost: labour ? Number(labour) : 0,
      parts_cost: partsCost ? Number(partsCost) : 0,
      parts,
    })
  }

  return (
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

          <Field label="Garage" hint="The shop that did the work.">
            {(id) => (
              <TextInput
                id={id}
                required
                maxLength={160}
                placeholder="Sunrise Garage (Charlotte)"
                value={garageName}
                onChange={(event) => setGarageName(event.target.value)}
              />
            )}
          </Field>

          <Field label="Odometer" hint={`Currently ${miles(currentMileage)}.`}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                min={0}
                placeholder={String(currentMileage)}
                value={odometer}
                onChange={(event) => setOdometer(event.target.value)}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
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
            <Field label="Parts total">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={partsCost}
                  onChange={(event) => setPartsCost(event.target.value)}
                />
              )}
            </Field>
          </div>
        </div>

        <Field label="Work performed">
          {(id) => (
            <Textarea
              id={id}
              rows={3}
              required
              placeholder="Timing belt and water pump replaced."
              value={work}
              onChange={(event) => setWork(event.target.value)}
            />
          )}
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700">Parts (optional)</legend>
          {parts.map((part, index) => (
            <div key={index} className="grid grid-cols-[1fr_5rem_7rem] gap-2">
              <TextInput
                aria-label="Part name"
                placeholder="Oil filter"
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

        {error ? <ErrorNotice error={error} what="the record" /> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save record'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
