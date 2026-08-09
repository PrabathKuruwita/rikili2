export type UserRole = 'owner' | 'station';

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export type ReminderType = 'service' | 'oil' | 'insurance' | 'emission' | 'booking';

export type ReminderChannel = 'email' | 'sms' | 'push';

export interface Vehicle {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  mileage: number;
  healthScore: number;
  imageUrl: string;
  nextServiceDue: string;
  insuranceExpiry: string;
  emissionExpiry: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  openNow: boolean;
  imageUrl: string;
  services: string[];
  lat: number;
  lng: number;
}

export interface Appointment {
  id: string;
  vehicleId: string;
  stationId: string;
  serviceType: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface PartReplaced {
  name: string;
  cost: number;
}

export interface ServiceLog {
  id: string;
  vehicleId: string;
  stationName: string;
  serviceType: string;
  date: string;
  mileage: number;
  mechanic: string;
  invoiceNo: string;
  totalCost: number;
  workPerformed: string[];
  partsReplaced: PartReplaced[];
}

export interface Reminder {
  id: string;
  vehicleId: string;
  type: ReminderType;
  title: string;
  message: string;
  dueDate: string;
  read: boolean;
  channel: ReminderChannel[];
}

export interface CurrentUser {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  memberSince: string;
}

export interface StationJob {
  id: string;
  customer: string;
  vehicle: string;
  plate: string;
  service: string;
  mechanic: string;
  bay: string;
  status: 'in-progress' | 'waiting' | 'completed';
}

export interface StationBookings {
  today: number;
  week: number;
  month: number;
  revenue: number;
  completionRate: number;
  daily: number[];
  jobs: StationJob[];
}
