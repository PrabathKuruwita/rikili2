-- Development seed data for Rikili.
--
-- Safe to re-run: it deletes its own users first, and everything else cascades
-- from them. It touches nothing outside the fixed set of seed emails below.
--
-- Users are inserted straight into auth.users rather than through the signup
-- API, so the password hash is written by hand. Every seed account uses:
--
--     password: rikili-dev-1234
--
-- The two signup triggers still fire on these inserts, so profiles are created
-- automatically and app_metadata gets stamped -- which is also a live check
-- that both triggers work.
--
-- Apply it with `pnpm db:seed` from web/.
--
-- Every timestamp below is relative to now(), never a literal date. A seed with
-- hardcoded dates is only convincing on the day it was written: its "upcoming"
-- bookings quietly become past ones, the dashboard empties out, and the next
-- person assumes the queries are broken. Re-running this always produces a
-- fresh spread of history, work in progress, and future jobs.

begin;

-- Readable slot arithmetic. pg_temp is dropped when the session ends, so this
-- helper never becomes part of the schema.
create function pg_temp.slot(days int, hour int, minute int default 0)
returns timestamptz
language sql
stable
as $$
  select date_trunc('day', now())
       + make_interval(days => days, hours => hour, mins => minute);
$$;

delete from auth.users where email in (
  'ada@example.com', 'grace@example.com', 'raj@example.com', 'mei@example.com',
  'linus@example.com', 'sofia@example.com', 'nia@example.com',
  'tomas@example.com', 'yuki@example.com', 'omar@example.com'
);

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  d.id, 'authenticated', 'authenticated', d.email,
  crypt('rikili-dev-1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', d.full_name, 'phone', d.phone),
  '', '', '', ''
from (values
  -- Vehicle owners
  ('a0000000-0000-4000-a000-000000000001'::uuid, 'ada@example.com',   'Ada Lovelace',  '+1-555-0101'),
  ('a0000000-0000-4000-a000-000000000002'::uuid, 'grace@example.com', 'Grace Hopper',  '+1-555-0102'),
  ('a0000000-0000-4000-a000-000000000005'::uuid, 'linus@example.com', 'Linus Ahlgren', '+1-555-0103'),
  ('a0000000-0000-4000-a000-000000000007'::uuid, 'nia@example.com',   'Nia Okafor',    '+1-555-0104'),
  ('a0000000-0000-4000-a000-000000000008'::uuid, 'tomas@example.com', 'Tomas Rivera',  '+1-555-0105'),
  ('a0000000-0000-4000-a000-000000000009'::uuid, 'yuki@example.com',  'Yuki Tanaka',   '+1-555-0106'),
  -- Garage owners
  ('a0000000-0000-4000-a000-000000000003'::uuid, 'raj@example.com',   'Raj Patel',     '+1-555-0201'),
  ('a0000000-0000-4000-a000-000000000004'::uuid, 'mei@example.com',   'Mei Chen',      '+1-555-0202'),
  ('a0000000-0000-4000-a000-000000000006'::uuid, 'sofia@example.com', 'Sofia Rossi',   '+1-555-0203'),
  ('a0000000-0000-4000-a000-000000000010'::uuid, 'omar@example.com',  'Omar Haddad',   '+1-555-0204')
) as d(id, email, full_name, phone);

-- Promote the garage accounts. This is the supported path: it keeps the JWT
-- claim and the profiles row in step.
select public.set_user_role('a0000000-0000-4000-a000-000000000003', 'garage_owner');
select public.set_user_role('a0000000-0000-4000-a000-000000000004', 'garage_owner');
select public.set_user_role('a0000000-0000-4000-a000-000000000006', 'garage_owner');
select public.set_user_role('a0000000-0000-4000-a000-000000000010', 'garage_owner');

-- ---------------------------------------------------------------------------
-- Service catalog
-- ---------------------------------------------------------------------------

