import { useEffect, useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { PageHeader } from '@/components/PageHeader'
import { ErrorNotice, LoadingRows } from '@/components/QueryState'
import { useProfile, useUpdateProfile } from '@/features/profile/useProfile'
import { useAuth } from '@/features/auth/useAuth'
import { longDate, titleCase } from '@/lib/format'

export default function Settings() {
  const { user, role, signOut } = useAuth()
  const profile = useProfile()
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  // Seed the form once the profile arrives. Rendering the inputs as controlled
  // from `profile.data` directly would make them read-only until it loads.
  useEffect(() => {
    if (!profile.data) return
    setFullName(profile.data.full_name ?? '')
    setPhone(profile.data.phone ?? '')
  }, [profile.data])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await updateProfile.mutateAsync({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
    })
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Settings" title="Your account" />

      {profile.isPending ? (
        <LoadingRows rows={2} />
      ) : profile.isError ? (
        <ErrorNotice error={profile.error} what="your profile" />
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Full name">
              {(id) => (
                <TextInput
                  id={id}
                  maxLength={120}
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
                    setSaved(false)
                  }}
                />
              )}
            </Field>

            <Field label="Phone">
              {(id) => (
                <TextInput
                  id={id}
                  maxLength={30}
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    setSaved(false)
                  }}
                />
              )}
            </Field>

            {updateProfile.isError ? (
              <ErrorNotice error={updateProfile.error} what="the change" />
            ) : null}

            <div className="flex items-center justify-end gap-3">
              {saved ? <span className="text-sm text-emerald-700">Saved.</span> : null}
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="space-y-4 p-6">
        <h2 className="text-base font-semibold text-slate-950">Account</h2>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{user?.email}</dd>
          </div>

          <div>
            <dt className="text-slate-500">Account type</dt>
            <dd className="mt-0.5">
              <Badge>{role ? titleCase(role) : 'Unknown'}</Badge>
            </dd>
          </div>

          {profile.data ? (
            <div>
              <dt className="text-slate-500">Member since</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {longDate(profile.data.created_at)}
              </dd>
            </div>
          ) : null}
        </dl>

        {/*
          Email and account type are read-only on purpose. Role lives in the
          JWT's app_metadata, which only the server can write, and the profiles
          table grants UPDATE on full_name and phone alone — so a role picker
          here would be a self-service permission upgrade if the grant ever
          slipped. Changing role goes through set_user_role() with the service
          role; see web/README.md.
        */}
        <p className="text-xs text-slate-500">
          Email and account type cannot be changed here. Ask an administrator to switch your account
          between vehicle owner and garage owner.
        </p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-semibold text-slate-950">Sign out</p>
          <p className="mt-1 text-sm text-slate-500">Ends the session on this device.</p>
        </div>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </Card>
    </div>
  )
}
