# Rikili — Web

React + TypeScript + Vite frontend, backed by Supabase. Serves both user types:
vehicle owners and garage owners.

Auth, routing, and the database schema work; every feature screen is still a
placeholder waiting to be built.

---

## Getting started

```bash
cd web
pnpm install
cp .env.example .env.local   # then fill in the values — see below
pnpm dev                     # http://localhost:5173
```

### Environment variables

This project points at a **self-hosted** Supabase instance, not supabase.com,
so these come from the server's own `.env` (next to its `docker-compose.yml`) —
there is no dashboard page to copy them from.

| Variable                 | What it is                                              |
| ------------------------ | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Kong gateway base URL, no trailing slash                 |
| `VITE_SUPABASE_ANON_KEY` | Server's `ANON_KEY` (a `eyJ…` JWT with `"role":"anon"`)  |
| `SUPABASE_DB_URL`        | Postgres connection — **`pnpm gen:types` only**          |

`SUPABASE_DB_URL` has two gotchas worth knowing before you debug a failed
connection. Port 5432 is the **Supavisor pooler**, not raw Postgres, so the
username must be `postgres.<POOLER_TENANT_ID>` — a plain `postgres` fails with
`no tenant identifier provided`. And the password must be URL-encoded (`@` →
`%40`, `=` → `%3D`). It is `POSTGRES_PASSWORD` from the server's `.env`, which
is **not** the Studio dashboard password.

Two rules, and they matter:

1. **Only `VITE_`-prefixed vars reach the browser.** Anything in this file is
   shipped to every visitor and is readable in devtools. That is fine for the
   anon key, which is designed to be public.
2. **The `service_role` key never goes in this app.** It bypasses every
   security rule in the database. If a feature seems to need it, that feature
   belongs in an Edge Function, not the frontend.

`SUPABASE_DB_URL` has no `VITE_` prefix on purpose — it holds the database
password and must stay out of the bundle. Never rename it with one.

`.env.local` is gitignored. Keep it that way.

---

## Scripts

| Command          | What it does                            |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Dev server with hot reload              |
| `pnpm build`     | Typecheck + production build to `dist/` |
| `pnpm typecheck` | TypeScript only, no build               |
| `pnpm lint`      | oxlint                                  |
| `pnpm format`    | Prettier, writes in place               |
| `pnpm gen:types` | Regenerate `src/types/database.ts`      |

---

## Database

SQL lives in `supabase/` at the repo root, not in `web/`.

```
supabase/migrations/   schema, RLS policies, triggers — apply in filename order
supabase/seed.sql      development data (safe to re-run)
```

Two ways to apply them, and the choice has a consequence:

- **Studio SQL Editor** (`http://<host>:8010` → SQL Editor). Needs only the
  dashboard login, no database password. But the Supabase CLI does not record
  that it happened, so a later `supabase db push` would try to replay
  everything and collide.
- **`psql` with `SUPABASE_DB_URL`.** Scriptable and CLI-trackable. Use
  `--single-transaction` so a failure rolls back instead of leaving the schema
  half-applied.

After any schema change, run `pnpm gen:types` to keep `src/types/database.ts`
in step. That file is generated — never hand-edit it.

### Seed accounts

`supabase/seed.sql` deletes its own users first, so re-running it is safe. Every
seed account uses the password **`rikili-dev-1234`**:

| Email               | Role            |
| ------------------- | --------------- |
| `ada@example.com`   | `vehicle_owner` |
| `grace@example.com` | `vehicle_owner` |
| `linus@example.com` | `vehicle_owner` |
| `raj@example.com`   | `garage_owner`  |
| `mei@example.com`   | `garage_owner`  |
| `sofia@example.com` | `garage_owner`  |

### Authorization model

The RLS policies never read `profiles.role`. Access is decided by ownership
relations — `owns_vehicle()`, `owns_garage()`, `services_vehicle()` — which are
facts in the data rather than a claim attached to the user. `role` exists only
so the frontend knows which screens to show. A guarded page whose queries are
not covered by RLS is a bug.

