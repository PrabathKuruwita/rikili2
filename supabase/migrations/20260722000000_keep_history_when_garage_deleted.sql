-- Deleting a garage used to fail if it had any booking-sourced service records.
--
-- service_records.garage_id is `on delete set null`, but the original check
-- constraint demanded that every source='booking' row have a non-null garage_id.
-- The two rules contradict each other: the FK nulls the column, then the check
-- rejects the resulting row, so the delete aborts. Any garage that had ever done
-- a job through the platform could never be removed.
--
-- Service records are history, and history should outlive the garage that made
-- it. So a 'booking' record is now allowed to have no garage -- that is exactly
-- what it means for the shop to have left the platform. The requirement that a
-- 'manual' record name an outside garage is unchanged.
--
-- This does not let the app create garage-less booking records: the RLS insert
-- policy for garages still goes through owns_garage(garage_id), which cannot
-- match a null.

alter table public.service_records
  drop constraint service_records_garage_source_check;

alter table public.service_records
  add constraint service_records_garage_source_check check (
    (source = 'booking')
    or (source = 'manual' and garage_id is null and external_garage_name is not null)
  );