insert into public.service_types (id, name, description) values
  ('b0000000-0000-4000-a000-000000000001', 'Oil Change',           'Drain, replace oil and filter.'),
  ('b0000000-0000-4000-a000-000000000002', 'Brake Service',        'Pads, rotors, fluid check.'),
  ('b0000000-0000-4000-a000-000000000003', 'Tire Rotation',        'Rotate and balance all four.'),
  ('b0000000-0000-4000-a000-000000000004', 'Full Service',         'Scheduled major service.'),
  ('b0000000-0000-4000-a000-000000000005', 'Emission Test',        'Annual emissions inspection.'),
  ('b0000000-0000-4000-a000-000000000006', 'AC Service',           'Regas and leak check.'),
  ('b0000000-0000-4000-a000-000000000007', 'Wheel Alignment',      'Four-wheel geometry reset.'),
  ('b0000000-0000-4000-a000-000000000008', 'Battery Replacement',  'Test, replace, register.'),
  ('b0000000-0000-4000-a000-000000000009', 'Diagnostics',          'Fault-code read and road test.'),
  ('b0000000-0000-4000-a000-00000000000a', 'Transmission Service', 'Fluid, filter, adaptives reset.')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Garages
-- ---------------------------------------------------------------------------

insert into public.garages (id, owner_id, name, address, phone, email, rating, bay_count) values
  ('c0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003',
   'Patel Auto Works', '412 Rosewood Ave, Durham NC', '+1-555-0301', 'shop@patelauto.example', 4.6, 3),
  ('c0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000004',
   'Chen Motors', '88 Industrial Way, Raleigh NC', '+1-555-0302', 'hello@chenmotors.example', 4.2, 2),
  ('c0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000006',
   'Rossi Performance', '7 Franklin St, Chapel Hill NC', '+1-555-0303', 'book@rossiperf.example', 4.9, 4),
  ('c0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000010',
   'Haddad Tyre & Brake', '230 Cornwallis Rd, Durham NC', '+1-555-0304', 'desk@haddadtyre.example', 4.4, 2);

insert into public.garage_services (garage_id, service_type_id, price, duration_minutes) values
  -- Patel Auto Works
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000001',  49.99,  45),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 289.00, 120),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003',  35.00,  30),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004', 420.00, 240),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000009',  89.00,  60),
  -- Chen Motors
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000001',  55.00,  40),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000005',  30.00,  30),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000006', 145.50,  90),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000007', 110.00,  60),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000008', 210.00,  60),
  -- Rossi Performance
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000002', 310.00, 150),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000003',  40.00,  30),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000004', 495.00, 300),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000006', 160.00,  90),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-00000000000a', 385.00, 180),
  -- Haddad Tyre & Brake
  ('c0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000002', 245.00, 120),
  ('c0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000003',  32.00,  30),
  ('c0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000007',  95.00,  60),
  ('c0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000009',  75.00,  60);

-- ---------------------------------------------------------------------------
-- Vehicles
--
-- mileage is set at or above every odometer reading in this vehicle's history
-- below, so sync_vehicle_mileage() leaves these values alone and the seeded
-- numbers are what the UI shows.
-- ---------------------------------------------------------------------------

insert into public.vehicles (id, owner_id, registration_number, brand, model, year, mileage) values
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'NC-4821', 'Toyota', 'Corolla', 2019, 62400),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001',
   'NC-9033', 'Honda', 'Civic', 2022, 21850),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000002',
   'NC-1157', 'Ford', 'F-150', 2017, 118300),
  ('d0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000005',
   'NC-7742', 'Volkswagen', 'Golf', 2021, 34500),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'NC-6610', 'Subaru', 'Outback', 2015, 149200),
  ('d0000000-0000-4000-a000-000000000006', 'a0000000-0000-4000-a000-000000000007',
   'NC-3390', 'Mazda', 'CX-5', 2020, 48750),
  ('d0000000-0000-4000-a000-000000000007', 'a0000000-0000-4000-a000-000000000007',
   'NC-8802', 'Kia', 'Telluride', 2023, 15400),
  ('d0000000-0000-4000-a000-000000000008', 'a0000000-0000-4000-a000-000000000008',
   'NC-2264', 'Chevrolet', 'Bolt', 2021, 41900),
  ('d0000000-0000-4000-a000-000000000009', 'a0000000-0000-4000-a000-000000000009',
   'NC-5518', 'Nissan', 'Leaf', 2018, 73600);

-- ---------------------------------------------------------------------------
-- Bookings
--
-- bay_number is deliberately left out: the assign_booking_bay trigger picks the
-- lowest free bay, so this data also exercises that path. Overlapping slots at
-- one garage are kept within its bay_count, otherwise the trigger rejects them.
-- ---------------------------------------------------------------------------