---

## Project structure

```
src/
  app/          Router, layout, route guards — the app shell
  components/   Shared presentational components
  features/     One folder per domain area. Hooks, queries, and logic live
                here, next to the thing they serve.
    auth/       Session state, roles, useAuth()
  lib/          Cross-cutting infrastructure (supabase client, env)
  pages/        One component per route. Composes from features/.
  types/        Generated database types
```

**The convention:** `pages/` renders, `features/` thinks. A page should read
like a layout — data fetching and business rules belong in a hook under
`features/`. This keeps pages easy to restyle and logic easy to test.

Import with the `@/` alias (`@/features/auth/useAuth`), not `../../..`.

---

## How auth works

`AuthProvider` (in `src/features/auth/`) subscribes to Supabase's auth state
and exposes it through `useAuth()`:

```tsx
const { user, role, loading, signOut } = useAuth()
```

Always check `loading` before acting on `user` — on a page refresh there is a
moment where the session is still being restored, and treating that as
"logged out" causes a flash-of-login-page.

### Roles

Two roles, defined in `src/features/auth/roles.ts`: `vehicle_owner` and
`garage_owner`. These mirror the `user_role` enum in Postgres exactly — change
one and you must change the other.

There is no separate `mechanic` role: mechanics work under their garage owner's
login, and who actually did the work is recorded on the service record instead.

The role is read from the user's **`app_metadata`**, which only the server can
write and which is embedded in the JWT — so the same value is available to
database policies via `auth.jwt() -> 'app_metadata' ->> 'role'`.

Never read a role from `user_metadata`. Users can edit their own
`user_metadata`, so a role stored there is a self-service permission upgrade.
For the same reason, signup always creates a `vehicle_owner` — the role is
deliberately not taken from the `signUp()` payload.

To promote someone, use the helper the migration installs (service role only,
it keeps the JWT claim and the `profiles` row in step):

```sql
select public.set_user_role(
  (select id from auth.users where email = 'you@example.com'),
  'garage_owner'
);
```

Sign out and back in for the new JWT to pick it up.

### Route guards are not security

`RequireAuth` and `RequireRole` in `src/app/RequireAuth.tsx` control what the
UI shows. They do **not** protect data — anyone can edit the JS bundle and
render any page they like.

The actual boundary is **Row Level Security** in Postgres. The anon key lets
the browser talk to the database directly, so a table without RLS enabled is a
table the whole internet can read.

> A guarded page whose queries are not covered by RLS is a security bug, not a
> styling detail. This is the single most important thing to understand about
> building on Supabase.

---

## Adding a screen

1. Find the route in `src/app/router.tsx` — it's currently a `<Placeholder />`.
2. Create the page in `src/pages/`.
3. Put its data fetching in a hook under `src/features/<area>/`.
4. Swap the router element for your page.

Data fetching uses TanStack Query. The shape to copy:

```ts
// src/features/vehicles/useVehicles.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*')
      if (error) throw error // supabase-js resolves on error — you must throw
      return data
    },
  })
}
```

That `if (error) throw error` line is not optional boilerplate. `supabase-js`
returns errors in the resolved value rather than rejecting, so without the
throw a failed query looks to React Query like a successful empty result.

Note there is no `where user_id = ...` filter. With RLS in place the database
already scopes rows to the caller. Filtering in the client on top of that
suggests the policy isn't doing its job — fix the policy instead.

---

## Not set up yet

Deliberately left open, because they depend on decisions not yet made:

- **Feature screens.** Every route under `src/app/router.tsx` renders a
  `Placeholder`. The schema behind them exists, so they can be built against
  real tables and real types.
- **Testing.** No runner installed. Vitest + Testing Library is the natural fit.
- **CI, deploy, error tracking.**
- **TLS.** The Supabase VM is served over plain HTTP, so the anon key and every
  login password cross the network in cleartext. Fine for local development,
  not fine before real users.
