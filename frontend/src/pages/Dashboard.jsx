import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Layers,
  ShieldCheck,
  Building2,
  Search
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { healthApi } from '../lib/api'

export default function Dashboard() {
  const { documents, fetchDocuments, documentsLoading, setSelectedDocument } = useStore()
  const [health, setHealth] = useState(null)
  const [timeFilter, setTimeFilter] = useState('6 months')

  useEffect(() => {
    fetchDocuments()
    healthApi.check()
      .then(r => setHealth(r.data))
      .catch(() => setHealth({ status: 'degraded' }))
  }, [])

  const readyDocs = documents.filter(d => d.status === 'ready').length
  const processingDocs = documents.filter(d => d.status === 'processing').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-fade-in text-canvas-text">
      {/* ── Header Row matching Harvey Command Center ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-canvas-text font-normal tracking-tight">
            Firm Command Center
          </h2>
          <p className="text-xs text-canvas-textMuted mt-0.5">
            Real-time compliance analytics, due diligence pipelines, and local LLM performance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-canvas-border text-xs text-canvas-text shadow-card cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="font-medium text-xs">M&A Workflows</span>
          </div>

          <Link
            to="/reports"
            className="btn-secondary text-xs"
          >
            View all audits
          </Link>

          <Link
            to="/ma"
            className="btn-primary text-xs"
          >
            <span className="font-serif font-bold text-xs">A</span>
            <span>New Diligence</span>
          </Link>
        </div>
      </div>

      {/* ── Harvey Signature Recommendation Banner ──────────────────── */}
      <div className="card p-3.5 flex items-center justify-between bg-white border border-canvas-border">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-5 h-5 rounded bg-black text-white flex items-center justify-center font-serif text-xs font-bold flex-shrink-0">
            A
          </span>
          <span className="text-canvas-text font-medium">
            There are {documents.length > 0 ? documents.length : 3} contracts indexed in your local vault ready for immediate due diligence auditing.
          </span>
        </div>
        <Link to="/ma" className="text-xs font-medium text-black hover:underline flex items-center gap-1">
          <span>Review now</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── 4 Command Center Analytics Cards (from Screenshot 1) ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Due Diligence Throughput / Adoption */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif text-canvas-text font-normal">87.4%</span>
                <span className="text-xs font-semibold text-risk-low">↑ 12%</span>
              </div>
              <p className="text-xs text-canvas-textMuted mt-0.5">Automated Clause Extraction Rate</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
                6 months ▾
              </span>
              <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
                2026 ▾
              </span>
            </div>
          </div>

          {/* Minimalist chart curve SVG matching screenshot */}
          <div className="h-36 w-full pt-2 flex flex-col justify-end">
            <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#121212" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#121212" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,110 Q 100,105 180,90 T 320,40 T 400,10 L 400,120 L 0,120 Z"
                fill="url(#curveGradient)"
              />
              <path
                d="M 0,110 Q 100,105 180,90 T 320,40 T 400,10"
                fill="none"
                stroke="#121212"
                strokeWidth="1.75"
              />
              {/* Vertical tick lines */}
              {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={80 + Math.sin(x) * 20}
                  x2={x}
                  y2={120}
                  stroke="#e6e5e2"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] text-canvas-textLight pt-2 border-t border-canvas-border">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-canvas-textMuted pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span>Automated Extraction</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-300" />
              <span>Manual Baseline</span>
            </div>
          </div>
        </div>

        {/* Card 2: Legal Module Usage (Bar Chart from Screenshot) */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-serif text-canvas-text font-normal">Practice Usage</h3>
              <p className="text-xs text-canvas-textMuted">Percentage of workflows run by legal category</p>
            </div>
            <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
              This week ▾
            </span>
          </div>

          {/* Minimalist Bar Chart matching screenshot */}
          <div className="h-36 w-full flex items-end justify-between gap-3 px-2 pt-4">
            {[
              { label: 'M&A Diligence', val1: 75, val2: 85 },
              { label: 'Reps & Warranties', val1: 60, val2: 45 },
              { label: 'Indemnity Caps', val1: 50, val2: 52 },
              { label: 'MAC Clauses', val1: 48, val2: 50 },
              { label: 'Non-Competes', val1: 30, val2: 38 },
              { label: 'Closing Cond.', val1: 22, val2: 40 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-24">
                  <div
                    className="w-2.5 bg-neutral-900 rounded-t-sm transition-all"
                    style={{ height: `${col.val1}%` }}
                    title={`${col.label}: ${col.val1}%`}
                  />
                  <div
                    className="w-2.5 bg-neutral-300 rounded-t-sm transition-all"
                    style={{ height: `${col.val2}%` }}
                    title={`Peer benchmark: ${col.val2}%`}
                  />
                </div>
                <span className="text-[9px] text-canvas-textLight text-center truncate w-full">
                  {col.label.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-canvas-textMuted pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span>Your Organization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-300" />
              <span>Peer Benchmark</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Document Vault Contracts */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif text-canvas-text font-normal">{documents.length}</span>
                <span className="text-xs font-semibold text-risk-low">↑ 100% Local</span>
              </div>
              <p className="text-xs text-canvas-textMuted mt-0.5">Indexed Agreements in Airgapped Memory</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
                Weekly ▾
              </span>
              <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
                This week ▾
              </span>
            </div>
          </div>

          {/* Area fill curve */}
          <div className="h-36 w-full pt-2 flex flex-col justify-end">
            <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#121212" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#121212" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,115 C 100,110 150,90 220,70 C 290,50 350,20 400,10 L 400,120 L 0,120 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M 0,115 C 100,110 150,90 220,70 C 290,50 350,20 400,10"
                fill="none"
                stroke="#121212"
                strokeWidth="1.75"
              />
              {[30, 70, 110, 150, 190, 230, 270, 310, 350, 390].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={90 + Math.sin(x) * 15}
                  x2={x}
                  y2={120}
                  stroke="#e6e5e2"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] text-canvas-textLight pt-2 border-t border-canvas-border">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="text-[11px] text-canvas-textMuted">
            {readyDocs} ready for automated extraction · {processingDocs} actively indexing
          </div>
        </div>

        {/* Card 4: Top Reviewed Clause Categories (Horizontal Bars from Screenshot) */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-serif text-canvas-text font-normal">Critical Risk Exposure</h3>
              <p className="text-xs text-canvas-textMuted">Most frequently triggered risk categories</p>
            </div>
            <span className="px-2 py-1 rounded bg-canvas-bg border border-canvas-border text-canvas-text font-medium text-[11px]">
              Past month ▾
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { name: 'Indemnification Caps (< 20% deal value)', score: 92, count: '31 deals' },
              { name: 'Unilateral MAC Clause Exclusions', score: 81, count: '27 deals' },
              { name: 'Knowledge Qualifiers Gaps (No duty to inquire)', score: 65, count: '20 deals' },
              { name: 'Overly Broad Non-Compete Carve-outs', score: 54, count: '16 deals' },
              { name: 'Asymmetric Reverse Break Fees', score: 40, count: '12 deals' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-canvas-text font-medium">
                  <span className="truncate max-w-[280px]">{item.name}</span>
                  <span className="text-[11px] text-canvas-textLight font-mono">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-800 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-canvas-textMuted pt-1">
            Benchmark matches 100+ standard M&A transaction precedents.
          </div>
        </div>
      </div>

      {/* ── Recent Agreements Ledger (Matching Screenshot 2 Contract Intelligence) ── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-canvas-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-canvas-textMuted" />
            <h3 className="font-serif text-base text-canvas-text font-normal">Recent Agreement Diligence Ledger</h3>
          </div>
          <Link to="/ma" className="text-xs font-medium text-black hover:underline flex items-center gap-1">
            <span>Open Vault</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {documentsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-canvas-textMuted space-y-2">
            <FileText className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="font-serif text-sm text-canvas-text">No Contracts Evaluated</p>
            <p className="text-xs text-canvas-textMuted max-w-sm mx-auto">
              Upload a transaction agreement PDF to run automated clause analysis.
            </p>
            <div className="pt-2">
              <Link to="/ma" className="btn-primary text-xs inline-flex">
                Upload First Agreement
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-canvas-borderSubtle">
            {documents.slice(0, 5).map(doc => (
              <div
                key={doc.id}
                onClick={() => { setSelectedDocument(doc) }}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded border border-canvas-border flex items-center justify-center bg-canvas-bg flex-shrink-0">
                    <FileText className="w-4 h-4 text-canvas-text" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-canvas-text truncate">{doc.original_name}</p>
                    <p className="text-[11px] text-canvas-textMuted mt-0.5">
                      {doc.page_count} Pages · {doc.chunk_count} Indexed Chunks · {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {doc.status === 'ready' && <span className="badge-low">Ready</span>}
                  {doc.status === 'processing' && (
                    <span className="flex items-center gap-1 text-[11px] text-canvas-textMuted">
                      <Loader2 className="w-3 h-3 animate-spin text-black" />
                      Indexing
                    </span>
                  )}
                  {doc.status === 'error' && <span className="badge-high">Error</span>}

                  <Link to="/ma" className="btn-secondary text-[11px] py-1 px-2.5">
                    Open Diligence →
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
