import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, Cpu, CheckCircle, AlertTriangle } from 'lucide-react'
import { healthApi } from '../lib/api'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Platform overview & recent activity' },
  '/ma': { title: 'M&A Due Diligence', subtitle: 'Mergers & Acquisitions analysis' },
  '/reports': { title: 'Reports', subtitle: 'Generated analysis reports' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { title, subtitle } = pageTitles[pathname] || { title: 'Axiom AI', subtitle: '' }
  const [health, setHealth] = useState(null)

  useEffect(() => {
    healthApi.check().then(r => setHealth(r.data)).catch(() => setHealth({ status: 'degraded' }))
  }, [])

  return (
    <header className="h-16 flex items-center px-6 border-b border-axiom-border bg-axiom-surface/80 backdrop-blur-sm flex-shrink-0">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <p className="text-xs text-axiom-muted">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Ollama status */}
        <div className="flex items-center gap-2 bg-axiom-card border border-axiom-border px-3 py-1.5 rounded-lg">
          <Cpu className="w-3.5 h-3.5 text-axiom-muted" />
          {health?.status === 'healthy' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400">Ollama Online</span>
            </>
          ) : health?.status === 'degraded' ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400">Ollama Offline</span>
            </>
          ) : (
            <span className="text-xs text-axiom-muted animate-pulse">Checking...</span>
          )}
        </div>

        {/* Notification bell */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-axiom-muted 
                          hover:text-axiom-text hover:bg-axiom-card transition-all">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-axiom-accent to-blue-700 
                       flex items-center justify-center text-xs font-bold text-white">
          A
        </div>
      </div>
    </header>
  )
}
