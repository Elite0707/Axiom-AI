import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas-bg text-canvas-text font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-canvas-bg">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in bg-canvas-bg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
