import { useEffect, useState } from 'react'
import { FileText, Briefcase, CheckCircle2, AlertCircle, Clock, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analysisApi, documentsApi } from '../lib/api'

export default function Reports() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: docs } = await documentsApi.list('ma')
        const allAnalyses = []
        for (const doc of docs) {
          try {
            const { data } = await analysisApi.getForDocument(doc.id)
            allAnalyses.push(...data)
          } catch {}
        }
        allAnalyses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setAnalyses(allAnalyses)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statusIcon = (status) => {
    if (status === 'done') return <CheckCircle2 className="w-3.5 h-3.5 text-harvey-emerald" />
    if (status === 'running') return <Loader2 className="w-3.5 h-3.5 text-harvey-ivory animate-spin" />
    if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-harvey-coral" />
    return <Clock className="w-3.5 h-3.5 text-harvey-muted" />
  }

  const riskBadge = (level) => {
    if (level === 'HIGH') return <span className="badge-high">{level}</span>
    if (level === 'MEDIUM') return <span className="badge-medium">{level}</span>
    if (level === 'LOW') return <span className="badge-low">{level}</span>
    return null
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans animate-fade-in">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-serif text-harvey-ivory font-normal">Compliance & Diligence Audits</h2>
          <p className="text-xs text-harvey-muted mt-0.5">Historical record of all evaluated M&A agreements and liability matrices</p>
        </div>
        <span className="text-xs font-mono text-harvey-muted bg-harvey-surface px-2.5 py-1 rounded border border-harvey-borderSubtle">
          {analyses.length} Audits
        </span>
      </div>

      <div className="card overflow-hidden bg-harvey-charcoal">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded" />)}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-harvey-muted space-y-2">
            <Briefcase className="w-8 h-8 text-harvey-border" />
            <p className="font-serif text-sm text-harvey-ivory">No Historical Audits Recorded</p>
            <p className="text-xs text-harvey-muted max-w-sm">
              Upload an agreement in the M&A suite and trigger due diligence to generate audit entries.
            </p>
            <div className="pt-2">
              <Link to="/ma" className="btn-secondary text-xs">
                Go to M&A Suite
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-harvey-borderSubtle">
            {analyses.map(analysis => (
              <div key={analysis.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-harvey-surface/60 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0">
                    <FileText className="w-4 h-4 text-harvey-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-harvey-ivory truncate">{analysis.document_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-harvey-muted">
                      <span>{new Date(analysis.created_at).toLocaleString()}</span>
                      {analysis.result?.deal_type && (
                        <>
                          <span>·</span>
                          <span className="bg-harvey-surface text-harvey-textDim px-1.5 py-0.2 rounded font-mono text-[10px] border border-harvey-borderSubtle">
                            {analysis.result.deal_type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {analysis.result?.overall_risk_level && riskBadge(analysis.result.overall_risk_level)}
                  <div className="flex items-center gap-1.5">
                    {statusIcon(analysis.status)}
                    <span className="text-[11px] capitalize text-harvey-muted">{analysis.status}</span>
                  </div>
                  {analysis.result?.risk_flags?.length >= 0 && (
                    <span className="text-[11px] text-harvey-muted font-mono hidden sm:inline">
                      {analysis.result.risk_flags.length} risks
                    </span>
                  )}
                  <Link
                    to="/ma"
                    className="btn-ghost p-1.5"
                    title="View in M&A Suite"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
