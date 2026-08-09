type HealthIndicatorProps = {
  status: 'green' | 'orange' | 'red'
}

const STATUS_CLASSES: Record<HealthIndicatorProps['status'], string> = {
  green: 'border-emerald-500 text-emerald-500',
  orange: 'border-orange-400 text-orange-500',
  red: 'border-rose-500 text-rose-500',
}

const DOT_CLASSES: Record<HealthIndicatorProps['status'], string> = {
  green: 'bg-emerald-500',
  orange: 'bg-orange-400',
  red: 'bg-rose-500',
}

export function HealthIndicator({ status }: HealthIndicatorProps) {
  return (
    <div
      className={[
        'absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[3px] bg-white shadow-sm',
        STATUS_CLASSES[status],
      ].join(' ')}
    >
      <span className={['h-2.5 w-2.5 rounded-full', DOT_CLASSES[status]].join(' ')} />
    </div>
  )
}
