import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/card'

/**
 * The three states every screen on this app has to render, in one place.
 *
 * Without something like this each page invents its own, and the pending state
 * is usually the one that gets skipped — which reads as an empty screen and
 * sends people looking for a bug in the query.
 */

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  )
}

export function LoadingCards({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: cards }, (_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  )
}

export function ErrorNotice({ error, what }: { error: unknown; what: string }) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <Card className="border-rose-200 bg-rose-50/60 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-rose-900">Could not load {what}</p>
          {/* Surfaced rather than swallowed: on this stack a failure is usually
              an RLS policy saying no, and the Postgres message says which. */}
          <p className="mt-1 break-words text-sm text-rose-700">{message}</p>
        </div>
      </div>
    </Card>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  )
}
