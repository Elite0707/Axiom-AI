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
    if (status === 'done') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    if (status === 'running') return <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
    if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-600" />
    return <Clock className="w-3.5 h-3.5 text-neutral-400" />
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
          <h2 className="text-2xl font-serif text-canvas-text font-normal">Compliance & Diligence Audits</h2>
          <p className="text-xs text-canvas-text-muted mt-0.5">Historical ledger of all evaluated M&A agreements and liability matrices</p>
        </div>
        <span className="text-xs font-mono text-canvas-text-muted bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
          {analyses.length} Audits
        </span>
      </div>

      <div className="card overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded" />)}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-canvas-text-muted space-y-2">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-1">
              <Briefcase className="w-5 h-5 text-neutral-500" />
            </div>
            <p className="font-serif text-sm text-canvas-text font-normal">No Historical Audits Recorded</p>
            <p className="text-xs text-canvas-text-muted max-w-sm">
              Upload an agreement in the M&A suite and trigger due diligence to generate audit entries.
            </p>
            <div className="pt-2">
              <Link to="/ma" className="btn-secondary text-xs">
                Go to M&A Suite
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-canvas-border">
            {analyses.map(analysis => (
              <div key={analysis.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded border border-canvas-border flex items-center justify-center bg-neutral-50 flex-shrink-0">
                    <FileText className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-canvas-text truncate">{analysis.document_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-canvas-text-muted">
                      <span>{new Date(analysis.created_at).toLocaleString()}</span>
                      {analysis.result?.deal_type && (
                        <>
                          <span>·</span>
                          <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono text-[10px] border border-neutral-200">
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
                    <span className="text-[11px] capitalize text-canvas-text-muted">{analysis.status}</span>
                  </div>
                  {analysis.result?.risk_flags?.length >= 0 && (
                    <span className="text-[11px] text-canvas-text-muted font-mono hidden sm:inline">
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
