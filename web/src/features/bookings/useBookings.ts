import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import type { Enums, Tables } from '@/types/database'

export type Booking = Tables<'bookings'>
export type BookingStatus = Enums<'booking_status'>

/** A booking joined to everything needed to render one row. */
export type BookingDetail = Booking & {
  vehicle: Pick<Tables<'vehicles'>, 'id' | 'brand' | 'model' | 'registration_number'> | null
  garage: Pick<Tables<'garages'>, 'id' | 'name' | 'address' | 'phone'> | null
  service_type: Pick<Tables<'service_types'>, 'id' | 'name'> | null
  owner: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'phone' | 'email'> | null
}

const DETAIL_SELECT = `
  *,
  vehicle:vehicles(id, brand, model, registration_number),
  garage:garages(id, name, address, phone),
  service_type:service_types(id, name),
  owner:profiles(id, full_name, phone, email)
`

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
}

/**
 * Every booking the caller can see, newest slot first.
 *
 * One query serves both sides of the app. A vehicle owner's policy matches
 * bookings they made; a garage owner's matches bookings at their garage. The
 * same select therefore returns "my bookings" or "my queue" depending on who
 * is asking, which is exactly the point of putting the rule in the database.
 */
export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from('bookings')
          .select(DETAIL_SELECT)
          .order('slot_start', { ascending: false }),
      )
      return rows as unknown as BookingDetail[]
    },
  })
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const row = unwrap(
        await supabase.from('bookings').select(DETAIL_SELECT).eq('id', id!).single(),
      )
      return row as unknown as BookingDetail
    },
  })
}

export type NewBooking = {
  vehicle_id: string
  garage_id: string
  service_type_id: string | null
  slot_start: string
  slot_end: string
  notes?: string | null
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (booking: NewBooking) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      // bay_number is deliberately not sent: assign_booking_bay picks the
      // lowest free bay, and rejects the insert if the garage is full at that
      // time. Choosing here would race with anyone booking the same slot.
      return unwrap(
        await supabase
          .from('bookings')
          .insert({ ...booking, owner_id: auth.user.id })
          .select()
          .single(),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

/**
 * Change a booking's status.
 *
 * Which transitions are allowed is not decided here. The owner policy's WITH
 * CHECK only permits 'pending' and 'cancelled', so an owner trying to mark a
 * job complete is refused by Postgres; a garage owner's policy allows any
 * status at their own garage. The UI hides the buttons it should, but the
 * database is what actually enforces it.
 */
export function useSetBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) =>
      unwrap(await supabase.from('bookings').update({ status }).eq('id', id).select().single()),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })
    },
  })
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      slot_start,
      slot_end,
    }: {
      id: string
      slot_start: string
      slot_end: string
    }) =>
      unwrap(
        await supabase
          .from('bookings')
          .update({ slot_start, slot_end })
          .eq('id', id)
          .select()
          .single(),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

/** Statuses that still expect someone to turn up. */
export const OPEN_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress']

export function isOpen(booking: Booking): boolean {
  return OPEN_STATUSES.includes(booking.status)
}

export function isUpcoming(booking: Booking): boolean {
  return isOpen(booking) && new Date(booking.slot_end).getTime() >= Date.now()
}
