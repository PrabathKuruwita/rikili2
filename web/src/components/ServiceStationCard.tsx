import { motion } from 'framer-motion'
import { MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ServiceStation } from '@/data/bookService'

type ServiceStationCardProps = {
  station: ServiceStation
}

export function ServiceStationCard({ station }: ServiceStationCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      <Card className="overflow-hidden p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
            <img src={station.image} alt={station.name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-950">{station.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {station.address}
                </p>
              </div>
              <Badge variant={station.status === 'Open' ? 'success' : 'outline'}>{station.status}</Badge>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{station.rating}</span>
              <span>({station.reviews})</span>
              <span className="ml-auto text-slate-400">{station.distance}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {station.categories.map((category) => (
                <span key={category} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                  {category}
                </span>
              ))}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">+</span>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button className="h-9 px-4 py-2 text-sm">Book Here</Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}