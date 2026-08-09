import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import type { Tables } from '@/types/database'

export type Notification = Tables<'notifications'>

export const notificationKeys = {
  all: ['notifications'] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
      ),
  })
}

/**
 * Marks notifications read.
 *
 * `read` is the only column an authenticated user may update — the migration
 * revokes UPDATE on the table and grants it back for that one column, so a
 * client cannot rewrite a notification's text. Nothing else may be sent in
 * this patch or Postgres rejects the whole statement.
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return []
      const { error } = await supabase.from('notifications').update({ read: true }).in('id', ids)
      if (error) throw new Error(error.message)
      return ids
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