insert into public.bookings (id, vehicle_id, owner_id, garage_id, service_type_id, slot_start, slot_end, status, notes) values
  -- Patel Auto Works (3 bays) -----------------------------------------------
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000001',
   pg_temp.slot(-87, 9), pg_temp.slot(-87, 9, 45), 'completed', 'Customer waited on site.'),
  ('e0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000002',
   pg_temp.slot(-68, 13), pg_temp.slot(-68, 15), 'completed', 'Grinding noise on front left.'),
  ('e0000000-0000-4000-a000-00000000000b', 'd0000000-0000-4000-a000-000000000006',
   'a0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000004',
   pg_temp.slot(-30, 8), pg_temp.slot(-30, 12), 'completed', 'Full service at 45k.'),
  -- Happening right now, so the job board always has something live in it.
  ('e0000000-0000-4000-a000-00000000000d', 'd0000000-0000-4000-a000-000000000002',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000001',
   date_trunc('hour', now()) - interval '1 hour', date_trunc('hour', now()) + interval '1 hour',
   'in_progress', 'Waiting in the lounge.'),
  -- Three overlapping tomorrow-afternoon jobs: exactly fills the three bays.
  ('e0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000001',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000003',
   pg_temp.slot(1, 14), pg_temp.slot(1, 14, 30), 'pending', 'Pull in for a rotation if there is time.'),
  ('e0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000004',
   pg_temp.slot(1, 14), pg_temp.slot(1, 18), 'confirmed', 'Major service, long job.'),
  ('e0000000-0000-4000-a000-00000000000c', 'd0000000-0000-4000-a000-000000000007',
   'a0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000009',
   pg_temp.slot(1, 15), pg_temp.slot(1, 16), 'confirmed', 'Intermittent dashboard warning.'),

  -- Chen Motors (2 bays) ----------------------------------------------------
  ('e0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000002',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000005',
   pg_temp.slot(3, 10), pg_temp.slot(3, 10, 30), 'confirmed', null),
  ('e0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000002',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000006',
   pg_temp.slot(-16, 11), pg_temp.slot(-16, 12, 30), 'cancelled', 'Customer rescheduled.'),
  ('e0000000-0000-4000-a000-00000000000e', 'd0000000-0000-4000-a000-000000000008',
   'a0000000-0000-4000-a000-000000000008', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000008',
   pg_temp.slot(-9, 10), pg_temp.slot(-9, 11), 'completed', 'High-voltage battery health check too.'),
  ('e0000000-0000-4000-a000-00000000000f', 'd0000000-0000-4000-a000-000000000009',
   'a0000000-0000-4000-a000-000000000009', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000007',
   pg_temp.slot(5, 9), pg_temp.slot(5, 10), 'pending', 'Pulls left on the highway.'),

  -- Rossi Performance (4 bays) ----------------------------------------------
  ('e0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000004',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000002',
   pg_temp.slot(-122, 8, 30), pg_temp.slot(-122, 11), 'completed', 'Squeal under braking.'),
  ('e0000000-0000-4000-a000-000000000010', 'd0000000-0000-4000-a000-000000000007',
   'a0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-00000000000a',
   pg_temp.slot(-47, 9), pg_temp.slot(-47, 12), 'completed', 'Gearbox hesitating on downshift.'),
  -- no_show releases the bay, so this one sits outside the exclusion constraint.
  ('e0000000-0000-4000-a000-000000000009', 'd0000000-0000-4000-a000-000000000005',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000003',
   pg_temp.slot(-25, 16), pg_temp.slot(-25, 16, 30), 'no_show', 'Did not arrive.'),
  ('e0000000-0000-4000-a000-000000000008', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000004',
   pg_temp.slot(6, 9), pg_temp.slot(6, 14), 'confirmed', 'Towing package inspection too.'),
  ('e0000000-0000-4000-a000-00000000000a', 'd0000000-0000-4000-a000-000000000005',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000006',
   pg_temp.slot(9, 10), pg_temp.slot(9, 11, 30), 'pending', 'AC blowing warm.'),

  -- Haddad Tyre & Brake (2 bays) --------------------------------------------
  ('e0000000-0000-4000-a000-000000000011', 'd0000000-0000-4000-a000-000000000009',
   'a0000000-0000-4000-a000-000000000009', 'c0000000-0000-4000-a000-000000000004',
   'b0000000-0000-4000-a000-000000000003',
   pg_temp.slot(-12, 11), pg_temp.slot(-12, 11, 30), 'completed', null),
  ('e0000000-0000-4000-a000-000000000014', 'd0000000-0000-4000-a000-000000000004',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000004',
   'b0000000-0000-4000-a000-000000000009',
   pg_temp.slot(-5, 15), pg_temp.slot(-5, 16), 'completed', 'Engine light after a cold start.'),
  ('e0000000-0000-4000-a000-000000000012', 'd0000000-0000-4000-a000-000000000006',
   'a0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000004',
   'b0000000-0000-4000-a000-000000000007',
   pg_temp.slot(2, 13), pg_temp.slot(2, 14), 'confirmed', null),
  ('e0000000-0000-4000-a000-000000000013', 'd0000000-0000-4000-a000-000000000008',
   'a0000000-0000-4000-a000-000000000008', 'c0000000-0000-4000-a000-000000000004',
   'b0000000-0000-4000-a000-000000000002',
   pg_temp.slot(2, 13), pg_temp.slot(2, 15), 'confirmed', 'Rear discs scored.');

