import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { vehicles } from '@/data/vehicles'
import { VehicleCard } from '@/components/VehicleCard'

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export default function MyVehicles() {
  return (
    <motion.div id="vehicles" variants={pageVariants} initial="hidden" animate="show" className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">My Vehicles</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Manage your garage, health status, and upcoming service dates.
          </p>
        </div>

        <Button className="self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.plate} vehicle={vehicle} />
        ))}
      </section>
    </motion.div>
  )
}