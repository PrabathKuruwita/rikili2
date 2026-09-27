import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

type ReminderCardProps = {
  title: string
  description: string
}

export function ReminderCard({ title, description }: ReminderCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </Card>
    </motion.div>
  )
}