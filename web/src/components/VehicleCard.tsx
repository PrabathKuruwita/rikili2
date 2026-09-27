import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const statusLabel =
    vehicle.status === 'green' ? 'Healthy' : vehicle.status === 'orange' ? 'Needs Attention' : 'Service Soon'

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
      <Card className="overflow-hidden border-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className={['relative h-40 overflow-hidden bg-gradient-to-br p-4', IMAGE_TONES[vehicle.tone]].join(' ')}>
          <img src={vehicle.image} alt={vehicle.name} className="h-full w-full rounded-[1.125rem] object-cover" />
          <HealthIndicator status={vehicle.status} />
          </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{vehicle.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{vehicle.model}</p>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {vehicle.mileage}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Plate</p>
              <p className="mt-1 font-medium text-slate-700">{vehicle.plate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Mileage</p>
              <p className="mt-1 font-medium text-slate-700">{vehicle.mileage}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Next service</p>
              <p className="mt-1 font-medium text-slate-700">{vehicle.nextService}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Color</p>
              <p className="mt-1 font-medium text-slate-700">{vehicle.color}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Badge
              variant={vehicle.status === 'green' ? 'success' : vehicle.status === 'orange' ? 'warning' : 'outline'}
            >
              {statusLabel}
            </Badge>

            <Button variant="ghost" className="h-auto px-0 py-0 text-sm font-semibold text-indigo-600 hover:bg-transparent hover:text-indigo-500">
              Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}