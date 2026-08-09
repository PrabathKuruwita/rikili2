import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { navigationItems } from '@/data/vehicles'
import { Badge } from '@/components/ui/badge'

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="flex items-center gap-3 px-1 pb-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <span className="text-sm font-bold">M</span>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">MyVehicle</p>
            <p className="text-sm text-slate-500">Vehicle Management</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <motion.a
                href={item.href}
                key={item.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={[
                  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  item.active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <Icon className={['h-4 w-4', item.active ? 'text-white' : 'text-slate-400'].join(' ')} />
                  {item.label}
                </span>
                {item.active ? <ChevronRight className="h-4 w-4 text-white/80" /> : null}
              </motion.a>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Keep your fleet organized and service-ready.</p>
              </div>
              <Badge variant="outline">Pro</Badge>
            </div>
          </div>

          <motion.a
            href="#settings"
            whileHover={{ x: 4 }}
            className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Settings
          </motion.a>
        </div>
      </div>
    </aside>
  )
}