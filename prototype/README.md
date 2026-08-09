# UI prototype

A clickable design prototype of the Rikili product surface: 12 screens covering
the vehicle-owner and garage flows, plus the login and sign-up forms.

**This is not the application.** The app is [`../web`](../web). This folder is
reference material — build screens here to agree on a design, then port them
into `web/`.

## Why it is kept separate

The prototype was written independently of `web/` and the two cannot be merged
mechanically:

| | `prototype/` | `web/` |
| --- | --- | --- |
| Data | in-memory mocks (`src/data/mockData.ts`) | Postgres via Supabase |
| Types | hand-written (`src/types/index.ts`) | generated from the schema (`src/types/database.ts`) |
| Roles | `'owner' \| 'station'` | `'vehicle_owner' \| 'garage_owner'` — the `user_role` enum |
| React | 18 | 19 |
| Router | react-router 6, `<Routes>` | react-router 7, `createBrowserRouter` |
| Tailwind | v4 via PostCSS | v4 via the Vite plugin |
| Package manager | npm | pnpm |

Only the auth pages talk to Supabase. Every other screen renders mock state
held in `src/context/AppContext.tsx`; booking, logging service, and dismissing
reminders all mutate React state and are lost on refresh.

The role values in particular are a trap: `'owner' | 'station'` does not exist
anywhere in the database. Row Level Security keys off `user_role`, so any
prototype screen ported across has to be re-pointed at the real enum — see
`web/src/features/auth/roles.ts`.

## Running it

```sh
cd prototype
npm install
cp .env.example .env.local   # only needed for the auth screens
npm run dev                  # http://localhost:3000
```

`web/` runs on Vite's default port, so both can run at once.

## Porting a screen into `web/`

1. Read the real shape of the data in `supabase/migrations/` and
   `web/src/types/database.ts`.
2. Add the page under `web/src/pages/` and its queries under
   `web/src/features/`, using React Query rather than `AppContext`.
3. Swap the matching `<Placeholder />` in `web/src/app/router.tsx` for it, under
   the correct `<RequireRole>` guard.
4. Confirm the queries are covered by an RLS policy. A guarded route whose
   queries are not covered by RLS is a security bug — the route guard is UX
   only.
