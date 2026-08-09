import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { ErrorNotice } from '@/components/QueryState'
import { useAddVehicle } from '@/features/vehicles/useVehicles'

export default function AddVehicle() {
  const navigate = useNavigate()
  const addVehicle = useAddVehicle()

  const [registration, setRegistration] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const vehicle = await addVehicle.mutateAsync({
      registration_number: registration.trim().toUpperCase(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      year: year ? Number(year) : null,
      mileage: mileage ? Number(mileage) : 0,
    })

    navigate(`/garage/${vehicle.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        back={{ to: '/garage', label: 'My Vehicles' }}
        title="Add a vehicle"
        description="Only the registration is required — the rest can be filled in later."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Registration number" hint="Must be unique across your own vehicles.">
            {(id) => (
              <TextInput
                id={id}
                required
                autoFocus
                maxLength={20}
                placeholder="NC-4821"
                value={registration}
                onChange={(event) => setRegistration(event.target.value)}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Make">
              {(id) => (
                <TextInput
                  id={id}
                  maxLength={60}
                  placeholder="Toyota"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                />
              )}
            </Field>

            <Field label="Model">
              {(id) => (
                <TextInput
                  id={id}
                  maxLength={60}
                  placeholder="Corolla"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                />
              )}
            </Field>

            <Field label="Year">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1900}
                  max={2100}
                  placeholder="2019"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                />
              )}
            </Field>

            <Field label="Current mileage">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={0}
                  placeholder="62400"
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value)}
                />
              )}
            </Field>
          </div>

          {addVehicle.error ? (
            <ErrorNotice error={addVehicle.error} what="the new vehicle" />
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/garage')}>
              Cancel
            </Button>
            <Button type="submit" disabled={addVehicle.isPending}>
              {addVehicle.isPending ? 'Saving…' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
