-- Rikili initial schema.
--
-- Two kinds of accounts: vehicle owners and garage owners. Mechanics work under
-- their garage owner's login, so there is no separate staff table.
--
-- Authorization note: the RLS policies below never read `profiles.role`. Access
-- is decided by ownership relations (owns_garage / owns_vehicle), which are
-- facts in the data rather than a claim on the user. `role` exists only so the
-- frontend knows which screens to show.

create extension if not exists "pgcrypto";
-- Lets an exclusion constraint mix uuid equality with range overlap.
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('vehicle_owner', 'garage_owner');

create type booking_status as enum (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- 'booking' records come from a job booked through Rikili; 'manual' ones are
-- back-filled by an owner for work done at a garage that isn't on the platform.
create type record_source as enum ('booking', 'manual');

create type reminder_type as enum (
  'service',
  'oil_change',
  'insurance_renewal',
  'emission_test',
  'other'
);

create type reminder_trigger as enum ('date', 'mileage');

create type reminder_status as enum ('scheduled', 'due', 'completed', 'dismissed');

-- Statuses that actually occupy a bay. Cancelled and no-show release it.
--
-- WARNING: this function is baked into the predicate of the exclusion
-- constraint on `bookings`. A `create or replace` here will NOT rebuild that
-- index, so changing it silently desynchronizes the constraint from its own
-- definition. To change the rule, drop the constraint, replace the function,
-- then re-add the constraint.
create or replace function public.booking_holds_bay(s booking_status)
returns boolean
language sql
immutable
as $$
  select s in ('pending', 'confirmed', 'in_progress', 'completed');
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name varchar(120),
  email varchar(255),
  phone varchar(30),
  role user_role not null default 'vehicle_owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application-level user data, one row per auth.users row.';

-- ---------------------------------------------------------------------------
-- Garages
-- ---------------------------------------------------------------------------

create table public.garages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name varchar(160) not null,
  address varchar(400),
  phone varchar(30),
  email varchar(255),
  place_id varchar(120),
  rating numeric(2, 1) check (rating between 0 and 5),
  bay_count smallint not null default 1 check (bay_count between 1 and 50),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index garages_owner_id_idx on public.garages (owner_id);
create index garages_is_active_idx on public.garages (is_active) where is_active;

comment on column public.garages.bay_count is
  'How many vehicles this garage can work on simultaneously.';

-- Shared catalog of service names, so garages can be filtered by what they offer.
create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Which catalog services a given garage actually offers, and at what price.
create table public.garage_services (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  service_type_id uuid not null references public.service_types (id) on delete restrict,
  price numeric(10, 2) check (price >= 0),
  duration_minutes integer check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (garage_id, service_type_id)
);

create index garage_services_service_type_id_idx
  on public.garage_services (service_type_id);

-- ---------------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------------

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  registration_number varchar(20) not null,
  brand varchar(60),
  model varchar(60),
  year smallint check (year between 1900 and 2100),
  mileage integer not null default 0 check (mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, registration_number)
);

create index vehicles_owner_id_idx on public.vehicles (owner_id);

comment on column public.vehicles.mileage is
  'Latest known odometer reading; kept in sync by the service-record trigger.';

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  garage_id uuid not null references public.garages (id) on delete cascade,
  service_type_id uuid references public.service_types (id) on delete set null,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  bay_number smallint check (bay_number >= 1),
  status booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_slot_order_check check (slot_end > slot_start),
  -- The real guarantee: no two live bookings can hold the same bay at the same
  -- garage over overlapping times. Enforced by the database, so concurrent
  -- requests can't slip past it the way a read-then-write check would.
  constraint bookings_no_double_booked_bay exclude using gist (
    garage_id with =,
    bay_number with =,
    tstzrange(slot_start, slot_end) with &&
  ) where (public.booking_holds_bay(status) and bay_number is not null)
);

create index bookings_garage_slot_idx on public.bookings (garage_id, slot_start);
create index bookings_owner_id_idx on public.bookings (owner_id);
create index bookings_vehicle_id_idx on public.bookings (vehicle_id);

comment on column public.bookings.bay_number is
  'Assigned automatically on insert; the lowest bay free for the whole slot.';

-- ---------------------------------------------------------------------------
-- Service records
-- ---------------------------------------------------------------------------

