import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

/**
 * The signed-in shell: fixed sidebar, top bar, routed content.
 *
 * Both chrome components read the session themselves via useAuth, so this only
 * has to lay them out. It renders below RequireAuth, so a session is
 * guaranteed by the time it mounts.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-80">
          <Navbar />

          <main className="min-w-0 flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
