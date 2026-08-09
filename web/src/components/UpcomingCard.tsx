import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UpcomingServiceItem } from '@/data/vehicles'

type UpcomingCardProps = {
  service: UpcomingServiceItem
}

export function UpcomingCard({ service }: UpcomingCardProps) {
  const Icon = service.icon

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950">
                {service.serviceName}
              </h3>
              <p className="mt-1 truncate text-xs text-slate-500">{service.workshop}</p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {service.date} · {service.time}
              </p>
            </div>
          </div>

          <Badge>Upcoming</Badge>
        </div>
      </Card>
    </motion.div>
  )
}
