import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { statistics, vehicles, upcomingServices, reminders } from '@/data/vehicles'
import { StatsCard } from '@/components/StatsCard'
import { VehicleCard } from '@/components/VehicleCard'
import { UpcomingCard } from '@/components/UpcomingCard'
import { ReminderCard } from '@/components/ReminderCard'

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export default function Dashboard() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            MyVehicle overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, Daniel
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Here&apos;s what&apos;s happening across your vehicles today.
          </p>
        </div>

        <Button className="self-start sm:self-auto">Book a Service</Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Your vehicles</h2>
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
            >
              View all
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.plate} vehicle={vehicle} />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Upcoming Services
              </h2>
              <button
                type="button"
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
              >
                History
              </button>
            </div>

            <div className="space-y-3">
              {upcomingServices.map((service) => (
                <UpcomingCard key={service.serviceName} service={service} />
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Reminders</h2>
              <button
                type="button"
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
              >
                All
              </button>
            </div>

            <div className="space-y-3">
              {reminders.map((reminder) => (
                <ReminderCard key={reminder.title} {...reminder} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </motion.div>
  )
}
