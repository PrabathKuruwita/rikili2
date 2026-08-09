import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap, unwrapMaybe } from '@/lib/query'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'

export type Garage = Tables<'garages'>
export type ServiceType = Tables<'service_types'>

export type GarageService = Tables<'garage_services'> & {
  service_type: Pick<ServiceType, 'id' | 'name' | 'description'> | null
}

export type GarageWithServices = Garage & {
  garage_services: GarageService[]
}

const WITH_SERVICES = `
  *,
  garage_services(*, service_type:service_types(id, name, description))
`

export const garageKeys = {
  all: ['garages'] as const,
  detail: (id: string) => ['garages', id] as const,
  mine: ['garages', 'mine'] as const,
  serviceTypes: ['service-types'] as const,
}

/** The browsable catalog: every active garage, with what it offers. */
export function useGarages() {
  return useQuery({
    queryKey: garageKeys.all,
    queryFn: async () => {
      const rows = unwrap(
        await supabase.from('garages').select(WITH_SERVICES).eq('is_active', true).order('name'),
      )
      return rows as unknown as GarageWithServices[]
    },
  })
}

export function useGarage(id: string | undefined) {
  return useQuery({
    queryKey: garageKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const row = unwrap(
        await supabase.from('garages').select(WITH_SERVICES).eq('id', id!).single(),
      )
      return row as unknown as GarageWithServices
    },
  })
}

/**
 * The signed-in garage owner's own garage, or null if they have not set one up.
 *
 * A brand new garage_owner has no garage row, and that is a normal state rather
 * than an error — the station screens offer to create one. maybeSingle() is
 * what keeps "none yet" from arriving as a thrown 406.
 */
export function useMyGarage() {
  return useQuery({
    queryKey: garageKeys.mine,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      const row = unwrapMaybe(
        await supabase
          .from('garages')
          .select(WITH_SERVICES)
          .eq('owner_id', auth.user.id)
          .maybeSingle(),
      )
      return (row as unknown as GarageWithServices | null) ?? null
    },
  })
}

export function useServiceTypes() {
  return useQuery({
    queryKey: garageKeys.serviceTypes,
    // The catalog is effectively static, so re-fetching it on every screen is
    // wasted work.
    staleTime: 60 * 60 * 1000,
    queryFn: async () => unwrap(await supabase.from('service_types').select('*').order('name')),
  })
}

export function useCreateGarage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (garage: Omit<TablesInsert<'garages'>, 'owner_id'>) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      return unwrap(
        await supabase
          .from('garages')
          .insert({ ...garage, owner_id: auth.user.id })
          .select()
          .single(),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: garageKeys.all }),
  })
}

export function useUpdateGarage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...patch }: TablesUpdate<'garages'> & { id: string }) =>
      unwrap(await supabase.from('garages').update(patch).eq('id', id).select().single()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: garageKeys.all }),
  })
}

export function useUpsertGarageService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (service: TablesInsert<'garage_services'>) =>
      unwrap(
        await supabase
          .from('garage_services')
          .upsert(service, { onConflict: 'garage_id,service_type_id' })
          .select()
          .single(),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: garageKeys.all }),
  })
}

export function useRemoveGarageService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('garage_services').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: garageKeys.all }),
  })
}
