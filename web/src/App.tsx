import Dashboard from '@/pages/Dashboard'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-80">
          <Navbar />

          <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <Dashboard />
          </main>
        </div>
      </div>
    </div>
  )
}