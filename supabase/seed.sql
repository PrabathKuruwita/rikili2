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

begin;

delete from auth.users where email in (
  'ada@example.com', 'grace@example.com', 'raj@example.com', 'mei@example.com',
  'linus@example.com', 'sofia@example.com'
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
  ('a0000000-0000-4000-a000-000000000001'::uuid, 'ada@example.com',   'Ada Lovelace', '+1-555-0101'),
  ('a0000000-0000-4000-a000-000000000002'::uuid, 'grace@example.com', 'Grace Hopper', '+1-555-0102'),
  ('a0000000-0000-4000-a000-000000000003'::uuid, 'raj@example.com',   'Raj Patel',    '+1-555-0201'),
  ('a0000000-0000-4000-a000-000000000004'::uuid, 'mei@example.com',   'Mei Chen',     '+1-555-0202'),
  ('a0000000-0000-4000-a000-000000000005'::uuid, 'linus@example.com', 'Linus Ahlgren','+1-555-0103'),
  ('a0000000-0000-4000-a000-000000000006'::uuid, 'sofia@example.com', 'Sofia Rossi',  '+1-555-0203')
) as d(id, email, full_name, phone);

-- Promote the two garage accounts. This is the supported path: it keeps the JWT
-- claim and the profiles row in step.
select public.set_user_role('a0000000-0000-4000-a000-000000000003', 'garage_owner');
select public.set_user_role('a0000000-0000-4000-a000-000000000004', 'garage_owner');
select public.set_user_role('a0000000-0000-4000-a000-000000000006', 'garage_owner');

-- ---------------------------------------------------------------------------
-- Service catalog
-- ---------------------------------------------------------------------------

insert into public.service_types (id, name, description) values
  ('b0000000-0000-4000-a000-000000000001', 'Oil Change',      'Drain, replace oil and filter.'),
  ('b0000000-0000-4000-a000-000000000002', 'Brake Service',   'Pads, rotors, fluid check.'),
  ('b0000000-0000-4000-a000-000000000003', 'Tire Rotation',   'Rotate and balance all four.'),
  ('b0000000-0000-4000-a000-000000000004', 'Full Service',    'Scheduled major service.'),
  ('b0000000-0000-4000-a000-000000000005', 'Emission Test',   'Annual emissions inspection.'),
  ('b0000000-0000-4000-a000-000000000006', 'AC Service',      'Regas and leak check.')
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
   'Rossi Performance', '7 Franklin St, Chapel Hill NC', '+1-555-0303', 'book@rossiperf.example', 4.9, 4);

insert into public.garage_services (garage_id, service_type_id, price, duration_minutes) values
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000001',  49.99,  45),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 289.00, 120),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003',  35.00,  30),
  ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004', 420.00, 240),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000001',  55.00,  40),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000005',  30.00,  30),
  ('c0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000006', 145.50,  90),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000002', 310.00, 150),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000003',  40.00,  30),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000004', 495.00, 300),
  ('c0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000006', 160.00,  90);

-- ---------------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------------

insert into public.vehicles (id, owner_id, registration_number, brand, model, year, mileage) values
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'NC-4821', 'Toyota', 'Corolla', 2019, 62400),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001',
   'NC-9033', 'Honda',  'Civic',   2022, 21850),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000002',
   'NC-1157', 'Ford',   'F-150',   2017, 118300),
  ('d0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000005',
   'NC-7742', 'Volkswagen', 'Golf', 2021, 34500),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'NC-6610', 'Subaru', 'Outback', 2015, 149200);

-- ---------------------------------------------------------------------------
-- Bookings
--
-- bay_number is deliberately left out: the assign_booking_bay trigger picks the
-- lowest free bay, so this data also exercises that path.
-- ---------------------------------------------------------------------------

insert into public.bookings (id, vehicle_id, owner_id, garage_id, service_type_id, slot_start, slot_end, status, notes) values
  -- Past, completed work
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000001',
   '2026-05-14 09:00+00', '2026-05-14 09:45+00', 'completed', 'Customer waited on site.'),
  ('e0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000002',
   '2026-06-02 13:00+00', '2026-06-02 15:00+00', 'completed', 'Grinding noise on front left.'),
  -- Upcoming
  ('e0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000002',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000005',
   '2026-07-28 10:00+00', '2026-07-28 10:30+00', 'confirmed', null),
  ('e0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000001',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000003',
   '2026-07-30 14:00+00', '2026-07-30 14:30+00', 'pending', 'Pull in for a rotation if there is time.'),
  -- Same garage, same window as the one above: exercises a second bay.
  ('e0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000004',
   '2026-07-30 14:00+00', '2026-07-30 18:00+00', 'confirmed', 'Major service, long job.'),
  -- A cancellation, so the UI has one to render
  ('e0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000002',
   'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000002',
   'b0000000-0000-4000-a000-000000000006',
   '2026-07-24 11:00+00', '2026-07-24 12:30+00', 'cancelled', 'Customer rescheduled.'),
  -- Rossi Performance: past work, an upcoming job, and a no-show.
  ('e0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000004',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000002',
   '2026-04-09 08:30+00', '2026-04-09 11:00+00', 'completed', 'Squeal under braking.'),
  ('e0000000-0000-4000-a000-000000000008', 'd0000000-0000-4000-a000-000000000003',
   'a0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000004',
   '2026-08-04 09:00+00', '2026-08-04 14:00+00', 'confirmed', 'Towing package inspection too.'),
  -- no_show releases the bay, so this one is excluded from the exclusion constraint.
  ('e0000000-0000-4000-a000-000000000009', 'd0000000-0000-4000-a000-000000000005',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000003',
   '2026-07-15 16:00+00', '2026-07-15 16:30+00', 'no_show', 'Did not arrive.'),
  ('e0000000-0000-4000-a000-00000000000a', 'd0000000-0000-4000-a000-000000000005',
   'a0000000-0000-4000-a000-000000000005', 'c0000000-0000-4000-a000-000000000003',
   'b0000000-0000-4000-a000-000000000006',
   '2026-08-11 10:00+00', '2026-08-11 11:30+00', 'pending', 'AC blowing warm.');

