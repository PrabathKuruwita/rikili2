# Rikili — Web

React + TypeScript + Vite frontend, backed by Supabase. Serves all user types:
vehicle owners, mechanics, station managers, and platform admins.

This is a **scaffold**. Auth and routing work; every feature screen is a
placeholder waiting to be built.

---

## Getting started

```bash
cd web
pnpm install
cp .env.example .env.local   # then fill in the two values — see below
pnpm dev                     # http://localhost:5173
```

### Environment variables

Both come from **Supabase Dashboard → Project Settings → API**:

| Variable                 | Where to find it                            |
| ------------------------ | ------------------------------------------- |
| `VITE_SUPABASE_URL`      | "Project URL"                               |
| `VITE_SUPABASE_ANON_KEY` | "Project API keys" → `anon` / `publishable` |

Two rules, and they matter:

1. **Only `VITE_`-prefixed vars reach the browser.** Anything in this file is
   shipped to every visitor and is readable in devtools. That is fine for the
   anon key, which is designed to be public.
2. **The `service_role` key never goes in this app.** It bypasses every
   security rule in the database. If a feature seems to need it, that feature
   belongs in an Edge Function, not the frontend.

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

Four roles, defined in `src/features/auth/roles.ts`: `owner`, `mechanic`,
`station_manager`, `admin`.

The role is read from the user's **`app_metadata`**, which only the server can
write and which is embedded in the JWT — so the same value is available to
database policies via `auth.jwt() -> 'app_metadata' ->> 'role'`.

Never read a role from `user_metadata`. Users can edit their own
`user_metadata`, so a role stored there is a self-service permission upgrade.

To set a role while developing, in the Supabase SQL editor:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"owner"}'::jsonb
where email = 'you@example.com';
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

- **Database schema and migrations.** No tables exist. `src/types/database.ts`
  is a placeholder typed `any`; run `pnpm gen:types` once the schema lands and
  the whole app gains type-safe queries.
- **RLS policies.** Must be written alongside the schema, never after.
- **Testing.** No runner installed. Vitest + Testing Library is the natural fit.
- **CI, deploy, error tracking.**
