import { useEffect, useState } from 'react'
import { FileText, Briefcase, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
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
    if (status === 'done') return <CheckCircle className="w-4 h-4 text-green-400" />
    if (status === 'running') return <Loader2 className="w-4 h-4 text-axiom-accent animate-spin" />
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-axiom-muted" />
  }

  const riskBadge = (level) => {
    if (level === 'HIGH') return <span className="badge-high">{level}</span>
    if (level === 'MEDIUM') return <span className="badge-medium">{level}</span>
    if (level === 'LOW') return <span className="badge-low">{level}</span>
    return null
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-axiom-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-axiom-accent" />
          <h2 className="text-sm font-semibold text-white">Analysis Reports</h2>
          <span className="ml-auto text-xs text-axiom-muted bg-axiom-border px-1.5 py-0.5 rounded-full">{analyses.length}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-axiom-muted gap-2">
            <Briefcase className="w-10 h-10 text-axiom-border" />
            <p className="text-sm font-medium">No reports yet</p>
            <p className="text-xs">Upload an M&A document and run an analysis to generate your first report.</p>
          </div>
        ) : (
          <div className="divide-y divide-axiom-border">
            {analyses.map(analysis => (
              <div key={analysis.id} className="px-6 py-4 flex items-center gap-4 hover:bg-axiom-card/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-axiom-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-axiom-text truncate">{analysis.document_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-axiom-muted">
                      {new Date(analysis.created_at).toLocaleString()}
                    </span>
                    {analysis.result?.deal_type && (
                      <span className="text-xs text-axiom-muted bg-axiom-border px-1.5 py-0.5 rounded">
                        {analysis.result.deal_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {analysis.result?.overall_risk_level && riskBadge(analysis.result.overall_risk_level)}
                  {statusIcon(analysis.status)}
                  <div className="text-right">
                    <p className="text-xs capitalize text-axiom-muted">{analysis.status}</p>
                    {analysis.result?.risk_flags?.length >= 0 && (
                      <p className="text-xs text-axiom-muted">{analysis.result.risk_flags.length} risks found</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