-- ---------------------------------------------------------------------------
-- Service history
-- ---------------------------------------------------------------------------

insert into public.service_records
  (id, vehicle_id, booking_id, garage_id, source, service_date, odometer,
   work_performed, technician_name, labour_cost, parts_cost, created_by) values
  ('f0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'e0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'booking', (pg_temp.slot(-87, 9))::date, 58900,
   'Oil and filter replaced. Topped up washer fluid.', 'Danny R.', 30.00, 19.99,
   'a0000000-0000-4000-a000-000000000003'),
  ('f0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000003',
   'e0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'booking', (pg_temp.slot(-68, 13))::date, 115400,
   'Front pads and rotors replaced. Brake fluid flushed.', 'Priya S.', 160.00, 129.00,
   'a0000000-0000-4000-a000-000000000003'),
  ('f0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000004',
   'e0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000003',
   'booking', (pg_temp.slot(-122, 8))::date, 29400,
   'Rear pads replaced, calipers cleaned and greased.', 'Tomas L.', 175.00, 96.40,
   'a0000000-0000-4000-a000-000000000006'),
  ('f0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000006',
   'e0000000-0000-4000-a000-00000000000b', 'c0000000-0000-4000-a000-000000000001',
   'booking', (pg_temp.slot(-30, 8))::date, 46200,
   'Full service: oil, filters, plugs, brake fluid. Cabin filter was heavily soiled.',
   'Danny R.', 240.00, 178.60, 'a0000000-0000-4000-a000-000000000003'),
  ('f0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000007',
   'e0000000-0000-4000-a000-000000000010', 'c0000000-0000-4000-a000-000000000003',
   'booking', (pg_temp.slot(-47, 9))::date, 13100,
   'Transmission fluid and filter, adaptives reset. Road tested 12 miles.',
   'Sofia R.', 210.00, 174.30, 'a0000000-0000-4000-a000-000000000006'),
  ('f0000000-0000-4000-a000-000000000008', 'd0000000-0000-4000-a000-000000000008',
   'e0000000-0000-4000-a000-00000000000e', 'c0000000-0000-4000-a000-000000000002',
   'booking', (pg_temp.slot(-9, 10))::date, 41200,
   '12V auxiliary battery replaced and registered. HV pack health 94%.',
   'Mei C.', 60.00, 152.00, 'a0000000-0000-4000-a000-000000000004'),
  ('f0000000-0000-4000-a000-000000000009', 'd0000000-0000-4000-a000-000000000009',
   'e0000000-0000-4000-a000-000000000011', 'c0000000-0000-4000-a000-000000000004',
   'booking', (pg_temp.slot(-12, 11))::date, 72900,
   'Rotated and balanced. Nearside rear at 3mm, flagged for replacement.',
   'Omar H.', 32.00, 0.00, 'a0000000-0000-4000-a000-000000000010'),
  ('f0000000-0000-4000-a000-00000000000a', 'd0000000-0000-4000-a000-000000000004',
   'e0000000-0000-4000-a000-000000000014', 'c0000000-0000-4000-a000-000000000004',
   'booking', (pg_temp.slot(-5, 15))::date, 34100,
   'P0171 stored. Cleaned MAF sensor, no leaks found on smoke test.',
   'Omar H.', 75.00, 12.50, 'a0000000-0000-4000-a000-000000000010');

