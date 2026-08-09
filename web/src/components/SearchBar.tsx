import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
  placeholder?: string
}

export function SearchBar({ placeholder = 'Search vehicles, records, stations...' }: SearchBarProps) {
  return (
    <label className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
      <Search className="h-4 w-4 text-slate-400" />
      <Input placeholder={placeholder} className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0" />
    </label>
  )
}