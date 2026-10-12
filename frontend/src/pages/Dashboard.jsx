import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, TrendingUp, Shield, Clock,
  ArrowRight, CheckCircle, AlertCircle, Loader2, Cpu
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { healthApi } from '../lib/api'

export default function Dashboard() {
  const { documents, fetchDocuments, documentsLoading } = useStore()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetchDocuments()
    healthApi.check().then(r => setHealth(r.data)).catch(() => setHealth({ status: 'degraded' }))
  }, [])

  const readyDocs = documents.filter(d => d.status === 'ready').length
  const processingDocs = documents.filter(d => d.status === 'processing').length

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden card p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-axiom-accent/10 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome to <span className="text-axiom-accent">Axiom AI</span>
              </h2>
              <p className="text-sm text-axiom-textDim max-w-lg">
                Your AI-powered legal compliance platform. Upload M&A documents and get instant due diligence analysis, risk assessment, and intelligent Q&A — all running locally on your machine.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-axiom-accent to-blue-700 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Link to="/ma" className="btn-primary text-sm">
              <Briefcase className="w-4 h-4" />
              Start M&A Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="section-title">Total Documents</span>
            <FileText className="w-4 h-4 text-axiom-accent" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{documents.length}</p>
          <p className="text-xs text-axiom-muted">{readyDocs} ready · {processingDocs} processing</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="section-title">Active Module</span>
            <Briefcase className="w-4 h-4 text-axiom-gold" />
          </div>
          <p className="text-lg font-bold text-white mt-1">M&A</p>
          <p className="text-xs text-axiom-muted">Due Diligence</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="section-title">AI Engine</span>
            <Cpu className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1">Local</p>
          <p className="text-xs text-axiom-muted">Ollama · No API costs</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="section-title">System Status</span>
            {health?.status === 'healthy'
              ? <CheckCircle className="w-4 h-4 text-green-400" />
              : <AlertCircle className="w-4 h-4 text-amber-400" />
            }
          </div>
          <p className={`text-lg font-bold mt-1 ${health?.status === 'healthy' ? 'text-green-400' : 'text-amber-400'}`}>
            {health?.status === 'healthy' ? 'Healthy' : health?.status === 'degraded' ? 'Degraded' : '...'}
          </p>
          <p className="text-xs text-axiom-muted">
            {health?.configured_model || 'Checking Ollama...'}
          </p>
        </div>
      </div>

      {/* Ollama warning if offline */}
      {health?.status === 'degraded' && (
        <div className="card p-4 border-amber-500/25 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">Ollama Not Detected</p>
              <p className="text-xs text-axiom-textDim mb-2">
                The AI engine is offline. Please start Ollama and pull the required models.
              </p>
              <div className="space-y-1">
                {(health.instructions || []).map((step, i) => (
                  <code key={i} className="block text-xs bg-axiom-card border border-axiom-border px-2 py-1 rounded text-axiom-text font-mono">
                    {step}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-axiom-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-axiom-accent" />
            <h3 className="text-sm font-semibold text-white">Recent Documents</h3>
          </div>
          <Link to="/ma" className="text-xs text-axiom-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {documentsLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-center">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-48 rounded" />
                  <div className="skeleton h-2 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-axiom-muted gap-2">
            <FileText className="w-8 h-8" />
            <p className="text-sm">No documents yet</p>
            <Link to="/ma" className="btn-primary text-xs mt-1">Upload your first document</Link>
          </div>
        ) : (
          <div className="divide-y divide-axiom-border">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-axiom-card/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-axiom-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-axiom-text truncate">{doc.original_name}</p>
                  <p className="text-xs text-axiom-muted">
                    {doc.page_count} pages · {doc.chunk_count} chunks · {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {doc.status === 'ready' && <span className="badge-low">Ready</span>}
                  {doc.status === 'processing' && (
                    <div className="flex items-center gap-1 text-xs text-axiom-accent">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing
                    </div>
                  )}
                  {doc.status === 'error' && <span className="badge-high">Error</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Platform Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/ma" className="card p-5 hover:border-axiom-accent/40 hover:shadow-glow-blue transition-all group">
            <div className="w-10 h-10 rounded-xl bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center mb-3 group-hover:bg-axiom-accent/20 transition-colors">
              <Briefcase className="w-5 h-5 text-axiom-accent" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">M&A Due Diligence</h4>
            <p className="text-xs text-axiom-muted leading-relaxed">
              Upload M&A documents for automated party extraction, risk analysis, and compliance review.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs text-axiom-accent">
              Open module <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <div className="card p-5 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-axiom-border flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-axiom-muted" />
            </div>
            <h4 className="text-sm font-semibold text-axiom-textDim mb-1">Contract Review</h4>
            <p className="text-xs text-axiom-muted leading-relaxed">AI-powered contract analysis, redlining, and clause comparison.</p>
            <div className="mt-3">
              <span className="badge-unknown">Coming Soon</span>
            </div>
          </div>

          <div className="card p-5 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-axiom-border flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-axiom-muted" />
            </div>
            <h4 className="text-sm font-semibold text-axiom-textDim mb-1">GDPR Compliance</h4>
            <p className="text-xs text-axiom-muted leading-relaxed">Automated GDPR compliance auditing for privacy policies and DPAs.</p>
            <div className="mt-3">
              <span className="badge-unknown">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
