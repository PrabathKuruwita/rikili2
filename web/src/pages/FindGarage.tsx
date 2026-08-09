import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonClasses } from '@/components/ui/button-styles'
import { TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState, ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useGarages } from '@/features/garages/useGarages'
import { currency } from '@/lib/format'

export default function FindGarage() {
  const garages = useGarages()
  const [search, setSearch] = useState('')

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return garages.data ?? []

    return (garages.data ?? []).filter((garage) => {
      const haystack = [
        garage.name,
        garage.address,
        ...garage.garage_services.map((service) => service.service_type?.name ?? ''),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [garages.data, search])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Book a service"
        title="Find a garage"
        description="Every garage on Rikili, and what they charge."
      />

      <Card className="p-4">
        <TextInput
          type="search"
          placeholder="Search by name, area, or service — try “brake”"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {garages.isPending ? (
        <LoadingRows rows={3} />
      ) : garages.isError ? (
        <ErrorNotice error={garages.error} what="the garage list" />
      ) : results.length === 0 ? (
        <EmptyState
          title="No garages match"
          description="Try a broader search, or clear it to see everyone."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((garage) => (
            <Card key={garage.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                    {garage.name}
                  </h2>

                  {garage.address ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{garage.address}</span>
                    </p>
                  ) : null}

                  {garage.phone ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {garage.phone}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {garage.rating !== null ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {garage.rating}
                    </span>
                  ) : null}
                  <Badge variant="outline">
                    {garage.bay_count} bay{garage.bay_count === 1 ? '' : 's'}
                  </Badge>
                </div>
              </div>

              {garage.garage_services.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {garage.garage_services.slice(0, 4).map((service) => (
                    <li key={service.id} className="flex items-baseline gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-slate-700">
                        {service.service_type?.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {service.duration_minutes ? `${service.duration_minutes} min` : ''}
                      </span>
                      <span className="font-medium tabular-nums text-slate-900">
                        {service.price === null ? '—' : currency(service.price)}
                      </span>
                    </li>
                  ))}
                  {garage.garage_services.length > 4 ? (
                    <li className="text-xs text-slate-400">
                      +{garage.garage_services.length - 4} more
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  No published price list.
                </p>
              )}

              <div className="mt-5 flex justify-end">
                <Link to={`/book/${garage.id}`} className={buttonClasses()}>
                  Pick a slot
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
