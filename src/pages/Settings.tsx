import React, { useState } from 'react';
import { UserIcon, BellIcon, ShieldIcon } from 'lucide-react';
import { PageHeader, Card, Button, Input } from '../components/ui/primitives';
import { currentUser } from '../data/mockData';
import { useApp } from '../context/AppContext';
function Toggle({
  checked,
  onChange,
  label




}: {checked: boolean;onChange: (v: boolean) => void;label: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-slate-200'}`}>
      
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      
    </button>);

}
export function Settings() {
  const { toast } = useApp();
  const [prefs, setPrefs] = useState({
    emailService: true,
    smsService: true,
    emailInsurance: true,
    pushOil: true,
    marketing: false
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and notification preferences." />
      

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-slate-900">
            <UserIcon className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold">Profile</h2>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover" />
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast('Upload photo (demo)')}>
              
              Change photo
            </Button>
          </div>

          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast('Profile saved');
            }}>
            
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </span>
              <Input defaultValue={currentUser.name} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </span>
              <Input type="email" defaultValue={currentUser.email} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </span>
              <Input defaultValue={currentUser.phone} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Location
              </span>
              <Input defaultValue={currentUser.location} />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Card>

        {/* Account meta */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldIcon className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold">Account</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Member since</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {currentUser.memberSince}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Plan</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                Owner · Free
              </dd>
            </div>
          </dl>
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => toast('Password reset link sent (demo)')}>
              
              Change password
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => toast('Account deletion requested (demo)')}>
              
              Delete account
            </Button>
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 text-slate-900">
          <BellIcon className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold">Notification preferences</h2>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {[
          {
            key: 'emailService',
            label: 'Service reminders',
            desc: 'Email me when a service is due.'
          },
          {
            key: 'smsService',
            label: 'SMS alerts',
            desc: 'Text me about upcoming appointments.'
          },
          {
            key: 'emailInsurance',
            label: 'Insurance & emission',
            desc: 'Email me before certificates expire.'
          },
          {
            key: 'pushOil',
            label: 'Oil change nudges',
            desc: 'Push me when approaching oil change intervals.'
          },
          {
            key: 'marketing',
            label: 'Product updates',
            desc: 'Occasional news and offers.'
          }].
          map((row) =>
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 py-4">
            
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {row.label}
                </p>
                <p className="text-xs text-slate-500">{row.desc}</p>
              </div>
              <Toggle
              label={row.label}
              checked={prefs[row.key as keyof typeof prefs]}
              onChange={(v) => {
                setPrefs((p) => ({
                  ...p,
                  [row.key]: v
                }));
                toast('Preferences updated');
              }} />
            
            </div>
          )}
        </div>
      </Card>
    </div>);

}