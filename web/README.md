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
| `pnpm db:status` | Compare local migrations to the remote  |
| `pnpm db:push`   | Apply pending migrations to the remote  |

---

## Database

SQL lives in `supabase/` at the repo root, not in `web/`.

```
supabase/migrations/   schema, RLS policies, triggers — apply in filename order
supabase/seed.sql      development data (safe to re-run)
```

The normal loop is: write a migration, `pnpm db:push`, then `pnpm gen:types`.
`pnpm db:status` shows local vs remote. That file is generated — never
hand-edit it.

```bash
pnpm db:status              # what's applied where
pnpm db:push --dry-run      # what would run
pnpm db:push                # apply
pnpm gen:types              # resync TypeScript types
```

Two things about this setup are non-obvious, and both cost time to rediscover:

**The CLI insists on TLS; this server has none.** Postgres on the VM does not
speak SSL at all, so the CLI fails with `server refused TLS connection`.
`PGSSLMODE=disable` in `.env.local` is what makes every `supabase` command work
— it is not optional here.

**`supabase/` lives at the repo root, not in `web/`.** The scripts pass
`--workdir ..` so the CLI finds it. Running `supabase` by hand from `web/` will
not.

### Apply migrations with `db:push`, not Studio

You can also run SQL through the **Studio SQL Editor** (`http://<host>:8010`),
which needs only the dashboard login and no database password. It works, and
that is the problem: the CLI has no way to know it happened. This project
already needed one `supabase migration repair` pass for exactly that reason —
the schema was applied through Studio, so `supabase_migrations.schema_migrations`
did not exist at all, and a `db push` would have replayed everything against
tables that already existed.

**`db:status` will not catch a repeat of this.** It compares version numbers
between `supabase/migrations/` and the remote — not schema contents. Anything
done in the SQL Editor leaves both sides reporting "up to date" while the
database quietly diverges from the files that are supposed to describe it. The
drift is invisible until something fails for an unrelated-looking reason.

So: `db:push` is the only path that keeps history honest. Use the SQL Editor for
reading data and one-off inspection. If you do change schema there — including
`alter`s you think are too small to matter — write the equivalent migration file
and run `supabase migration repair --status applied <version>` afterwards, or
the next person to run `db:push` inherits the mess.

### Scheduled jobs

There is one background job in the database, registered with `pg_cron` by
`20260726010000_reminder_transitions.sql`. It is worth knowing about, because
nothing in this codebase calls it and nothing in the app will tell you it ran:

| Job                     | Schedule           | Does                                              |
| ----------------------- | ------------------ | ------------------------------------------------- |
| `reminders-daily-sweep` | `15 3 * * *` (UTC) | `select public.sweep_due_reminders()` — moves date reminders that have come due from `scheduled` to `due` |

```sql
select * from cron.job;                                  -- is it registered
select * from cron.job_run_details order by start_time desc limit 10;   -- did it run
select public.sweep_due_reminders();                     -- run it by hand (returns rows moved)
```

The sweep is idempotent — it only matches `scheduled` rows — so running it by
hand is safe. It is not executable by `anon` or `authenticated`: it runs as
`security definer` over every user's reminders and has no `auth.uid()`.

Mileage reminders need no schedule. They are evaluated by a trigger on
`service_records`, the moment an odometer reading advances the vehicle.

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

## Contributing

Nothing is committed straight to `main`. The flow is always the same:

```bash
git checkout main
git pull                        # branch off current main, not a stale one
git checkout -b vidur/booking-availability-rpc
# ...work, commit as you go...
git push -u origin vidur/booking-availability-rpc
```

Then open a PR into `main` on GitHub.

**Branch names are `name/descriptor`** — your name, a slash, then what the
branch does (`devini/signup-page`, `raj/reminder-sweep`). With several people
working at once, the name tells everyone whose branch it is at a glance, and
the descriptor saves them opening it to find out what it touches.

Branch from up-to-date `main` every time. Branching off yesterday's `main`, or
off another feature branch, is how you end up resolving conflicts that have
nothing to do with your change.

Commit as you work rather than squashing everything into one commit at the
end — a reviewer can follow a series of small commits, and `git bisect` can
only isolate a bug to the commit that caused it if the commits are small.

Open the PR when the branch is ready for someone else to read. It does not
have to be finished — a draft PR is a good way to ask whether an approach is
right before building the rest of it.

One thing specific to this repo: **SQL lives in `supabase/` at the repo root,
not in `web/`**, so a branch that adds a migration touches files outside this
directory. Make sure they are in the same PR. A migration merged without the
frontend that depends on it is fine; the reverse is a broken `main`.

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
