import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { HealthIndicator } from '@/components/HealthIndicator'
import { miles } from '@/lib/format'
import { HEALTH_LABEL, type Health } from '@/features/vehicles/health'
import type { Vehicle } from '@/features/vehicles/useVehicles'

type VehicleCardProps = {
  vehicle: Vehicle
  health: Health
  /** One line under the title — usually the next thing due. */
  note?: string
}

/**
 * Vehicles have no photo in the schema, and asking owners to upload one to see
 * their own car would be a poor trade. A tinted tile with the marque's initial
 * is derived from data we always have, and looks deliberate for any vehicle
 * rather than only the handful we happen to ship art for.
 */
const TONES: [string, ...string[]] = [
  'from-slate-100 via-slate-200 to-indigo-100 text-indigo-600',
  'from-slate-100 via-sky-100 to-sky-200 text-sky-700',
  'from-slate-100 via-rose-100 to-rose-200 text-rose-700',
  'from-slate-100 via-emerald-100 to-emerald-200 text-emerald-700',
  'from-slate-100 via-amber-100 to-amber-200 text-amber-700',
]

function toneFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997
  return TONES[hash % TONES.length] ?? TONES[0]
}

export function VehicleCard({ vehicle, health, note }: VehicleCardProps) {
  const title = [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Vehicle'
  const tone = toneFor(vehicle.brand ?? vehicle.registration_number)

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
      <Card className="overflow-hidden">
        <Link to={`/garage/${vehicle.id}`} className="block">
          <div className={['relative h-44 overflow-hidden bg-gradient-to-br p-5', tone].join(' ')}>
            <div className="absolute inset-x-8 bottom-8 h-24 rounded-[2rem] bg-white/35 blur-2xl" />
            <HealthIndicator status={health} />

            <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              {HEALTH_LABEL[health]}
            </div>

            <div className="absolute inset-0 grid place-items-center">
              <span className="text-6xl font-semibold tracking-tight opacity-70">
                {(vehicle.brand ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="absolute bottom-4 left-5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 shadow-sm">
              {vehicle.registration_number}
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{vehicle.year ?? '—'}</p>
              </div>

              <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {miles(vehicle.mileage)}
              </div>
            </div>

            <p className="text-sm text-slate-600">{note ?? 'Nothing scheduled.'}</p>
          </div>
        </Link>
      </Card>
    </motion.div>
  )
}
