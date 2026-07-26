-- Opening hours, and a way for a customer to see which slots are free.
--
-- The booking engine needs to show occupancy, and it cannot read it. RLS on
-- `bookings` grants SELECT to exactly two parties: the booking's owner and the
-- garage. A customer browsing a garage is neither, so an occupancy query
-- returns an empty set -- every slot looks free, and the booking then fails
-- with a raw 23P01 from the bookings_no_double_booked_bay exclusion constraint.
--
-- Loosening that SELECT policy is the wrong fix: it would expose other
-- customers' bookings, vehicles and notes. So availability is computed
-- server-side by a SECURITY DEFINER function that returns start times and
-- nothing else.
--
-- The other missing piece is a window to search within. `garages.bay_count`
-- says how many jobs can run at once; nothing said *when* the garage is open.

-- ---------------------------------------------------------------------------
-- Opening hours
-- ---------------------------------------------------------------------------

create table public.garage_hours (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  created_at timestamptz not null default now(),
  constraint garage_hours_order_check check (closes_at > opens_at),
  unique (garage_id, weekday)
);

create index garage_hours_garage_id_idx on public.garage_hours (garage_id);

comment on table public.garage_hours is
  'When each garage is open. A weekday with no row is a day the garage is closed.';

comment on column public.garage_hours.weekday is
  '0 = Sunday .. 6 = Saturday, matching extract(dow from date).';

-- Times are wall-clock with no zone, and garage_availability() resolves them
-- as UTC. Every garage on the platform is in one region today. Supporting more
-- means adding a timezone to `garages` and resolving against that instead --
-- deliberately not done here, so it is one visible change when it is needed.
comment on column public.garage_hours.opens_at is
  'Interpreted as UTC by garage_availability(). See the note in this migration.';

alter table public.garage_hours enable row level security;

-- Same shape as the garage_services policies: the catalog of who is open when
-- is browsable by any signed-in user, and writable only by the garage itself.
create policy "garage hours are visible to signed-in users"
  on public.garage_hours for select
  to authenticated
  using (true);

create policy "garage owners manage their hours"
  on public.garage_hours for all
  using (public.owns_garage(garage_id))
  with check (public.owns_garage(garage_id));

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------

-- Free start times for a job of `duration_minutes` at this garage on this day.
--
-- SECURITY DEFINER, so it reads every booking at the garage regardless of who
-- is asking. That is the whole point -- and it is also why the return type is
-- `setof timestamptz` and not a row type. No booking ids, no vehicle ids, and
-- no occupancy counts: a count per slot can be differenced across two calls to
-- work out when a particular customer's car is in. Whatever this function
-- returns is returned to every signed-in user, so it returns timestamps only.
--
-- Candidates are on a fixed 30-minute grid from opening time, which is what a
-- booking UI wants to render. Sizing the step to the requested duration would
-- give a 45-minute oil change and a 4-hour service completely different grids
-- for the same day.
create or replace function public.garage_availability(
  target_garage_id uuid,
  day date,
  duration_minutes int
)
returns setof timestamptz
language sql
stable
security definer
set search_path = public
as $$
  with garage as (
    select g.bay_count
      from public.garages g
     where g.id = target_garage_id
       and g.is_active
  ),
  hours as (
    select
      (day + h.opens_at) at time zone 'UTC' as opens_at,
      (day + h.closes_at) at time zone 'UTC' as closes_at
      from public.garage_hours h
     where h.garage_id = target_garage_id
       and h.weekday = extract(dow from day)::smallint
  ),
  -- A job has to finish before closing, so the last candidate start is
  -- closing time minus the duration. If that is before opening time the
  -- garage is not open long enough and generate_series yields nothing.
  candidates as (
    select s.slot_start
      from hours
      cross join generate_series(
        hours.opens_at,
        hours.closes_at - make_interval(mins => duration_minutes),
        interval '30 minutes'
      ) as s(slot_start)
     where duration_minutes > 0
  )
  select c.slot_start
    from candidates c
    cross join garage
    -- Nothing else in the schema stops a booking being made for a time that
    -- has already gone by; at minimum the UI should never offer one.
   where c.slot_start > now()
     and (
       select count(*)
         from public.bookings b
        where b.garage_id = target_garage_id
          -- Reuse the one definition of "this booking is holding a bay".
          -- cancelled and no_show release it, and that rule lives in exactly
          -- one place -- see the warning above booking_holds_bay().
          and public.booking_holds_bay(b.status)
          and tstzrange(b.slot_start, b.slot_end)
              && tstzrange(
                   c.slot_start,
                   c.slot_start + make_interval(mins => duration_minutes)
                 )
     ) < garage.bay_count
   order by c.slot_start;
$$;

comment on function public.garage_availability(uuid, date, int) is
  'Free start times for a job of the given length. Returns timestamps only: it runs as SECURITY DEFINER, so anything else it returned would be readable by everyone.';

revoke execute on function public.garage_availability(uuid, date, int) from public, anon;
grant execute on function public.garage_availability(uuid, date, int) to authenticated;

-- ---------------------------------------------------------------------------
-- No booking into the past
-- ---------------------------------------------------------------------------

-- A `check (slot_start > now())` cannot do this job. now() is not immutable,
-- so the constraint would be re-evaluated on every later update and on any
-- dump/restore -- and it would reject the historical rows in seed.sql outright.
--
-- A trigger gated on status draws the line in the right place instead: you
-- cannot *book* a slot that has already passed, but a garage can still record
-- work that actually happened, and a booking that has already run keeps its
-- past slot_start for the rest of its life.
create or replace function public.reject_past_booking_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.slot_start <= now() and new.status in ('pending', 'confirmed') then
    raise exception 'cannot book a slot in the past (%)', new.slot_start
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger bookings_reject_past_slot
  before insert or update of slot_start on public.bookings
  for each row execute function public.reject_past_booking_slot();
