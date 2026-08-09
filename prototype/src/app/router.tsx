import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import AppLayout from '../components/shell/AppLayout';
import { RequireAuth } from '../components/auth/RequireAuth';
import { Dashboard } from '../pages/Dashboard';
import { Vehicles } from '../pages/Vehicles';
import { VehicleDetail } from '../pages/VehicleDetail';
import { BookService } from '../pages/BookService';
import { ServiceRecords } from '../pages/ServiceRecords';
import { Reminders } from '../pages/Reminders';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { StationDashboard } from '../pages/StationDashboard';
import { LogService } from '../pages/LogService';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/book" element={<BookService />} />
          <Route path="/records" element={<ServiceRecords />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/station" element={<StationDashboard />} />
          <Route path="/log-service" element={<LogService />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
