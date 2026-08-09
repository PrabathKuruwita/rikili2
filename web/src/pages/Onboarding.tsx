import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/useAuth'

/**
 * Reached only when a signed-in user has no role in their JWT.
 *
 * In normal operation this is unreachable: the on_auth_user_stamp_role trigger
 * writes 'vehicle_owner' into app_metadata before GoTrue mints the first token,
 * so every account has a role from the moment it exists. It stays as a real
 * screen rather than a redirect because the one way to land here — an account
 * created before that trigger, or a session holding a token older than a role
 * change — leaves the user stuck behind RequireRole with nothing to read.
 *
 * There is deliberately no role picker. Roles are granted server-side through
 * set_user_role(); a client-side choice would be a self-service permission
 * upgrade.
 */
export default function Onboarding() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Almost there"
        title="Your account has no type yet"
        description="Rikili needs to know whether you are a vehicle owner or a garage owner before it can show you anything."
      />

      <Card className="space-y-4 p-6">
        <p className="text-sm leading-6 text-slate-600">
          Account types are set by an administrator, not chosen here — a garage account can read its
          customers' details, so it is not something an account can grant itself.
        </p>

        <p className="text-sm leading-6 text-slate-600">
          Ask an administrator to set the type for{' '}
          <span className="font-medium text-slate-900">{user?.email}</span>. If this has just been
          done, sign out and back in: the type is carried in your session token, so an existing
          session keeps the old value until it is refreshed.
        </p>

        <div className="flex justify-end">
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </Card>
    </div>
  )
}