create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  booking_id uuid unique references public.bookings (id) on delete set null,
  garage_id uuid references public.garages (id) on delete set null,
  source record_source not null default 'manual',
  service_date date not null default current_date,
  odometer integer check (odometer >= 0),
  work_performed text,
  technician_name varchar(120),
  labour_cost numeric(10, 2) not null default 0 check (labour_cost >= 0),
  parts_cost numeric(10, 2) not null default 0 check (parts_cost >= 0),
  total_cost numeric(10, 2) generated always as (labour_cost + parts_cost) stored,
  external_garage_name varchar(160),
  invoice_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  -- A record either belongs to a garage on the platform or names an outside one.
  constraint service_records_garage_source_check check (
    (source = 'booking' and garage_id is not null)
    or (source = 'manual' and garage_id is null and external_garage_name is not null)
  )
);

create index service_records_vehicle_date_idx
  on public.service_records (vehicle_id, service_date desc);
create index service_records_garage_id_idx on public.service_records (garage_id);

comment on column public.service_records.technician_name is
  'Free text: mechanics share the garage owner login, so this records who did the work.';

create table public.service_parts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references public.service_records (id) on delete cascade,
  name varchar(160) not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_cost numeric(10, 2) not null default 0 check (unit_cost >= 0),
  line_total numeric(12, 2) generated always as (quantity * unit_cost) stored
);

create index service_parts_service_record_id_idx
  on public.service_parts (service_record_id);

-- ---------------------------------------------------------------------------
-- Reminders and notifications
-- ---------------------------------------------------------------------------

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  type reminder_type not null,
  trigger_type reminder_trigger not null,
  due_date date,
  due_mileage integer check (due_mileage >= 0),
  status reminder_status not null default 'scheduled',
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  -- Whichever trigger is chosen, the matching threshold has to be present.
  constraint reminders_trigger_value_check check (
    (trigger_type = 'date' and due_date is not null)
    or (trigger_type = 'mileage' and due_mileage is not null)
  )
);

create index reminders_owner_status_idx on public.reminders (owner_id, status);
create index reminders_due_date_idx on public.reminders (due_date)
  where status = 'scheduled';

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type varchar(60) not null,
  title varchar(200) not null,
  body text,
  ref_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_unread_idx
  on public.notifications (profile_id, created_at desc)
  where not read;

comment on column public.notifications.ref_id is
  'Loose pointer to the row that triggered this (booking, reminder, record). Not a FK.';

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger garages_set_updated_at before update on public.garages
  for each row execute function public.set_updated_at();
create trigger vehicles_set_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- Everyone signs up as a vehicle owner. The role is deliberately NOT read from
-- raw_user_meta_data: that field is whatever the client passed to signUp(), so
-- trusting it would let anyone register straight into a garage_owner account.
-- Becoming a garage owner goes through set_user_role() below.
--
-- Stamped BEFORE insert so the role is already in the row when GoTrue mints the
-- first JWT, and lands in app_metadata, which only the server can write.
create or replace function public.stamp_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.raw_app_meta_data =
    coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'vehicle_owner');
  return new;
end;
$$;

create trigger on_auth_user_stamp_role
  before insert on auth.users
  for each row execute function public.stamp_new_user_role();

-- Create a profile automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    'vehicle_owner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The only supported way to change someone's role. Keeps the JWT claim and the
-- profiles row in step; either alone would desync the frontend from the data.
-- Not executable by anon or authenticated: call it with the service role.
create or replace function public.set_user_role(target_id uuid, new_role user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
     set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb)
           || jsonb_build_object('role', new_role::text)
   where id = target_id;

  update public.profiles set role = new_role where id = target_id;
end;
$$;

revoke execute on function public.set_user_role(uuid, user_role) from public, anon, authenticated;

-- Logging a service record with a higher odometer advances the vehicle's mileage,
-- which is what mileage-based reminders are measured against.
create or replace function public.sync_vehicle_mileage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.odometer is not null then
    update public.vehicles
       set mileage = new.odometer
     where id = new.vehicle_id
       and mileage < new.odometer;
  end if;
  return new;
end;
$$;

create trigger service_records_sync_mileage
  after insert or update of odometer on public.service_records
  for each row execute function public.sync_vehicle_mileage();

-- Convenience: callers don't have to know which bays are free, they just book a
-- time. We pick the lowest free bay, or reject the slot if the garage is full.
create or replace function public.assign_booking_bay()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  capacity smallint;
  free_bay smallint;
