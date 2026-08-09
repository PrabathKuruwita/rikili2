import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
