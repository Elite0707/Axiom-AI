import clsx from 'clsx'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

const levelConfig = {
  HIGH: {
    badge: 'badge-high',
    bg: 'bg-red-50/60 border-red-200',
    icon: AlertCircle,
    iconClass: 'text-red-600',
    barColor: 'bg-red-600',
  },
  MEDIUM: {
    badge: 'badge-medium',
    bg: 'bg-amber-50/60 border-amber-200',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    barColor: 'bg-amber-500',
  },
  LOW: {
    badge: 'badge-low',
    bg: 'bg-emerald-50/60 border-emerald-200',
    icon: Info,
    iconClass: 'text-emerald-600',
    barColor: 'bg-emerald-600',
  },
  UNKNOWN: {
    badge: 'badge-unknown',
    bg: 'bg-neutral-50 border-canvas-border',
    icon: Info,
    iconClass: 'text-canvas-text-muted',
    barColor: 'bg-neutral-400',
  },
}

export default function RiskFlags({ riskFlags = [], overallRisk = 'UNKNOWN' }) {
  const config = levelConfig[overallRisk] || levelConfig.UNKNOWN

  const highCount = riskFlags.filter(f => f.risk_level === 'HIGH').length
  const medCount = riskFlags.filter(f => f.risk_level === 'MEDIUM').length
  const lowCount = riskFlags.filter(f => f.risk_level === 'LOW').length

  if (!riskFlags.length) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <h4 className="font-serif text-base font-normal text-canvas-text mb-1">Zero Critical Liabilities Identified</h4>
        <p className="text-xs text-canvas-text-muted max-w-sm">
          No abnormal indemnity caps, MAC carve-outs, or restrictive covenant deviations were flagged during analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Executive Risk Ledger */}
      <div className={clsx('card p-4.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4', config.bg)}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-base text-canvas-text font-normal">Overall Transaction Risk</h3>
            <span className={config.badge}>{overallRisk} RISK</span>
          </div>
          <p className="text-xs text-canvas-text-muted">
            Aggregated legal liability index based on standard market precedents.
          </p>
        </div>

        {/* Breakdown counters */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-md bg-white border border-canvas-border text-center shadow-sm">
            <span className="block text-sm font-serif font-medium text-red-600">{highCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-canvas-text-muted font-medium">High</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-md bg-white border border-canvas-border text-center shadow-sm">
            <span className="block text-sm font-serif font-medium text-amber-600">{medCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-canvas-text-muted font-medium">Medium</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-md bg-white border border-canvas-border text-center shadow-sm">
            <span className="block text-sm font-serif font-medium text-emerald-600">{lowCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-canvas-text-muted font-medium">Low</span>
          </div>
        </div>
      </div>

      {/* Grouped Risk Flag Cards */}
      <div className="space-y-4">
        {['HIGH', 'MEDIUM', 'LOW'].map(level => {
          const flags = riskFlags.filter(f => f.risk_level === level)
          if (!flags.length) return null
          const lvlConfig = levelConfig[level]

          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="section-title">{level} Exposure Clauses ({flags.length})</span>
              </div>

              <div className="space-y-2">
                {flags.map((flag, i) => (
                  <div
                    key={i}
                    className="card p-4 hover:border-neutral-400 transition-colors bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-serif text-sm font-normal text-canvas-text">
                          {flag.clause}
                        </span>
                        <span className={lvlConfig.badge}>{flag.risk_level}</span>
                      </div>

                      {flag.page_reference && (
                        <span className="font-mono text-[10px] text-canvas-text-muted bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 flex-shrink-0">
                          {flag.page_reference}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-canvas-text-muted leading-relaxed font-sans">
                      {flag.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