begin
  select bay_count into capacity from public.garages where id = new.garage_id;
  if capacity is null then
    raise exception 'garage % does not exist', new.garage_id;
  end if;

  -- On insert, honour an explicitly chosen bay -- but only one that exists. The
  -- exclusion constraint stops two bookings sharing a bay; it cannot tell that
  -- bay 47 is imaginary, so without this check a client could pass any number
  -- and sidestep capacity entirely.
  if tg_op = 'INSERT' and new.bay_number is not null then
    if new.bay_number > capacity then
      raise exception 'garage % has no bay %', new.garage_id, new.bay_number
        using errcode = '23514';
    end if;
    return new;
  end if;

  -- On reschedule the old bay may no longer be free, so always re-pick.
  select b.n into free_bay
    from generate_series(1, capacity) as b(n)
   where not exists (
     select 1
       from public.bookings existing
      where existing.garage_id = new.garage_id
        and existing.bay_number = b.n
        and existing.id is distinct from new.id
        and public.booking_holds_bay(existing.status)
        and tstzrange(existing.slot_start, existing.slot_end)
            && tstzrange(new.slot_start, new.slot_end)
   )
   order by b.n
   limit 1;

  if free_bay is null then
    raise exception 'no bay available at garage % for the requested slot',
      new.garage_id
      using errcode = '23P01';
  end if;

  new.bay_number := free_bay;
  return new;
end;
$$;

create trigger bookings_assign_bay
  before insert or update of slot_start, slot_end, garage_id on public.bookings
  for each row execute function public.assign_booking_bay();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- Rules in plain terms:
--   * A vehicle owner sees only their own vehicles, bookings, records and reminders.
--   * A garage owner sees bookings made at their garage, and the vehicles/records
--     attached to those bookings -- nothing else about that customer.
--   * The garage catalog is browsable by any signed-in user.

-- Helper functions run as SECURITY DEFINER so that a policy on, say, bookings can
-- look at garages without re-triggering garage policies (which would recurse).

create or replace function public.owns_garage(target_garage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.garages
     where id = target_garage_id
       and owner_id = auth.uid()
  );
$$;

create or replace function public.owns_vehicle(target_vehicle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vehicles
     where id = target_vehicle_id
       and owner_id = auth.uid()
  );
$$;

-- True when the caller's garage has a booking for this vehicle, i.e. the car was
-- actually brought in to them. This is what lets a garage read a customer vehicle.
create or replace function public.services_vehicle(target_vehicle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.bookings b
      join public.garages g on g.id = b.garage_id
     where b.vehicle_id = target_vehicle_id
       and g.owner_id = auth.uid()
  );
$$;

-- Same idea one step up: the caller's garage has a booking from this person, so
-- the garage needs their name and phone to actually service the job.
create or replace function public.serves_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.bookings b
      join public.garages g on g.id = b.garage_id
     where b.owner_id = target_profile_id
       and g.owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.garages enable row level security;
alter table public.service_types enable row level security;
alter table public.garage_services enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.service_records enable row level security;
alter table public.service_parts enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;

-- --------------------------------------------------------------------------
-- Profiles
-- --------------------------------------------------------------------------

create policy "profiles readable by self"
  on public.profiles for select
  using (id = auth.uid());

create policy "garages read customers who booked with them"
  on public.profiles for select
  using (public.serves_profile(id));

create policy "profiles updatable by self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- RLS is row-level, and the policy above authorizes the whole row -- including
-- `role`. Without this, any user could grant themselves garage_owner with a
-- single UPDATE. Column privileges are the only thing that can stop that.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- --------------------------------------------------------------------------
-- Garages and the service catalog (browsable by any signed-in user)
-- --------------------------------------------------------------------------

create policy "active garages are visible to signed-in users"
  on public.garages for select
  to authenticated
  using (is_active or owner_id = auth.uid());

create policy "garage owners manage their garages"
  on public.garages for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "service types are visible to signed-in users"
  on public.service_types for select
  to authenticated
  using (true);

create policy "garage services are visible to signed-in users"
  on public.garage_services for select
  to authenticated
  using (true);

create policy "garage owners manage their offerings"
  on public.garage_services for all
  using (public.owns_garage(garage_id))
  with check (public.owns_garage(garage_id));

