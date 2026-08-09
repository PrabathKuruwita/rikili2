import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { relativeTime } from '@/lib/format'
import {
  useMarkNotificationsRead,
  useNotifications,
} from '@/features/notifications/useNotifications'

export function NotificationsMenu() {
  const notifications = useNotifications()
  const markRead = useMarkNotificationsRead()

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unread = useMemo(
    () => (notifications.data ?? []).filter((notification) => !notification.read),
    [notifications.data],
  )

  // Close on an outside click or Escape. Without both, the panel survives
  // navigation clicks behind it and ends up floating over the next screen.
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
        aria-expanded={open}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-950">Notifications</p>
            {unread.length > 0 ? (
              <button
                type="button"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate(unread.map((notification) => notification.id))}
                className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.isPending ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading…</p>
            ) : notifications.isError ? (
              <p className="px-4 py-6 text-center text-sm text-rose-600">
                {notifications.error.message}
              </p>
            ) : notifications.data.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Nothing yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.data.map((notification) => (
                  <li
                    key={notification.id}
                    className={notification.read ? 'px-4 py-3' : 'bg-indigo-50/40 px-4 py-3'}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (!notification.read) markRead.mutate([notification.id])
                      }}
                    >
                      <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                      {notification.body ? (
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          {notification.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {relativeTime(notification.created_at)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
