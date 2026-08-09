import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole } from './RequireAuth'
import { AppLayout } from './AppLayout'
import LoginPage from '@/pages/LoginPage'
import Onboarding from '@/pages/Onboarding'
import Settings from '@/pages/Settings'
// Vehicle owner
import Dashboard from '@/pages/Dashboard'
import AddVehicle from '@/pages/AddVehicle'
import VehicleDetail from '@/pages/VehicleDetail'
import ServiceHistory from '@/pages/ServiceHistory'
import FindGarage from '@/pages/FindGarage'
import PickSlot from '@/pages/PickSlot'
import MyBookings from '@/pages/MyBookings'
import RemindersPage from '@/pages/RemindersPage'
// Garage owner
import StationDashboard from '@/pages/StationDashboard'
import BookingQueue from '@/pages/BookingQueue'
import JobBoard from '@/pages/JobBoard'
import LogWork from '@/pages/LogWork'
import Customers from '@/pages/Customers'
import StationReports from '@/pages/StationReports'

/**
 * Route map for the whole app.
 *
 * RequireRole decides which half of the app a signed-in user can reach, but it
 * is a UX convenience only — the real boundary is RLS. Every screen below
 * queries through policies that scope rows to the caller, which is why the same
 * bookings query serves an owner their bookings and a garage its queue.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/garage" replace /> },

          // Shown when a signed-in user has no role in their token.
          { path: '/onboarding', element: <Onboarding /> },

          // ---- Vehicle owner ----
          {
            element: <RequireRole allow={['vehicle_owner']} />,
            children: [
              { path: '/garage', element: <Dashboard /> },
              // Static before dynamic, so /garage/new is not read as a uuid.
              { path: '/garage/new', element: <AddVehicle /> },
              { path: '/garage/:vehicleId', element: <VehicleDetail /> },
              { path: '/garage/:vehicleId/history', element: <ServiceHistory /> },
              { path: '/book', element: <FindGarage /> },
              { path: '/book/:stationId', element: <PickSlot /> },
              { path: '/bookings', element: <MyBookings /> },
              { path: '/reminders', element: <RemindersPage /> },
            ],
          },

          // ---- Garage side ----
          // One role covers the whole station: mechanics share the garage
          // owner's login, so there is no mechanic/manager split to guard.
          {
            element: <RequireRole allow={['garage_owner']} />,
            children: [
              { path: '/station', element: <StationDashboard /> },
              { path: '/station/bookings', element: <BookingQueue /> },
              { path: '/station/jobs', element: <JobBoard /> },
              { path: '/station/jobs/:jobId', element: <LogWork /> },
              { path: '/station/customers', element: <Customers /> },
              { path: '/station/reports', element: <StationReports /> },
            ],
          },

          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
