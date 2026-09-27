export type ServiceStation = {
  name: string
  address: string
  distance: string
  rating: string
  reviews: string
  status: 'Open' | 'Closed'
  categories: string[]
  image: string
  markerTone: 'indigo' | 'sky' | 'emerald' | 'amber'
}

export const serviceStations: ServiceStation[] = [
  {
    name: 'Precision Auto Care',
    address: '450 Bryant St · 1.2km',
    distance: '1.2 km',
    rating: '4.8',
    reviews: '1,240',
    status: 'Open',
    categories: ['Oil Change', 'Brakes', 'Tires'],
    image: '/stations/precision-auto-care.svg',
    markerTone: 'indigo',
  },
  {
    name: 'Bay Area Motorworks',
    address: '1200 Folsom St · 2.7km',
    distance: '2.7 km',
    rating: '4.6',
    reviews: '860',
    status: 'Open',
    categories: ['Oil Change', 'Transmission', 'Emission Test'],
    image: '/stations/bay-area-motorworks.svg',
    markerTone: 'sky',
  },
  {
    name: 'Golden Gate Service',
    address: '88 Divisadero St · 3.9km',
    distance: '3.9 km',
    rating: '4.9',
    reviews: '2,010',
    status: 'Closed',
    categories: ['Brakes', 'Tires', 'Diagnostics'],
    image: '/stations/golden-gate-service.svg',
    markerTone: 'amber',
  },
  {
    name: 'Marina Auto Hub',
    address: '2020 Lombard St · 5.0km',
    distance: '5.0 km',
    rating: '4.5',
    reviews: '540',
    status: 'Open',
    categories: ['Oil Change', 'Battery', 'EV Service'],
    image: '/stations/marina-auto-hub.svg',
    markerTone: 'emerald',
  },
]