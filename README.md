# vehicle_management_system

Flutter app for vehicle management with Supabase authentication.

## Supabase Auth Setup

1. Create a Supabase project.
2. In Supabase dashboard, go to Authentication and ensure Email provider is enabled.
3. Copy `.env.example` to `.env`.
4. Add your real values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

`.env` is ignored by git and loaded at app startup.

## Run

```bash
flutter pub get
flutter run
```

## What Is Implemented

- Supabase initialization from `.env`
- Login with email/password
- Sign up with email/password
- Auth gate that routes to login or app content based on session
- Sign out on authenticated home screen
