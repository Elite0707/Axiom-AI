import { useState, useEffect } from 'react'
import { FileDiff, Copy, Check, Sparkles, RefreshCw, Eye, ShieldCheck, ChevronRight } from 'lucide-react'
import { analysisApi } from '../lib/api'
import clsx from 'clsx'

const PRESET_CLAUSES = [
  { id: '4.3', label: 'Clause 4.3 — Seller Liability Cap (15% vs 25% + Fraud Carve-out)' },
  { id: '6.2', label: 'Clause 6.2 — Acquirer Indemnification (Reciprocal Cap & Pre-Closing Carve-out)' },
  { id: 'mac', label: 'Clause 7.1 — Material Adverse Change (Disproportionate Impact)' },
  { id: 'non-compete', label: 'Clause 8.1 — Seller Non-Compete (Scope & Duration)' }
]

export default function RedlineStudio({ documentId, initialClause = '4.3' }) {
  const [selectedClause, setSelectedClause] = useState(initialClause)
  const [perspective, setPerspective] = useState('buyer')
  const [redlineData, setRedlineData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('tracked') // 'tracked' | 'clean' | 'split'
  const [copied, setCopied] = useState(false)

  const fetchRedline = async (clauseKey, persp) => {
    setLoading(true)
    try {
      const { data } = await analysisApi.getRedline({
        document_id: documentId,
        clause_query: clauseKey,
        perspective: persp
      })
      setRedlineData(data)
    } catch (err) {
      console.error("Failed to load redline:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedline(selectedClause, perspective)
  }, [selectedClause, perspective, documentId])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render markdown diff with visual styling
  const renderFormattedDiff = (markdown) => {
    if (!markdown) return null

    // Split text by tokens ~~...~~ and **...**
    const parts = []
    let cursor = 0
    const regex = /(~~.*?~~|\*\*.*?\*\*)/gs
    let match

    while ((match = regex.exec(markdown)) !== null) {
      if (match.index > cursor) {
        parts.push({
          type: 'text',
          content: markdown.substring(cursor, match.index)
        })
      }

      const token = match[0]
      if (token.startsWith('~~') && token.endsWith('~~')) {
        parts.push({
          type: 'deletion',
          content: token.slice(2, -2)
        })
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push({
          type: 'addition',
          content: token.slice(2, -2)
        })
      }
      cursor = regex.lastIndex
    }

    if (cursor < markdown.length) {
      parts.push({
        type: 'text',
        content: markdown.substring(cursor)
      })
    }

    return (
      <div className="font-serif text-sm leading-relaxed text-canvas-text select-text whitespace-pre-wrap">
        {parts.map((p, idx) => {
          if (p.type === 'deletion') {
            return (
              <span
                key={idx}
                className="line-through bg-red-100/70 text-red-700 px-1 py-0.5 rounded mx-0.5 border border-red-200"
                title="Proposed Deletion"
              >
                {p.content}
              </span>
            )
          }
          if (p.type === 'addition') {
            return (
              <span
                key={idx}
                className="font-semibold bg-emerald-100/70 text-emerald-900 px-1 py-0.5 rounded mx-0.5 border-b-2 border-emerald-600"
                title="Proposed Addition"
              >
                {p.content}
              </span>
            )
          }
          return <span key={idx}>{p.content}</span>
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Controls Header */}
      <div className="card p-4 bg-white border border-canvas-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-black" />
            <span className="font-serif text-base text-canvas-text font-normal">Clause Redline Studio</span>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden md:block" />

          {/* Preset Clause Picker */}
          <select
            value={selectedClause}
            onChange={(e) => setSelectedClause(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1.5 text-canvas-text font-medium focus:outline-none focus:border-black"
          >
            {PRESET_CLAUSES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Perspective and View Mode toggles */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => setPerspective('buyer')}
              className={clsx(
                'px-2.5 py-1 rounded-md transition-all font-medium',
                perspective === 'buyer' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              )}
            >
              Buyer Redline
            </button>
            <button
              onClick={() => setPerspective('seller')}
              className={clsx(
                'px-2.5 py-1 rounded-md transition-all font-medium',
                perspective === 'seller' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              )}
            >
              Seller Redline
            </button>
          </div>

          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => setViewMode('tracked')}
              className={clsx(
                'px-2.5 py-1 rounded-md transition-all font-medium',
                viewMode === 'tracked' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
              )}
            >
              Tracked
            </button>
            <button
              onClick={() => setViewMode('clean')}
              className={clsx(
                'px-2.5 py-1 rounded-md transition-all font-medium',
                viewMode === 'clean' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
              )}
            >
              Clean
            </button>
          </div>
        </div>
      </div>

      {/* Main Redline Display Card */}
      {redlineData && (
        <div className="space-y-4">
          <div className="card p-6 bg-white border border-canvas-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                  Target Provision
                </span>
                <h3 className="font-serif text-lg font-normal text-canvas-text mt-0.5">
                  {redlineData.clause_name}
                </h3>
              </div>

              <button
                onClick={() => handleCopy(viewMode === 'clean' ? redlineData.clean_revised : redlineData.redline_markdown)}
                className="btn-secondary text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Redline!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            {/* Redline Text Area */}
            <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/90 leading-relaxed min-h-[140px]">
              {viewMode === 'tracked' ? (
                renderFormattedDiff(redlineData.redline_markdown)
              ) : (
                <p className="font-serif text-sm leading-relaxed text-canvas-text whitespace-pre-wrap select-text">
                  {redlineData.clean_revised}
                </p>
              )}
            </div>

            {/* Legend */}
            {viewMode === 'tracked' && (
              <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                  <span>Strikethrough: Proposed deletion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
                  <span>Underlined bold: Proposed addition</span>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Rationale & Market Precedent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 bg-white border border-canvas-border space-y-2 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                Drafting Rationale
              </span>
              <p className="text-xs text-canvas-text leading-relaxed">
                {redlineData.drafting_rationale}
              </p>
            </div>

            <div className="card p-5 bg-white border border-canvas-border space-y-2 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                Market Benchmark
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed font-mono">
                {redlineData.market_standard}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
