import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { HealthIndicator } from '@/components/HealthIndicator'
import type { VehicleItem } from '@/data/vehicles'

type VehicleCardProps = {
  vehicle: VehicleItem
}

const IMAGE_TONES: Record<VehicleItem['tone'], string> = {
  indigo: 'from-slate-100 via-slate-200 to-indigo-100',
  sky: 'from-slate-100 via-sky-100 to-sky-200',
  rose: 'from-slate-100 via-rose-100 to-rose-200',
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
      <Card className="overflow-hidden">
        <div className={['relative h-52 overflow-hidden bg-gradient-to-br p-5', IMAGE_TONES[vehicle.tone]].join(' ')}>
          <div className="absolute inset-x-8 bottom-8 h-24 rounded-[2rem] bg-white/35 blur-2xl" />
          <HealthIndicator status={vehicle.status} />

          <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
            {vehicle.status === 'green' ? 'Healthy' : vehicle.status === 'orange' ? 'Due soon' : 'Attention'}
          </div>

          <div className="absolute inset-x-10 bottom-8 h-20 rounded-[2rem] border border-white/60 bg-white/55 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur">
            <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-contain p-3 drop-shadow-[0_20px_20px_rgba(15,23,42,0.18)]" />
          </div>

          <div className="absolute bottom-4 left-5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 shadow-sm">
            {vehicle.plate}
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{vehicle.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{vehicle.model}</p>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {vehicle.mileage}
            </div>
          </div>

          <p className="text-sm text-slate-600">{vehicle.serviceDue}</p>
        </div>
      </Card>
    </motion.div>
  )
}