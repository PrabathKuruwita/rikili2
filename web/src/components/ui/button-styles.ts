type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm'

const VARIANTS: Record<ButtonVariant, string> = {
  default: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
}

const SIZES: Record<ButtonSize, string> = {
  default: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

export type { ButtonVariant, ButtonSize }

/**
 * Shared button styling, kept out of button.tsx so that file only exports a
 * component — a module mixing components and helpers breaks Fast Refresh.
 *
 * Exported at all so a react-router <Link> can look identical without Button
 * growing an `asChild` escape hatch: something that navigates should stay an
 * anchor rather than becoming a button with an onClick.
 */
export function buttonClasses({
  variant = 'default',
  size = 'default',
  className = '',
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    SIZES[size],
    VARIANTS[variant],
    className,
  ].join(' ')
}