-- Back-filled by owners for work done somewhere not on the platform.
insert into public.service_records
  (id, vehicle_id, garage_id, source, service_date, odometer, work_performed,
   external_garage_name, labour_cost, parts_cost, created_by) values
  ('f0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001',
   null, 'manual', (pg_temp.slot(-260, 0))::date, 51800,
   'Timing belt and water pump replaced.', 'Sunrise Garage (Charlotte)', 380.00, 245.75,
   'a0000000-0000-4000-a000-000000000001'),
  ('f0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000005',
   null, 'manual', (pg_temp.slot(-182, 0))::date, 143700,
   'Clutch replacement and gearbox oil.', 'Ahlgren Family Garage', 640.00, 410.20,
   'a0000000-0000-4000-a000-000000000005'),
  ('f0000000-0000-4000-a000-00000000000b', 'd0000000-0000-4000-a000-000000000003',
   null, 'manual', (pg_temp.slot(-330, 0))::date, 109600,
   'Two front tyres and a tracking check.', 'Highway Tyres (Cary)', 45.00, 318.00,
   'a0000000-0000-4000-a000-000000000002'),
  ('f0000000-0000-4000-a000-00000000000c', 'd0000000-0000-4000-a000-000000000009',
   null, 'manual', (pg_temp.slot(-140, 0))::date, 68200,
   'Annual inspection and wiper blades.', 'Tanaka Autocare', 55.00, 28.90,
   'a0000000-0000-4000-a000-000000000009');

insert into public.service_parts (service_record_id, name, quantity, unit_cost) values
  ('f0000000-0000-4000-a000-000000000001', 'Oil filter',            1,   8.99),
  ('f0000000-0000-4000-a000-000000000001', '5W-30 synthetic (qt)',  5,   2.20),
  ('f0000000-0000-4000-a000-000000000002', 'Brake pad set (front)', 1,  74.00),
  ('f0000000-0000-4000-a000-000000000002', 'Rotor',                 2,  27.50),
  ('f0000000-0000-4000-a000-000000000003', 'Timing belt kit',       1, 189.75),
  ('f0000000-0000-4000-a000-000000000003', 'Water pump',            1,  56.00),
  ('f0000000-0000-4000-a000-000000000004', 'Brake pad set (rear)',  1,  68.40),
  ('f0000000-0000-4000-a000-000000000004', 'Caliper grease',        2,  14.00),
  ('f0000000-0000-4000-a000-000000000005', 'Clutch kit',            1, 352.20),
  ('f0000000-0000-4000-a000-000000000005', 'Gearbox oil (l)',       2,  29.00),
  ('f0000000-0000-4000-a000-000000000006', 'Oil filter',            1,   9.60),
  ('f0000000-0000-4000-a000-000000000006', 'Cabin filter',          1,  24.00),
  ('f0000000-0000-4000-a000-000000000006', 'Spark plug',            4,  11.25),
  ('f0000000-0000-4000-a000-000000000006', '0W-20 synthetic (qt)',  5,  20.00),
  ('f0000000-0000-4000-a000-000000000007', 'ATF (l)',               7,  18.90),
  ('f0000000-0000-4000-a000-000000000007', 'Transmission filter',   1,  42.00),
  ('f0000000-0000-4000-a000-000000000008', '12V AGM battery',       1, 152.00),
  ('f0000000-0000-4000-a000-00000000000a', 'MAF cleaner',           1,  12.50),
  ('f0000000-0000-4000-a000-00000000000b', 'Tyre 205/55 R16',       2, 149.00),
  ('f0000000-0000-4000-a000-00000000000c', 'Wiper blade set',       1,  28.90);

-- ---------------------------------------------------------------------------
-- Reminders
--
-- Mileage triggers are set near each vehicle's current odometer so the "due
-- soon" maths on the dashboard has something to bite on.
-- ---------------------------------------------------------------------------

