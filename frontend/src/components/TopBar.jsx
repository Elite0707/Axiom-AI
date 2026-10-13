import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldCheck, Cpu, AlertTriangle, Lock } from 'lucide-react'
import { healthApi } from '../lib/api'

const pageTitles = {
  '/dashboard': { title: 'Intelligence Overview', subtitle: 'Executive dashboard & practice area activity' },
  '/ma': { title: 'M&A Due Diligence Suite', subtitle: 'Automated deal term extraction, risk matrix & RAG analysis' },
  '/reports': { title: 'Compliance & Audit Ledger', subtitle: 'Historical reviews and risk assessment reports' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { title, subtitle } = pageTitles[pathname] || { title: 'Axiom', subtitle: 'Legal Intelligence Platform' }
  const [health, setHealth] = useState(null)

  useEffect(() => {
    healthApi.check()
      .then(r => setHealth(r.data))
      .catch(() => setHealth({ status: 'degraded' }))
  }, [])

  return (
    <header className="h-14 flex items-center px-6 border-b border-harvey-border bg-harvey-charcoal/95 backdrop-blur-md flex-shrink-0 justify-between select-none z-10">
      {/* Title area with Harvey editorial serif font */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-serif font-normal text-harvey-ivory tracking-tight">{title}</h1>
          <p className="text-[11px] text-harvey-muted leading-tight font-sans">{subtitle}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Security / Confidentiality Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-harvey-surface border border-harvey-borderSubtle text-[11px] text-harvey-muted font-sans">
          <Lock className="w-3 h-3 text-harvey-gold" />
          <span className="font-medium tracking-tight text-harvey-cream">Airgapped Local Environment</span>
        </div>

        {/* Ollama Health Status */}
        <div className="flex items-center gap-2 bg-harvey-surface border border-harvey-border px-2.5 py-1 rounded text-xs">
          <Cpu className="w-3 h-3 text-harvey-muted" />
          {health?.status === 'healthy' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-harvey-emerald" />
              <span className="text-[11px] text-harvey-cream font-medium">Ollama Active</span>
            </div>
          ) : health?.status === 'degraded' ? (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-harvey-amber" />
              <span className="text-[11px] text-harvey-amber font-medium">Ollama Offline</span>
            </div>
          ) : (
            <span className="text-[11px] text-harvey-muted animate-pulse">Connecting...</span>
          )}
        </div>

        {/* User / Firm Initials */}
        <div className="flex items-center gap-2 pl-2 border-l border-harvey-border">
          <div className="w-7 h-7 rounded bg-harvey-surface border border-harvey-border flex items-center justify-center text-[11px] font-serif font-medium text-harvey-ivory">
            AX
          </div>
        </div>
      </div>
    </header>
  )
}
