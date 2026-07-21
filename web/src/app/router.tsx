import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole } from './RequireAuth'
import { AppLayout } from './AppLayout'
import { Placeholder } from '@/components/Placeholder'
import LoginPage from '@/pages/LoginPage'

/**
 * Route map for the whole app.
 *
 * Every screen below is a Placeholder on purpose — this is a scaffold. To build
 * one, swap the element for a real page component under src/pages/ and give it
 * a matching folder under src/features/ for its hooks and queries.
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

          // Pick a role — shown when a signed-in user has no role assigned yet.
          { path: '/onboarding', element: <Placeholder title="Choose your account type" /> },

          // ---- Vehicle owner ----
          {
            element: <RequireRole allow={['owner']} />,
            children: [
              { path: '/garage', element: <Placeholder title="My Vehicles" /> },
              { path: '/garage/:vehicleId', element: <Placeholder title="Vehicle Detail" /> },
              {
                path: '/garage/:vehicleId/history',
                element: <Placeholder title="Service History" />,
              },
              { path: '/book', element: <Placeholder title="Find a Garage" /> },
              { path: '/book/:stationId', element: <Placeholder title="Pick a Slot" /> },
              { path: '/bookings', element: <Placeholder title="My Bookings" /> },
              { path: '/reminders', element: <Placeholder title="Reminders" /> },
            ],
          },

          // ---- Garage side ----
          {
            element: <RequireRole allow={['mechanic', 'station_manager']} />,
            children: [
              { path: '/station', element: <Placeholder title="Station Dashboard" /> },
              { path: '/station/bookings', element: <Placeholder title="Booking Queue" /> },
              { path: '/station/jobs', element: <Placeholder title="Job Board" /> },
              { path: '/station/jobs/:jobId', element: <Placeholder title="Log Work Performed" /> },
              { path: '/station/customers', element: <Placeholder title="Customers" /> },
            ],
          },

          // Manager-only: reporting and staff admin.
          {
            element: <RequireRole allow={['station_manager']} />,
            children: [
              { path: '/station/reports', element: <Placeholder title="Reports" /> },
              { path: '/station/staff', element: <Placeholder title="Staff" /> },
            ],
          },

          // ---- Platform admin ----
          {
            element: <RequireRole allow={['admin']} />,
            children: [{ path: '/admin', element: <Placeholder title="Admin" /> }],
          },

          { path: '/settings', element: <Placeholder title="Settings" /> },
        ],
      },
    ],
  },

  { path: '*', element: <Placeholder title="Not found" /> },
])
