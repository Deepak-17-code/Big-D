import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="ambient-bg" />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <Navbar />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
