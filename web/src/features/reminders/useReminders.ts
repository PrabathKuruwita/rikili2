import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import { vehicleKeys } from '@/features/vehicles/useVehicles'
import type { Enums, Tables, TablesInsert } from '@/types/database'

export type Reminder = Tables<'reminders'>

/** A reminder with just enough of its vehicle to label it on screen. */
export type ReminderWithVehicle = Reminder & {
  vehicle: Pick<
    Tables<'vehicles'>,
    'id' | 'brand' | 'model' | 'registration_number' | 'mileage'
  > | null
}

export const reminderKeys = {
  all: ['reminders'] as const,
}

export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.all,
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from('reminders')
          .select('*, vehicle:vehicles(id, brand, model, registration_number, mileage)')
          .order('due_date', { ascending: true, nullsFirst: false }),
      )
      return rows as unknown as ReminderWithVehicle[]
    },
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reminder: Omit<TablesInsert<'reminders'>, 'owner_id'>) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      return unwrap(
        await supabase
          .from('reminders')
          .insert({ ...reminder, owner_id: auth.user.id })
          .select()
          .single(),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}

export function useSetReminderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Enums<'reminder_status'> }) =>
      unwrap(await supabase.from('reminders').update({ status }).eq('id', id).select().single()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all })
      // Vehicle health is derived from reminders, so the cards move too.
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}

export function useDeleteReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}
