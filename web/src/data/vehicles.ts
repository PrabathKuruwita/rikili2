import type { LucideIcon } from 'lucide-react'
import { BellRing, CalendarDays, CarFront, Gauge, LayoutDashboard, ListChecks, Settings, Wrench } from 'lucide-react'

export type NavItem = {
  label: string
  icon: LucideIcon
  href: string
  active?: boolean
}

export type StatItem = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  accent: 'indigo' | 'sky' | 'emerald' | 'amber'
}

export type VehicleItem = {
  name: string
  model: string
  mileage: string
  serviceDue: string
  status: 'green' | 'orange' | 'red'
  plate: string
  tone: 'indigo' | 'sky' | 'rose'
  image: string
}

export type UpcomingServiceItem = {
  serviceName: string
  workshop: string
  date: string
  time: string
  icon: LucideIcon
}

export type ReminderItem = {
  title: string
  description: string
}

export const navigationItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard', active: true },
  { label: 'My Vehicles', icon: CarFront, href: '#vehicles' },
  { label: 'Book Service', icon: Wrench, href: '#book-service' },
  { label: 'Service Records', icon: ListChecks, href: '#service-records' },
  { label: 'Reminders', icon: BellRing, href: '#reminders' },
  { label: 'Reports', icon: Gauge, href: '#reports' },
  { label: 'Settings', icon: Settings, href: '#settings' },
]

export const statistics: StatItem[] = [
  { label: 'Vehicles', value: '3', detail: 'In your garage', icon: CarFront, accent: 'indigo' },
  { label: 'Average Health Score', value: '76%', detail: '+3% this week', icon: Gauge, accent: 'emerald' },
  { label: 'Upcoming Services', value: '2', detail: 'Next 7 days', icon: CalendarDays, accent: 'sky' },
  { label: 'Unread Reminders', value: '3', detail: 'Action needed', icon: BellRing, accent: 'amber' },
]

export const vehicles: VehicleItem[] = [
  {
    name: 'Tesla Model 3',
    model: '2022 Tesla Model 3',
    mileage: '34,210 mi',
    serviceDue: 'Service due Aug 12',
    status: 'green',
    plate: '8YKA221',
    tone: 'indigo',
    image: '/vehicles/tesla-model-3.svg',
  },
  {
    name: 'Toyota RAV4',
    model: '2020 Toyota RAV4',
    mileage: '68,940 mi',
    serviceDue: 'Service due Jul 28',
    status: 'orange',
    plate: '4TRB910',
    tone: 'sky',
    image: '/vehicles/toyota-rav4.svg',
  },
  {
    name: 'Ford F-150',
    model: '2019 Ford F-150',
    mileage: '91,300 mi',
    serviceDue: 'Brake inspection due soon',
    status: 'red',
    plate: '2LMC554',
    tone: 'rose',
    image: '/vehicles/ford-f150.svg',
  },
]

export const upcomingServices: UpcomingServiceItem[] = [
  {
    serviceName: 'Emission Test',
    workshop: 'Work Truck · Golden Gate Service',
    date: 'Jul 19, 2026',
    time: '14:00',
    icon: CalendarDays,
  },
  {
    serviceName: 'Full Service + Oil Change',
    workshop: 'Weekend SUV · Precision Auto Care',
    date: 'Jul 28, 2026',
    time: '09:30',
    icon: Wrench,
  },
]

export const reminders: ReminderItem[] = [
  {
    title: 'Emission test due soon',
    description: 'Work Truck (Ford F-150) emission certificate expires Jul 25.',
  },
  {
    title: 'Service appointment confirmed',
    description: 'Full Service booked at Precision Auto Care on Jul 28, 09:30 AM.',
  },
]