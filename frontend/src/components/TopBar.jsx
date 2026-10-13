import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Cpu, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { healthApi } from '../lib/api'

const pageTitles = {
  '/dashboard': { title: "Command Center", subtitle: "Practice area diagnostics & recent contract activity" },
  '/ma': { title: "M&A Due Diligence", subtitle: "Clause extraction, risk flags, and deal covenants" },
  '/reports': { title: "Contract Intelligence", subtitle: "Audit reports & liability benchmark ledger" },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { title, subtitle } = pageTitles[pathname] || { title: "Command Center", subtitle: "" }
  const [health, setHealth] = useState(null)

  useEffect(() => {
    healthApi.check()
      .then(r => setHealth(r.data))
      .catch(() => setHealth({ status: 'degraded' }))
  }, [])

  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-canvas-border bg-white select-none z-10">
      {/* Page Title in Harvey Serif */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-serif text-canvas-text font-normal tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-canvas-textMuted font-sans">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls matching Harvey Header */}
      <div className="flex items-center gap-3">
        {/* Airgapped Security Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas-bg border border-canvas-border text-[11px] text-canvas-textMuted font-medium">
          <Lock className="w-3 h-3 text-neutral-600" />
          <span>Local Engine · Zero Egress</span>
        </div>

        {/* Local Ollama Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-canvas-bg border border-canvas-border text-xs">
          <Cpu className="w-3 h-3 text-canvas-textMuted" />
          {health?.status === 'healthy' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
              <span className="text-[11px] text-canvas-text font-medium">Ollama Ready</span>
            </div>
          ) : health?.status === 'degraded' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-med" />
              <span className="text-[11px] text-risk-med font-medium">Offline</span>
            </div>
          ) : (
            <span className="text-[11px] text-canvas-textMuted animate-pulse">Checking...</span>
          )}
        </div>

        {/* Harvey's Signature Black Pill Button: "Ask Harvey" -> "Ask Axiom" */}
        <button
          onClick={() => navigate('/ma')}
          className="bg-black hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span className="font-serif font-bold text-xs">A</span>
          <span>Ask Axiom</span>
        </button>
      </div>
    </header>
  )
}