-- ---------------------------------------------------------------------------
-- Service history
--
-- Inserting these bumps each vehicle's mileage via the sync_vehicle_mileage
-- trigger, so the odometer values here become the vehicles' current mileage.
-- ---------------------------------------------------------------------------

insert into public.service_records
  (id, vehicle_id, booking_id, garage_id, source, service_date, odometer,
   work_performed, technician_name, labour_cost, parts_cost, created_by) values
  ('f0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'e0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001',
   'booking', '2026-05-14', 61200,
   'Oil and filter replaced. Topped up washer fluid.', 'Danny R.', 30.00, 19.99,
   'a0000000-0000-4000-a000-000000000003'),
  ('f0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000003',
   'e0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001',
   'booking', '2026-06-02', 117900,
   'Front pads and rotors replaced. Brake fluid flushed.', 'Priya S.', 160.00, 129.00,
   'a0000000-0000-4000-a000-000000000003'),
  ('f0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000004',
   'e0000000-0000-4000-a000-000000000007', 'c0000000-0000-4000-a000-000000000003',
   'booking', '2026-04-09', 31900,
   'Rear pads replaced, calipers cleaned and greased.', 'Tomas L.', 175.00, 96.40,
   'a0000000-0000-4000-a000-000000000006');

-- Back-filled by the owner for work done somewhere not on the platform.
insert into public.service_records
  (id, vehicle_id, garage_id, source, service_date, odometer, work_performed,
   external_garage_name, labour_cost, parts_cost, created_by) values
  ('f0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001',
   null, 'manual', '2025-11-20', 54100,
   'Timing belt and water pump replaced.', 'Sunrise Garage (Charlotte)', 380.00, 245.75,
   'a0000000-0000-4000-a000-000000000001'),
  ('f0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000005',
   null, 'manual', '2026-02-08', 146800,
   'Clutch replacement and gearbox oil.', 'Ahlgren Family Garage', 640.00, 410.20,
   'a0000000-0000-4000-a000-000000000005');

insert into public.service_parts (service_record_id, name, quantity, unit_cost) values
  ('f0000000-0000-4000-a000-000000000001', 'Oil filter',           1,  8.99),
  ('f0000000-0000-4000-a000-000000000001', '5W-30 synthetic (qt)', 5,  2.20),
  ('f0000000-0000-4000-a000-000000000002', 'Brake pad set (front)',1, 74.00),
  ('f0000000-0000-4000-a000-000000000002', 'Rotor',                2, 27.50),
  ('f0000000-0000-4000-a000-000000000003', 'Timing belt kit',      1, 189.75),
  ('f0000000-0000-4000-a000-000000000003', 'Water pump',           1,  56.00),
  ('f0000000-0000-4000-a000-000000000004', 'Brake pad set (rear)', 1,  68.40),
  ('f0000000-0000-4000-a000-000000000004', 'Caliper grease',       2,  14.00),
  ('f0000000-0000-4000-a000-000000000005', 'Clutch kit',           1, 352.20),
  ('f0000000-0000-4000-a000-000000000005', 'Gearbox oil (l)',      2,  29.00);

-- ---------------------------------------------------------------------------
-- Reminders and notifications
-- ---------------------------------------------------------------------------

insert into public.reminders (vehicle_id, owner_id, type, trigger_type, due_date, due_mileage, status) values
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'oil_change', 'mileage', null, 66000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001',
   'insurance_renewal', 'date', '2026-09-01', null, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001',
   'emission_test', 'date', '2026-07-28', null, 'due'),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000002',
   'service', 'mileage', null, 125000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000005',
   'service', 'mileage', null, 40000, 'scheduled'),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'emission_test', 'date', '2026-06-30', null, 'completed'),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000005',
   'other', 'date', '2026-12-15', null, 'dismissed');

insert into public.notifications (profile_id, type, title, body, ref_id, read) values
  ('a0000000-0000-4000-a000-000000000001', 'booking_confirmed',
   'Emission test confirmed', 'Chen Motors confirmed your 28 Jul slot.',
   'e0000000-0000-4000-a000-000000000003', false),
  ('a0000000-0000-4000-a000-000000000001', 'reminder_due',
   'Emission test due', 'The Civic is due for its annual emission test.', null, false),
  ('a0000000-0000-4000-a000-000000000002', 'service_logged',
   'Service record added', 'Patel Auto Works logged brake work on your F-150.',
   'f0000000-0000-4000-a000-000000000002', true),
  ('a0000000-0000-4000-a000-000000000005', 'booking_pending',
   'AC service requested', 'Rossi Performance has not confirmed your 11 Aug slot yet.',
   'e0000000-0000-4000-a000-00000000000a', false),
  ('a0000000-0000-4000-a000-000000000005', 'reminder_due',
   'Golf service approaching', 'Scheduled service is due at 40,000 miles.', null, true),
  ('a0000000-0000-4000-a000-000000000006', 'booking_created',
   'New booking request', 'Grace Hopper requested a full service on 4 Aug.',
   'e0000000-0000-4000-a000-000000000008', false);

commit;
