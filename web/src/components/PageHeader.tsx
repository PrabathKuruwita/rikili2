import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  back?: { to: string; label: string }
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, back, actions }: PageHeaderProps) {
  return (
    <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link
            to={back.to}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {back.label}
          </Link>
        ) : null}

        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        ) : null}

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </Card>
  )
}