-- --------------------------------------------------------------------------
-- Vehicles
-- --------------------------------------------------------------------------

create policy "owners manage their vehicles"
  on public.vehicles for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "garages read vehicles booked with them"
  on public.vehicles for select
  using (public.services_vehicle(id));

-- --------------------------------------------------------------------------
-- Bookings
-- --------------------------------------------------------------------------

create policy "owners read their bookings"
  on public.bookings for select
  using (owner_id = auth.uid());

-- The vehicle must genuinely belong to the caller, so a booking can't be filed
-- against someone else's car.
create policy "owners create bookings for their vehicles"
  on public.bookings for insert
  with check (owner_id = auth.uid() and public.owns_vehicle(vehicle_id));

-- Customers may reschedule or back out. Confirming a job, marking it in progress
-- or completing it is the garage's call, so those statuses are excluded here.
create policy "owners change their bookings"
  on public.bookings for update
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and public.owns_vehicle(vehicle_id)
    and status in ('pending', 'cancelled')
  );

create policy "garages read bookings at their garage"
  on public.bookings for select
  using (public.owns_garage(garage_id));

create policy "garages update bookings at their garage"
  on public.bookings for update
  using (public.owns_garage(garage_id))
  with check (public.owns_garage(garage_id));

-- --------------------------------------------------------------------------
-- Service records
-- --------------------------------------------------------------------------

create policy "owners read records for their vehicles"
  on public.service_records for select
  using (public.owns_vehicle(vehicle_id));

-- Owners can only back-fill history from outside garages; work done on the
-- platform is written by the garage that did it.
create policy "owners add manual history"
  on public.service_records for insert
  with check (
    source = 'manual'
    and public.owns_vehicle(vehicle_id)
    and created_by = auth.uid()
  );

create policy "owners edit their manual history"
  on public.service_records for update
  using (source = 'manual' and public.owns_vehicle(vehicle_id))
  with check (source = 'manual' and public.owns_vehicle(vehicle_id));

create policy "owners delete their manual history"
  on public.service_records for delete
  using (source = 'manual' and public.owns_vehicle(vehicle_id));

create policy "garages read records they created"
  on public.service_records for select
  using (public.owns_garage(garage_id));

create policy "garages log work at their garage"
  on public.service_records for insert
  with check (
    public.owns_garage(garage_id)
    and public.services_vehicle(vehicle_id)
    and created_by = auth.uid()
  );

-- services_vehicle() on the check side matters: without it a garage could point
-- an existing record at any vehicle_id, writing invented history into a stranger's
-- log -- and sync_vehicle_mileage() would rewrite that vehicle's odometer with it.
create policy "garages edit records they created"
  on public.service_records for update
  using (public.owns_garage(garage_id))
  with check (
    public.owns_garage(garage_id)
    and public.services_vehicle(vehicle_id)
  );

-- Parts inherit whoever can reach the parent record. The ownership test is
-- spelled out rather than left to the nested RLS on service_records: that would
-- work today, but it stops working the moment this lookup is wrapped in a
-- SECURITY DEFINER helper, which is the pattern used everywhere else here.
create policy "parts follow their service record"
  on public.service_parts for select
  using (
    exists (
      select 1 from public.service_records r
       where r.id = service_record_id
         and (public.owns_garage(r.garage_id) or public.owns_vehicle(r.vehicle_id))
    )
  );

create policy "parts writable with their service record"
  on public.service_parts for all
  using (
    exists (
      select 1 from public.service_records r
       where r.id = service_record_id
         and (public.owns_garage(r.garage_id) or public.owns_vehicle(r.vehicle_id))
    )
  )
  with check (
    exists (
      select 1 from public.service_records r
       where r.id = service_record_id
         and (public.owns_garage(r.garage_id) or public.owns_vehicle(r.vehicle_id))
    )
  );

-- --------------------------------------------------------------------------
-- Reminders and notifications
-- --------------------------------------------------------------------------

create policy "owners manage their reminders"
  on public.reminders for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.owns_vehicle(vehicle_id));

create policy "users read their notifications"
  on public.notifications for select
  using (profile_id = auth.uid());

-- Only the read flag is user-writable; notifications themselves are created
-- server-side by the service role, which bypasses RLS.
create policy "users mark notifications read"
  on public.notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

revoke update on public.notifications from anon, authenticated;
grant update (read) on public.notifications to authenticated;
