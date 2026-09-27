import { useEffect, useState } from 'react'
import Dashboard from '@/pages/Dashboard'
import MyVehicles from '@/pages/MyVehicles'
import BookService from '@/pages/BookService'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

export default function App() {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || '#dashboard')

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#dashboard'
    }

    const handleHashChange = () => {
      setActiveHash(window.location.hash || '#dashboard')
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar activeHash={activeHash} />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-80">
          <Navbar />

          <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            {activeHash === '#vehicles' ? <MyVehicles /> : activeHash === '#book-service' ? <BookService /> : <Dashboard />}
          </main>
        </div>
      </div>
    </div>
  )
}