insert into public.reminders (vehicle_id, owner_id, type, trigger_type, due_date, due_mileage, status) values
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'oil_change', 'mileage', null, 66000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'insurance_renewal', 'date', (pg_temp.slot(23, 0))::date, null, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001',
   'emission_test', 'date', (pg_temp.slot(-2, 0))::date, null, 'due'),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001',
   'service', 'mileage', null, 25000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000002',
   'service', 'mileage', null, 125000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000002',
   'insurance_renewal', 'date', (pg_temp.slot(5, 0))::date, null, 'due'),
  ('d0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000005',
   'service', 'mileage', null, 40000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'emission_test', 'date', (pg_temp.slot(-40, 0))::date, null, 'completed'),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'other', 'date', (pg_temp.slot(128, 0))::date, null, 'dismissed'),
  ('d0000000-0000-4000-a000-000000000006', 'a0000000-0000-4000-a000-000000000007',
   'oil_change', 'mileage', null, 51000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000007', 'a0000000-0000-4000-a000-000000000007',
   'emission_test', 'date', (pg_temp.slot(11, 0))::date, null, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000008', 'a0000000-0000-4000-a000-000000000008',
   'service', 'date', (pg_temp.slot(-1, 0))::date, null, 'due'),
  ('d0000000-0000-4000-a000-000000000009', 'a0000000-0000-4000-a000-000000000009',
   'other', 'mileage', null, 75000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000009', 'a0000000-0000-4000-a000-000000000009',
   'insurance_renewal', 'date', (pg_temp.slot(60, 0))::date, null, 'scheduled');

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

insert into public.notifications (profile_id, type, title, body, ref_id, read, created_at) values
  ('a0000000-0000-4000-a000-000000000001', 'booking_confirmed',
   'Emission test confirmed', 'Chen Motors confirmed your slot.',
   'e0000000-0000-4000-a000-000000000003', false, now() - interval '3 hours'),
  ('a0000000-0000-4000-a000-000000000001', 'reminder_due',
   'Emission test due', 'The Civic is due for its annual emission test.',
   null, false, now() - interval '2 days'),
  ('a0000000-0000-4000-a000-000000000001', 'service_logged',
   'Oil change logged', 'Patel Auto Works logged an oil change on your Civic.',
   null, true, now() - interval '9 days'),
  ('a0000000-0000-4000-a000-000000000002', 'service_logged',
   'Service record added', 'Patel Auto Works logged brake work on your F-150.',
   'f0000000-0000-4000-a000-000000000002', true, now() - interval '68 days'),
  ('a0000000-0000-4000-a000-000000000002', 'reminder_due',
   'Insurance renewal approaching', 'F-150 insurance expires in under a week.',
   null, false, now() - interval '6 hours'),
  ('a0000000-0000-4000-a000-000000000005', 'booking_pending',
   'AC service requested', 'Rossi Performance has not confirmed your slot yet.',
   'e0000000-0000-4000-a000-00000000000a', false, now() - interval '1 day'),
  ('a0000000-0000-4000-a000-000000000005', 'reminder_due',
   'Golf service approaching', 'Scheduled service is due at 40,000 miles.',
   null, true, now() - interval '14 days'),
  ('a0000000-0000-4000-a000-000000000007', 'booking_confirmed',
   'Alignment confirmed', 'Haddad Tyre & Brake confirmed your CX-5 alignment.',
   'e0000000-0000-4000-a000-000000000012', false, now() - interval '5 hours'),
  ('a0000000-0000-4000-a000-000000000008', 'reminder_due',
   'Bolt service overdue', 'Scheduled service was due yesterday.',
   null, false, now() - interval '20 hours'),
  ('a0000000-0000-4000-a000-000000000009', 'booking_pending',
   'Alignment requested', 'Chen Motors has not confirmed your slot yet.',
   'e0000000-0000-4000-a000-00000000000f', false, now() - interval '2 days'),
  -- Garage side
  ('a0000000-0000-4000-a000-000000000003', 'booking_created',
   'New booking request', 'Ada Lovelace requested a tire rotation tomorrow.',
   'e0000000-0000-4000-a000-000000000004', false, now() - interval '4 hours'),
  ('a0000000-0000-4000-a000-000000000003', 'booking_created',
   'New booking request', 'Nia Okafor requested diagnostics tomorrow.',
   'e0000000-0000-4000-a000-00000000000c', true, now() - interval '1 day'),
  ('a0000000-0000-4000-a000-000000000004', 'booking_created',
   'New booking request', 'Yuki Tanaka requested a wheel alignment.',
   'e0000000-0000-4000-a000-00000000000f', false, now() - interval '2 days'),
  ('a0000000-0000-4000-a000-000000000006', 'booking_created',
   'New booking request', 'Grace Hopper requested a full service.',
   'e0000000-0000-4000-a000-000000000008', false, now() - interval '18 hours'),
  ('a0000000-0000-4000-a000-000000000010', 'booking_created',
   'Two jobs booked in', 'Nia Okafor and Tomas Rivera both booked for the same window.',
   'e0000000-0000-4000-a000-000000000012', false, now() - interval '11 hours');

commit;
