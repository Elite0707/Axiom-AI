import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-harvey-ink text-harvey-ivory font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-harvey-ink">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in bg-harvey-ink">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
