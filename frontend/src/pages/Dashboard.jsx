import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, Shield, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Cpu, Database, Sparkles, Scale
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { healthApi } from '../lib/api'

export default function Dashboard() {
  const { documents, fetchDocuments, documentsLoading } = useStore()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetchDocuments()
    healthApi.check()
      .then(r => setHealth(r.data))
      .catch(() => setHealth({ status: 'degraded' }))
  }, [])

  const readyDocs = documents.filter(d => d.status === 'ready').length
  const processingDocs = documents.filter(d => d.status === 'processing').length

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans animate-fade-in">
      {/* Editorial Hero Header (Inspired by Harvey's landing & command center) */}
      <div className="card p-8 bg-harvey-charcoal relative overflow-hidden border-harvey-border">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-harvey-surface border border-harvey-borderSubtle text-[11px] text-harvey-gold font-medium">
            <Sparkles className="w-3 h-3 text-harvey-gold" />
            <span>Professional Class Legal AI · M&A Edition</span>
          </div>

          <h2 className="text-3xl font-serif text-harvey-ivory font-normal tracking-tight leading-tight">
            Precision Intelligence for Complex Transactions
          </h2>

          <p className="text-xs text-harvey-muted leading-relaxed">
            Automate M&A contract review, identify unfavorable indemnity caps, detect buried material adverse change (MAC) qualifiers, and converse directly with deal agreements—completely airgapped with local LLM inference.
          </p>

          <div className="pt-2">
            <Link to="/ma" className="btn-primary inline-flex">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Launch M&A Due Diligence Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Subtle decorative watermark */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none font-serif text-9xl text-harvey-ivory hidden lg:block">
          :A:
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="section-title">Indexed Documents</span>
          <div className="mt-2">
            <p className="font-serif text-2xl text-harvey-ivory font-normal">{documents.length}</p>
            <p className="text-[11px] text-harvey-muted mt-0.5">{readyDocs} Ready · {processingDocs} Indexing</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="section-title">Active Suite</span>
          <div className="mt-2">
            <p className="font-serif text-2xl text-harvey-ivory font-normal">M&A Due Diligence</p>
            <p className="text-[11px] text-harvey-gold mt-0.5">Automated Term Extraction</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="section-title">Inference Engine</span>
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-harvey-emerald" />
              <p className="font-serif text-xl text-harvey-ivory font-normal">Local LLM</p>
            </div>
            <p className="text-[11px] text-harvey-muted mt-0.5">Ollama · Zero API Egress</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="section-title">Core Diagnostic</span>
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              {health?.status === 'healthy' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-harvey-emerald" />
                  <p className="font-serif text-xl text-harvey-ivory font-normal">Operational</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-harvey-amber" />
                  <p className="font-serif text-xl text-harvey-amber font-normal">Degraded</p>
                </>
              )}
            </div>
            <p className="text-[11px] text-harvey-muted mt-0.5 truncate">
              {health?.configured_model || 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Ollama Diagnostic Alert if Degraded */}
      {health?.status === 'degraded' && (
        <div className="card p-4 border-harvey-amber/30 bg-harvey-amber/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-harvey-amber mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-harvey-amber">Ollama Engine Offline</p>
              <p className="text-xs text-harvey-muted">
                Start Ollama locally to power AI vector search and generation without cloud dependencies.
              </p>
              <div className="pt-1 space-y-1">
                {(health.instructions || []).map((step, i) => (
                  <code key={i} className="block text-[11px] bg-harvey-obsidian px-2.5 py-1 rounded text-harvey-ivory font-mono border border-harvey-borderSubtle">
                    {step}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Ledger */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-harvey-border flex items-center justify-between bg-harvey-surface/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-harvey-muted" />
            <h3 className="font-serif text-base text-harvey-ivory font-normal">Recent Agreement Repository</h3>
          </div>
          <Link to="/ma" className="text-xs text-harvey-ivory hover:underline flex items-center gap-1 font-medium">
            <span>Manage All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {documentsLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-harvey-muted space-y-2">
            <FileText className="w-8 h-8 mx-auto text-harvey-border" />
            <p className="font-serif text-sm text-harvey-ivory">No Agreements Uploaded Yet</p>
            <p className="text-xs text-harvey-muted max-w-sm mx-auto">
              Upload sample M&A contracts to immediately run automated risk extractions.
            </p>
            <div className="pt-2">
              <Link to="/ma" className="btn-secondary text-xs inline-flex">
                Upload First Contract
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-harvey-borderSubtle">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-harvey-surface/60 transition-colors">
                <div className="w-7 h-7 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-harvey-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-harvey-ivory truncate">{doc.original_name}</p>
                  <p className="text-[11px] text-harvey-muted">
                    {doc.page_count} Pages · {doc.chunk_count} Indexed Chunks · {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {doc.status === 'ready' && <span className="badge-low">Ready</span>}
                  {doc.status === 'processing' && (
                    <span className="flex items-center gap-1 text-[11px] text-harvey-muted">
                      <Loader2 className="w-3 h-3 animate-spin text-harvey-ivory" />
                      Indexing
                    </span>
                  )}
                  {doc.status === 'error' && <span className="badge-high">Error</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Practice Areas Grid */}
      <div className="space-y-3">
        <span className="section-title">Platform Practice Areas</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/ma" className="card p-5 hover:border-harvey-muted transition-all group flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface text-harvey-gold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-base text-harvey-ivory font-normal group-hover:underline">
                M&A Due Diligence Suite
              </h4>
              <p className="text-xs text-harvey-muted leading-relaxed">
                Automated deal term extraction, representations and warranties auditing, and liability matrices.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-harvey-ivory font-medium">
              <span>Open Suite</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <div className="card p-5 opacity-60 cursor-not-allowed flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded border border-harvey-borderSubtle flex items-center justify-center bg-harvey-surface text-harvey-muted">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-base text-harvey-ivory font-normal">
                Contract Intelligence
              </h4>
              <p className="text-xs text-harvey-muted leading-relaxed">
                Automated redlining, playbook alignment, and clause deviations across portfolios.
              </p>
            </div>
            <div className="pt-4">
              <span className="badge-unknown">Phase 2 Planned</span>
            </div>
          </div>

          <div className="card p-5 opacity-60 cursor-not-allowed flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded border border-harvey-borderSubtle flex items-center justify-center bg-harvey-surface text-harvey-muted">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-base text-harvey-ivory font-normal">
                Firm Knowledge Vault
              </h4>
              <p className="text-xs text-harvey-muted leading-relaxed">
                Enterprise multi-document repositories with semantic cross-matter synthesis.
              </p>
            </div>
            <div className="pt-4">
              <span className="badge-unknown">Phase 3 Planned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
