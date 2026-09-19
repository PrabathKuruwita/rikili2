import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { initialAppointments, initialReminders } from '../data/mockData';
import type { Appointment, Reminder, UserRole } from '../types';

interface AppContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  appointments: Appointment[];
  bookAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  reminders: Reminder[];
  markReminderRead: (id: string) => void;
  markAllRemindersRead: () => void;
  toast: (message: string) => void;
  toastMessage: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('owner');
  const [appointments, setAppointments] = useState(initialAppointments);
  const [reminders, setReminders] = useState(initialReminders);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2800);
  }, []);

  const bookAppointment = useCallback(
    (appt: Omit<Appointment, 'id' | 'status'>) => {
      setAppointments((prev) => [
        ...prev,
        {
          ...appt,
          id: `a${Date.now()}`,
          status: 'upcoming',
        },
      ]);
    },
    [],
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)),
    );
  }, []);

  const markReminderRead = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, read: true } : r)),
    );
  }, []);

  const markAllRemindersRead = useCallback(() => {
    setReminders((prev) => prev.map((r) => ({ ...r, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      appointments,
      bookAppointment,
      updateAppointment,
      cancelAppointment,
      reminders,
      markReminderRead,
      markAllRemindersRead,
      toast,
      toastMessage,
    }),
    [
      role,
      appointments,
      bookAppointment,
      updateAppointment,
      cancelAppointment,
      reminders,
      markReminderRead,
      markAllRemindersRead,
      toast,
      toastMessage,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
