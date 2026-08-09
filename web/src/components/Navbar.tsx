import { Bell, ChevronDown } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <SearchBar />

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <Badge>Owner View</Badge>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 pr-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              D
            </span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Daniel</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  )
}