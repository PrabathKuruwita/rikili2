import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'

export type Vehicle = Tables<'vehicles'>

export const vehicleKeys = {
  all: ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
}

/**
 * Every vehicle the caller can see.
 *
 * There is no `.eq('owner_id', user.id)` here on purpose. RLS already scopes
 * the table to the caller's own vehicles, plus any vehicle a garage owner has
 * had booked in — filtering again in the client would silently break the
 * garage-side reads and hide it if the policy ever regressed.
 */
export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: async () =>
      unwrap(await supabase.from('vehicles').select('*').order('created_at', { ascending: true })),
  })
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => unwrap(await supabase.from('vehicles').select('*').eq('id', id!).single()),
  })
}

export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicle: Omit<TablesInsert<'vehicles'>, 'owner_id'>) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      // owner_id is required by the insert policy's WITH CHECK, so it has to be
      // sent explicitly — the column has no default.
      return unwrap(
        await supabase
          .from('vehicles')
          .insert({ ...vehicle, owner_id: auth.user.id })
          .select()
          .single(),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...patch }: TablesUpdate<'vehicles'> & { id: string }) =>
      unwrap(await supabase.from('vehicles').update(patch).eq('id', id).select().single()),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicle.id) })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return id
    },
    // Bookings, records and reminders all cascade from the vehicle, so the
    // safe move is to drop everything rather than guess what survived.
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
