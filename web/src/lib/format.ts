/**
 * Display formatting.
 *
 * Everything the UI shows to a person goes through here, so dates and money
 * look the same on every screen and there is one place to change them.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const wholeMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const dayMonth = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const clockTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const weekdayTime = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/**
 * Postgres `numeric` arrives as a string, because it holds values a JS number
 * cannot represent exactly. Costs here are small enough that Number() is safe,
 * but the conversion has to be deliberate — `'160.00' + '129.00'` is a string
 * concatenation bug that only shows up as a wrong total on screen.
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'number' ? value : Number(value)
}

export function currency(value: string | number | null | undefined): string {
  return money.format(toNumber(value))
}

export function currencyRounded(value: string | number | null | undefined): string {
  return wholeMoney.format(toNumber(value))
}

export function miles(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString('en-US')} mi`
}

/** "Aug 12" — for dense lists where the year is obvious from context. */
export function shortDate(value: string | Date): string {
  return dayMonth.format(new Date(value))
}

/** "Aug 12, 2026" — for anything historical, where the year matters. */
export function longDate(value: string | Date): string {
  return fullDate.format(new Date(value))
}

/** "9:30 AM" */
export function time(value: string | Date): string {
  return clockTime.format(new Date(value))
}

/** "Tue, Aug 12, 9:30 AM" */
export function dateTime(value: string | Date): string {
  return weekdayTime.format(new Date(value))
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * "in 3 days" / "2 hours ago". Intl.RelativeTimeFormat handles the grammar and
 * the pluralisation; picking the unit is the part we have to do ourselves.
 */
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

export function relativeTime(value: string | Date): string {
  const delta = new Date(value).getTime() - Date.now()
  const magnitude = Math.abs(delta)

  if (magnitude < HOUR) return relative.format(Math.round(delta / MINUTE), 'minute')
  if (magnitude < DAY) return relative.format(Math.round(delta / HOUR), 'hour')
  if (magnitude < 30 * DAY) return relative.format(Math.round(delta / DAY), 'day')
  return relative.format(Math.round(delta / (30 * DAY)), 'month')
}

/** Whole days from today to `value`; negative once it is in the past. */
export function daysUntil(value: string | Date): number {
  const target = new Date(value)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / DAY)
}

/** "Oil Change" from the enum value "oil_change". */
export function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** "AL" from "Ada Lovelace", for avatar tiles. */
export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
