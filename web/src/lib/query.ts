import type { PostgrestError } from '@supabase/supabase-js'

type Result<T> = { data: T; error: PostgrestError | null }

/**
 * Unwraps a supabase-js result, throwing when it carries an error.
 *
 * supabase-js resolves rather than rejects on failure — the error comes back
 * in the resolved value. Forget to check it and React Query sees a successful
 * query whose data is null, so a permission failure renders as an empty list
 * and looks like missing data instead of a denied request. Every query in this
 * app goes through here so that cannot happen once.
 *
 * The return is NonNullable<T> rather than T: supabase types `data` as
 * nullable because it is null on error, but we have just ruled that out. Take
 * T straight from `data` and the generic swallows the null, which pushes an
 * `X | null` through to every caller and eventually collapses to `never`.
 *
 * Postgres details are folded into the message because they are usually the
 * whole answer: an RLS refusal names the policy, a constraint violation names
 * the constraint.
 */
export function unwrap<T>(result: Result<T>): NonNullable<T> {
  if (result.error) throw asError(result.error)
  if (result.data === null || result.data === undefined) {
    throw new Error('The query succeeded but returned nothing.')
  }
  return result.data as NonNullable<T>
}

/**
 * Same, for queries where no row is a legitimate answer — `maybeSingle()`.
 * Use this only when the caller genuinely handles null; `unwrap` is the default.
 */
export function unwrapMaybe<T>(result: Result<T>): T {
  if (result.error) throw asError(result.error)
  return result.data
}

export function asError(error: PostgrestError): Error {
  const parts = [error.message]
  if (error.details) parts.push(error.details)
  if (error.hint) parts.push(`Hint: ${error.hint}`)
  return new Error(parts.join(' — '))
}
