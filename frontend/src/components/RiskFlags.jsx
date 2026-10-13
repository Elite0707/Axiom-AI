import clsx from 'clsx'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

const levelConfig = {
  HIGH: {
    badge: 'badge-high',
    bg: 'bg-harvey-coral/5 border-harvey-coral/25',
    icon: AlertCircle,
    iconClass: 'text-harvey-coral',
    barColor: 'bg-harvey-coral',
  },
  MEDIUM: {
    badge: 'badge-medium',
    bg: 'bg-harvey-amber/5 border-harvey-amber/25',
    icon: AlertTriangle,
    iconClass: 'text-harvey-amber',
    barColor: 'bg-harvey-amber',
  },
  LOW: {
    badge: 'badge-low',
    bg: 'bg-harvey-emerald/5 border-harvey-emerald/25',
    icon: Info,
    iconClass: 'text-harvey-emerald',
    barColor: 'bg-harvey-emerald',
  },
  UNKNOWN: {
    badge: 'badge-unknown',
    bg: 'bg-harvey-surface border-harvey-border',
    icon: Info,
    iconClass: 'text-harvey-muted',
    barColor: 'bg-harvey-muted',
  },
}

export default function RiskFlags({ riskFlags = [], overallRisk = 'UNKNOWN' }) {
  const config = levelConfig[overallRisk] || levelConfig.UNKNOWN

  const highCount = riskFlags.filter(f => f.risk_level === 'HIGH').length
  const medCount = riskFlags.filter(f => f.risk_level === 'MEDIUM').length
  const lowCount = riskFlags.filter(f => f.risk_level === 'LOW').length
  const total = riskFlags.length

  if (!riskFlags.length) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-8 h-8 text-harvey-emerald mb-2" />
        <h4 className="font-serif text-sm font-normal text-harvey-ivory mb-1">Zero Critical Liabilities Identified</h4>
        <p className="text-xs text-harvey-muted max-w-sm">
          No abnormal indemnity caps, MAC carve-outs, or non-compete deviations were flagged during analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Executive Risk Ledger */}
      <div className={clsx('card p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4', config.bg)}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-base text-harvey-ivory font-normal">Overall Transaction Risk</h3>
            <span className={config.badge}>{overallRisk} RISK</span>
          </div>
          <p className="text-xs text-harvey-muted">
            Aggregated legal liability index based on standard market precedents.
          </p>
        </div>

        {/* Breakdown counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-harvey-charcoal border border-harvey-border text-center">
            <span className="block text-xs font-serif font-medium text-harvey-coral">{highCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-harvey-muted">High</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-harvey-charcoal border border-harvey-border text-center">
            <span className="block text-xs font-serif font-medium text-harvey-amber">{medCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-harvey-muted">Medium</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-harvey-charcoal border border-harvey-border text-center">
            <span className="block text-xs font-serif font-medium text-harvey-emerald">{lowCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-harvey-muted">Low</span>
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
                    className="card p-4 hover:border-harvey-muted/60 transition-colors bg-harvey-charcoal"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-sm font-normal text-harvey-ivory">
                          {flag.clause}
                        </span>
                        <span className={lvlConfig.badge}>{flag.risk_level}</span>
                      </div>

                      {flag.page_reference && (
                        <span className="font-mono text-[10px] text-harvey-muted bg-harvey-surface px-2 py-0.5 rounded border border-harvey-borderSubtle flex-shrink-0">
                          {flag.page_reference}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-harvey-textDim leading-relaxed font-sans">
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
