-- Move reminders from 'scheduled' to 'due'.
--
-- `reminders` has four states and nothing ever moved a row between them. The
-- states in seed.sql were written by hand; a reminder created today as
-- 'scheduled' stayed 'scheduled' forever, whatever the odometer read or how far
-- past its due date it got.
--
-- The two trigger types need different mechanisms:
--
--   * 'mileage' reminders can be evaluated the moment the odometer moves, and
--     service_records already fires a trigger that advances vehicles.mileage.
--     No scheduling needed.
--   * 'date' reminders have no such event -- nothing happens in the database
--     when a date passes -- so that half needs a scheduled sweep.
--
-- Both paths leave `notified_at` alone; see the note above sweep_due_reminders().

-- ---------------------------------------------------------------------------
-- Mileage: evaluate when the odometer moves
-- ---------------------------------------------------------------------------

-- A sibling of sync_vehicle_mileage() rather than an extension of it, so
-- "keep the odometer current" and "decide what that makes due" stay
-- independently testable.
create or replace function public.flag_due_mileage_reminders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Reads vehicles.mileage, not new.odometer. sync_vehicle_mileage() only ever
  -- advances mileage (`where mileage < new.odometer`), so a backdated service
  -- record with a low odometer moves neither the vehicle nor its reminders --
  -- reading the vehicle is what inherits that rule instead of restating it.
  update public.reminders r
     set status = 'due'
   where r.vehicle_id = new.vehicle_id
     and r.status = 'scheduled'
     and r.trigger_type = 'mileage'
     and r.due_mileage <= (
       select v.mileage from public.vehicles v where v.id = new.vehicle_id
     );

  return new;
end;
$$;

-- The name matters. Postgres fires triggers on the same event in name order,
-- and `service_records_sync_mileage` sorts before
-- `service_records_update_due_reminders`, so the odometer is already synced by
-- the time this reads vehicles.mileage. Renaming either one can silently
-- reverse that.
create trigger service_records_update_due_reminders
  after insert or update of odometer on public.service_records
  for each row execute function public.flag_due_mileage_reminders();

-- ---------------------------------------------------------------------------
-- Dates: a daily sweep
-- ---------------------------------------------------------------------------

-- Idempotent by construction: it only matches 'scheduled' rows, so a second run
-- on the same day matches nothing. That is also why it must stay a filter on
-- status rather than on, say, notified_at.
--
-- 'completed' and 'dismissed' are user decisions. An automated pass must never
-- reopen them, and filtering on 'scheduled' is what guarantees that.
--
-- `notified_at` is deliberately untouched. Becoming due is a fact about the
-- reminder; being notified is a fact about the user. Leaving it null gives the
-- notification pass (#15) a clean `status = 'due' and notified_at is null`
-- queue to stamp when it actually sends -- so a send that fails cannot leave
-- the reminder stuck in 'scheduled', and a re-run of this sweep cannot make a
-- notification look already-sent.
--
-- The predicate matches the existing partial index
-- `reminders_due_date_idx on (due_date) where status = 'scheduled'`.
create or replace function public.sweep_due_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  flipped integer;
begin
  update public.reminders
     set status = 'due'
   where status = 'scheduled'
     and trigger_type = 'date'
     and due_date <= current_date;

  get diagnostics flipped = row_count;
  return flipped;
end;
$$;

comment on function public.sweep_due_reminders() is
  'Moves scheduled date reminders that have come due. Idempotent; returns how many rows moved. Scheduled daily by pg_cron.';

-- Server-side pass, not something a client calls: it has no auth.uid() and runs
-- as SECURITY DEFINER over every user's reminders.
revoke execute on function public.sweep_due_reminders() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Schedule
-- ---------------------------------------------------------------------------

-- pg_cron 1.6.4 ships on this image, is already in shared_preload_libraries,
-- and cron.database_name is 'postgres', which is the database these migrations
-- run against -- all three checked before writing this.
create extension if not exists pg_cron;

-- 03:15 UTC daily. Unscheduling first keeps this replayable: cron.schedule()
-- on an existing job name updates it, but being explicit means the job's
-- identity is this migration rather than whatever ran last.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'reminders-daily-sweep') then
    perform cron.unschedule('reminders-daily-sweep');
  end if;

  perform cron.schedule(
    'reminders-daily-sweep',
    '15 3 * * *',
    $sweep$select public.sweep_due_reminders()$sweep$
  );
end $$;
