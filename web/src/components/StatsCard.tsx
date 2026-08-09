import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

type StatsCardProps = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  accent: 'indigo' | 'sky' | 'emerald' | 'amber'
}

const ACCENT_CLASSES: Record<StatsCardProps['accent'], string> = {
  indigo: 'from-indigo-500 to-indigo-400 text-indigo-600',
  sky: 'from-sky-500 to-cyan-400 text-sky-600',
  emerald: 'from-emerald-500 to-lime-400 text-emerald-600',
  amber: 'from-amber-500 to-orange-400 text-amber-600',
}

export function StatsCard({ label, value, detail, icon: Icon, accent }: StatsCardProps) {
  const accentClasses = ACCENT_CLASSES[accent]

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>

          <div
            className={[
              'grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br shadow-sm',
              accentClasses,
            ].join(' ')}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{detail}</p>
      </Card>
    </motion.div>
  )
}
