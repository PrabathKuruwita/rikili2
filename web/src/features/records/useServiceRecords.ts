import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/query'
import { vehicleKeys } from '@/features/vehicles/useVehicles'
import { bookingKeys } from '@/features/bookings/useBookings'
import type { Tables } from '@/types/database'

export type ServiceRecord = Tables<'service_records'>
export type ServicePart = Tables<'service_parts'>

export type ServiceRecordDetail = ServiceRecord & {
  vehicle: Pick<Tables<'vehicles'>, 'id' | 'brand' | 'model' | 'registration_number'> | null
  garage: Pick<Tables<'garages'>, 'id' | 'name'> | null
  service_parts: ServicePart[]
}

const DETAIL_SELECT = `
  *,
  vehicle:vehicles(id, brand, model, registration_number),
  garage:garages(id, name),
  service_parts(*)
`

export const recordKeys = {
  all: ['service-records'] as const,
  forVehicle: (vehicleId: string) => ['service-records', 'vehicle', vehicleId] as const,
}

/**
 * Service history visible to the caller.
 *
 * For an owner that is every record on their vehicles, whoever wrote it. For a
 * garage owner it is only the records their own garage created — a garage can
 * see the car's future bookings but not what a rival shop charged for.
 */
export function useServiceRecords() {
  return useQuery({
    queryKey: recordKeys.all,
    queryFn: async () => {
      const rows = unwrap(
        await supabase.from('service_records').select(DETAIL_SELECT).order('service_date', {
          ascending: false,
        }),
      )
      return rows as unknown as ServiceRecordDetail[]
    },
  })
}

export function useVehicleServiceRecords(vehicleId: string | undefined) {
  return useQuery({
    queryKey: recordKeys.forVehicle(vehicleId ?? ''),
    enabled: Boolean(vehicleId),
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from('service_records')
          .select(DETAIL_SELECT)
          .eq('vehicle_id', vehicleId!)
          .order('service_date', { ascending: false }),
      )
      return rows as unknown as ServiceRecordDetail[]
    },
  })
}

export type PartInput = { name: string; quantity: number; unit_cost: number }

type ManualRecordInput = {
  vehicle_id: string
  service_date: string
  odometer: number | null
  work_performed: string
  external_garage_name: string
  labour_cost: number
  parts_cost: number
  parts: PartInput[]
}

/**
 * An owner back-filling work done at a shop that is not on the platform.
 *
 * source must be 'manual' with a null garage_id and a named outside garage —
 * that is both the table's check constraint and the RLS policy. Owners cannot
 * write 'booking' records at all: work done on the platform is written by the
 * garage that did it, so history cannot be invented after the fact.
 */
export function useAddManualRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parts, ...record }: ManualRecordInput) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      const created = unwrap(
        await supabase
          .from('service_records')
          .insert({
            ...record,
            source: 'manual',
            garage_id: null,
            created_by: auth.user.id,
          })
          .select()
          .single(),
      )

      await insertParts(created.id, parts)
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
      // The odometer trigger may have advanced the vehicle's mileage.
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}

type WorkLogInput = {
  booking_id: string
  vehicle_id: string
  garage_id: string
  service_date: string
  odometer: number | null
  work_performed: string
  technician_name: string
  labour_cost: number
  parts_cost: number
  parts: PartInput[]
}

/**
 * A garage recording what it actually did on a job.
 *
 * Also flips the booking to 'completed': the record is the evidence the work
 * happened, so leaving the booking open afterwards is always a mistake.
 */
export function useLogWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parts, ...record }: WorkLogInput) => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not signed in.')

      const created = unwrap(
        await supabase
          .from('service_records')
          .insert({ ...record, source: 'booking', created_by: auth.user.id })
          .select()
          .single(),
      )

      await insertParts(created.id, parts)

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', record.booking_id)
      if (error) throw new Error(error.message)

      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_records').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  })
}

async function insertParts(serviceRecordId: string, parts: PartInput[]) {
  const usable = parts.filter((part) => part.name.trim() !== '')
  if (usable.length === 0) return

  const { error } = await supabase.from('service_parts').insert(
    usable.map((part) => ({
      service_record_id: serviceRecordId,
      name: part.name.trim(),
      quantity: part.quantity,
      unit_cost: part.unit_cost,
    })),
  )
  // The parent record is already committed at this point. Surfacing the failure
  // is better than a silent half-write — the record shows with no parts, and
  // the message says why.
  if (error) throw new Error(`Record saved, but its parts failed: ${error.message}`)
}
