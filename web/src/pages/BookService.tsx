import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { serviceStations } from '@/data/bookService'
import { ServiceStationCard } from '@/components/ServiceStationCard'

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const markers = [
  { top: '18%', left: '21%', tone: 'bg-slate-900' },
  { top: '58%', left: '17%', tone: 'bg-indigo-600' },
  { top: '41%', left: '62%', tone: 'bg-slate-900' },
  { top: '70%', left: '49%', tone: 'bg-slate-900' },
]

export default function BookService() {
  return (
    <motion.div id="book-service" variants={pageVariants} initial="hidden" animate="show" className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Book Service</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Choose a nearby garage and book your next service visit.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="text-sm font-medium text-slate-500">{serviceStations.length} stations found</div>

          <div className="space-y-4">
            {serviceStations.map((station) => (
              <ServiceStationCard key={station.name} station={station} />
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="relative min-h-[720px] overflow-hidden rounded-[1.25rem] bg-slate-100">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:48px_48px] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_55%)]" />
            <div className="absolute right-8 top-1/3 text-2xl font-semibold tracking-[0.2em] text-slate-400/80">SAN FRANCISCO</div>

            {markers.map((marker, index) => (
              <div
                key={`${marker.top}-${marker.left}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ top: marker.top, left: marker.left }}
              >
                <div className={['grid h-10 w-10 place-items-center rounded-full border-4 border-white shadow-lg', marker.tone].join(' ')}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="mt-1 h-8 w-px bg-slate-300/80" />
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                {index === 1 ? <div className="absolute -right-8 top-4 h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_0_8px_rgba(99,102,241,0.12)]" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}