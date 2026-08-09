import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import type { Tables } from '@/types/database'

export type Profile = Tables<'profiles'>

export const profileKeys = {
  mine: ['profile', 'me'] as const,
  customers: ['profile', 'customers'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.mine,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')
      return unwrap(await supabase.from('profiles').select('*').eq('id', auth.user.id).single())
    },
  })
}

/**
 * Updates the signed-in user's own profile.
 *
 * Only full_name and phone are sent, and that is not merely a UI choice: the
 * migration revokes UPDATE on profiles and grants it back for exactly those two
 * columns. RLS authorizes whole rows, so without that column grant the
 * "profiles updatable by self" policy would let anyone set their own role to
 * garage_owner. Adding a field here without a matching grant fails at runtime.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: { full_name?: string | null; phone?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      return unwrap(
        await supabase.from('profiles').update(patch).eq('id', auth.user.id).select().single(),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.mine }),
  })
}

/**
 * The people who have booked with the caller's garage.
 *
 * The whole customer list comes from one unfiltered select: the
 * "garages read customers who booked with them" policy resolves it through
 * serves_profile(). A garage owner also matches the "readable by self" policy,
 * so their own row comes back too and is filtered out here.
 */
export function useGarageCustomers() {
  return useQuery({
    queryKey: profileKeys.customers,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      const rows = unwrap(await supabase.from('profiles').select('*').order('full_name'))
      return rows.filter((profile) => profile.id !== auth.user!.id)
    },
  })
}
