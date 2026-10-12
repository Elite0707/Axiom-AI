import clsx from 'clsx'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

const levelConfig = {
  HIGH: {
    badge: 'badge-high',
    bg: 'bg-red-500/5 border-red-500/20',
    icon: AlertCircle,
    iconClass: 'text-red-400',
  },
  MEDIUM: {
    badge: 'badge-medium',
    bg: 'bg-amber-500/5 border-amber-500/20',
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
  },
  LOW: {
    badge: 'badge-low',
    bg: 'bg-green-500/5 border-green-500/20',
    icon: Info,
    iconClass: 'text-green-400',
  },
  UNKNOWN: {
    badge: 'badge-unknown',
    bg: 'bg-gray-500/5 border-gray-500/20',
    icon: Info,
    iconClass: 'text-gray-400',
  },
}

export default function RiskFlags({ riskFlags = [], overallRisk = 'UNKNOWN' }) {
  const config = levelConfig[overallRisk] || levelConfig.UNKNOWN

  const highCount = riskFlags.filter(f => f.risk_level === 'HIGH').length
  const medCount = riskFlags.filter(f => f.risk_level === 'MEDIUM').length
  const lowCount = riskFlags.filter(f => f.risk_level === 'LOW').length

  if (!riskFlags.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-axiom-muted gap-2">
        <CheckCircle className="w-8 h-8 text-green-400" />
        <p className="text-sm">No risk flags identified</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Risk Summary Banner */}
      <div className={clsx('border rounded-xl p-4 flex items-center gap-4', config.bg)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-axiom-text">Overall Risk Assessment</span>
            <span className={config.badge}>{overallRisk}</span>
          </div>
          <div className="flex gap-4 text-xs text-axiom-muted">
            <span className="text-red-400 font-medium">{highCount} High</span>
            <span className="text-amber-400 font-medium">{medCount} Medium</span>
            <span className="text-green-400 font-medium">{lowCount} Low</span>
          </div>
        </div>
      </div>

      {/* Risk Flag List */}
      <div className="space-y-3">
        {['HIGH', 'MEDIUM', 'LOW'].map(level => {
          const flags = riskFlags.filter(f => f.risk_level === level)
          if (!flags.length) return null
          const lvlConfig = levelConfig[level]
          const Icon = lvlConfig.icon

          return (
            <div key={level}>
              <p className="section-title mb-2">{level} Risk ({flags.length})</p>
              <div className="space-y-2">
                {flags.map((flag, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'border rounded-lg p-3.5 transition-all hover:scale-[1.005]',
                      lvlConfig.bg
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', lvlConfig.iconClass)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-axiom-text">{flag.clause}</span>
                          <span className={lvlConfig.badge}>{flag.risk_level}</span>
                          {flag.page_reference && (
                            <span className="text-[10px] text-axiom-muted bg-axiom-border px-1.5 py-0.5 rounded">
                              {flag.page_reference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-axiom-textDim leading-relaxed">{flag.description}</p>
                      </div>
                    </div>
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
