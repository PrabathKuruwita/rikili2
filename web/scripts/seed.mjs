/**
 * Applies supabase/seed.sql to the database in SUPABASE_DB_URL.
 *
 * `supabase db query -f` cannot run this file: it sends the whole thing as one
 * prepared statement, and Postgres refuses multiple commands in a prepared
 * statement. node-postgres falls back to the simple query protocol whenever a
 * query has no bound parameters, and that protocol does accept a multi-statement
 * string -- which is all this script needs to be.
 *
 * The seed opens with BEGIN and ends with COMMIT, so it is one transaction:
 * either the whole dataset lands or none of it does.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'

const here = path.dirname(fileURLToPath(import.meta.url))
const seedPath = path.resolve(here, '../../supabase/seed.sql')

const connectionString = process.env.SUPABASE_DB_URL
if (!connectionString) {
  console.error('SUPABASE_DB_URL is not set. It lives in web/.env.local — see web/README.md.')
  process.exit(1)
}

// The VM's Postgres does not speak TLS at all, which is also why every supabase
// CLI call here needs PGSSLMODE=disable.
const client = new pg.Client({ connectionString, ssl: false })

try {
  const sql = await readFile(seedPath, 'utf8')
  await client.connect()
  await client.query(sql)
  console.log(`Seeded from ${path.relative(process.cwd(), seedPath)}`)
} catch (error) {
  // A failed seed rolls back, so the useful output is why, not a stack trace
  // through node-postgres.
  console.error(`Seed failed: ${error.message}`)
  if (error.detail) console.error(`  detail: ${error.detail}`)
  if (error.hint) console.error(`  hint: ${error.hint}`)
  process.exitCode = 1
} finally {
  await client.end()
}
