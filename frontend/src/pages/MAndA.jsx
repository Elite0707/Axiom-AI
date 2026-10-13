import { useEffect, useState } from 'react'
import {
  Briefcase, FileText, Trash2, PlayCircle, Loader2,
  Users, DollarSign, Calendar, Scale, AlertTriangle,
  ChevronRight, CheckSquare, List, MessageSquare, Shield,
  ArrowRight, Sparkles, Building2, Tag, CheckCircle2, ChevronDown
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { documentsApi, analysisApi } from '../lib/api'
import DocumentUpload from '../components/DocumentUpload'
import RiskFlags from '../components/RiskFlags'
import ChatInterface from '../components/ChatInterface'
import clsx from 'clsx'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Briefcase },
  { id: 'parties', label: 'Parties & Terms', icon: Users },
  { id: 'clauses', label: 'Key Clauses', icon: List },
  { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
  { id: 'chat', label: 'Ask Axiom', icon: MessageSquare },
]

function TermRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-canvas-borderSubtle last:border-0 text-xs">
      <span className="text-canvas-textMuted text-[11px] uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-canvas-text text-right font-medium max-w-sm truncate">{value}</span>
    </div>
  )
}

function ClauseCard({ title, items, icon: Icon }) {
  if (!items?.length) return null
  return (
    <div className="card p-5 space-y-3 bg-white">
      <div className="flex items-center justify-between pb-2.5 border-b border-canvas-borderSubtle">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-canvas-textMuted" />
          <h4 className="font-serif text-base text-canvas-text font-normal">{title}</h4>
        </div>
        <span className="text-[11px] font-mono text-canvas-textMuted bg-canvas-bg px-2 py-0.5 rounded border border-canvas-border">
          {items.length} items
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-canvas-text leading-relaxed">
            <span className="text-neutral-400 font-mono text-xs mt-0.5 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MAndA() {
  const {
    documents, fetchDocuments, documentsLoading, selectedDocument, setSelectedDocument,
    removeDocument, currentAnalysis, startAnalysis, setCurrentAnalysis
  } = useStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDeleteDoc = async (doc) => {
    if (!confirm(`Delete "${doc.original_name}"?`)) return
    await documentsApi.delete(doc.id).catch(() => {})
    removeDocument(doc.id)
    if (selectedDocument?.id === doc.id) {
      setSelectedDocument(null)
      setCurrentAnalysis(null)
    }
  }

  const handleSelectDoc = async (doc) => {
    setSelectedDocument(doc)
    setCurrentAnalysis(null)
    setActiveTab('overview')
    setAnalysisError(null)

    try {
      const { data } = await analysisApi.getForDocument(doc.id)
      if (data?.length > 0 && data[0].status === 'done') {
        setCurrentAnalysis(data[0])
      }
    } catch {}
  }

  const handleRunAnalysis = async () => {
    if (!selectedDocument) return
    setAnalysisLoading(true)
    setAnalysisError(null)
    setCurrentAnalysis(null)
    try {
      await startAnalysis(selectedDocument.id)
    } catch (err) {
      setAnalysisError(err.response?.data?.detail || 'Analysis pipeline encountered an error.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const result = currentAnalysis?.result

  const riskBadgeClass = {
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low'
  }[result?.overall_risk_level] || 'badge-unknown'

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7.5rem)] max-w-7xl mx-auto font-sans text-canvas-text">
      {/* ── Left Panel: Vault & Document Selection Ledger ───────────── */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <DocumentUpload module="ma" onUploaded={handleSelectDoc} />

        <div className="card flex-1 overflow-hidden flex flex-col bg-white">
          <div className="px-4 py-3 border-b border-canvas-border flex items-center justify-between bg-canvas-bg">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-canvas-textMuted" />
              <span className="font-serif text-sm font-normal text-canvas-text">Contract Vault</span>
            </div>
            <span className="text-[10px] font-mono text-canvas-textMuted bg-white px-2 py-0.5 rounded border border-canvas-border">
              {documents.length} docs
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {documentsLoading ? (
              <div className="space-y-2 p-1">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded" />)}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-canvas-textMuted px-4 space-y-1.5">
                <FileText className="w-6 h-6 mx-auto text-canvas-border" />
                <p className="font-serif text-xs text-canvas-text">No Contracts Indexed</p>
                <p className="text-[11px] text-canvas-textLight">Upload an agreement above to begin.</p>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => doc.status === 'ready' && handleSelectDoc(doc)}
                  className={clsx(
                    'group flex items-start gap-2.5 p-3 rounded-lg transition-all select-none',
                    doc.status === 'ready' ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-not-allowed opacity-50',
                    selectedDocument?.id === doc.id
                      ? 'bg-neutral-100 border border-neutral-300 shadow-sm'
                      : 'border border-transparent'
                  )}
                >
                  <FileText className={clsx(
                    'w-4 h-4 mt-0.5 flex-shrink-0 transition-colors',
                    selectedDocument?.id === doc.id ? 'text-black' : 'text-canvas-textMuted'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-canvas-text truncate">{doc.original_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.status === 'ready' && <span className="badge-low text-[9px]">Ready</span>}
                      {doc.status === 'processing' && (
                        <span className="flex items-center gap-1 text-[9px] text-canvas-textMuted font-medium">
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-black" />
                          Indexing
                        </span>
                      )}
                      {doc.status === 'error' && <span className="badge-high text-[9px]">Error</span>}
                      <span className="text-[10px] text-canvas-textMuted font-mono">{doc.page_count}p</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc) }}
                    className="opacity-0 group-hover:opacity-100 text-canvas-textMuted hover:text-risk-high transition-all p-1"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Due Diligence Console (Matching Screenshot 2) ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!selectedDocument ? (
          <div className="flex-1 card flex flex-col items-center justify-center text-center p-12 bg-white">
            <Briefcase className="w-12 h-12 mb-3 text-neutral-300" />
            <h3 className="font-serif text-xl font-normal text-canvas-text mb-1">Select Agreement to Audit</h3>
            <p className="text-xs text-canvas-textMuted max-w-md">
              Choose an agreement from your Contract Vault or upload a new transaction PDF to execute automated due diligence.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Matter Header Banner from Screenshot 2 */}
            <div className="card p-5 mb-4 bg-white space-y-3 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-canvas-textMuted font-mono">
                    <span>Matter Ref #: M&A-{(selectedDocument.id || '2026').slice(0, 8).toUpperCase()}</span>
                    <span>·</span>
                    <span className="text-black font-semibold">Active Review</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-serif text-xs font-bold">
                      M
                    </span>
                    <h2 className="font-serif text-xl text-canvas-text font-normal truncate">
                      {selectedDocument.original_name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {currentAnalysis?.status === 'running' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-100 border border-neutral-300 text-xs text-canvas-text">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span className="font-medium">Auditing clauses...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleRunAnalysis}
                      disabled={analysisLoading || currentAnalysis?.status === 'running'}
                      className="btn-primary"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{result ? 'Re-Audit Contract' : 'Run Due Diligence'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Attached Document Pill & Overview Tags (Matching Screenshot 2) */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-canvas-borderSubtle">
                <span className="text-[11px] text-canvas-textMuted font-medium">Source:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas-bg border border-canvas-border text-xs text-canvas-text font-medium shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="truncate max-w-xs">{selectedDocument.original_name}</span>
                  <span className="font-mono text-[10px] text-canvas-textMuted font-normal">({selectedDocument.page_count}p)</span>
                </span>

                {result && (
                  <span className={clsx(riskBadgeClass, 'ml-auto text-[10px]')}>
                    {result.overall_risk_level} RISK LEVEL
                  </span>
                )}
              </div>
            </div>

            {analysisError && (
              <div className="flex items-center gap-2 bg-risk-highBg border border-risk-highBorder rounded-lg p-3 mb-4 text-risk-high text-xs flex-shrink-0">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Clean White Tabs Bar (Matching Screenshot 2) */}
            <div className="flex gap-2 border-b border-canvas-border mb-4 flex-shrink-0 overflow-x-auto select-none bg-canvas-bg pb-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-md transition-all whitespace-nowrap',
                    activeTab === id
                      ? 'bg-white text-black font-semibold border-t-2 border-black shadow-sm'
                      : 'text-canvas-textMuted hover:text-black hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {id === 'risks' && result?.risk_flags?.length > 0 && (
                    <span className={clsx(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ml-1',
                      result.overall_risk_level === 'HIGH' ? 'bg-risk-highBg text-risk-high' :
                        result.overall_risk_level === 'MEDIUM' ? 'bg-risk-medBg text-risk-med' :
                          'bg-risk-lowBg text-risk-low'
                    )}>
                      {result.risk_flags.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* ── OVERVIEW TAB ─────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-fade-in">
                  {!result ? (
                    currentAnalysis?.status === 'running' ? (
                      <div className="card p-12 flex flex-col items-center justify-center text-center gap-3 bg-white">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                        <h4 className="font-serif text-lg text-canvas-text font-normal">Extracting Deal Architecture</h4>
                        <p className="text-xs text-canvas-textMuted max-w-md">
                          Evaluating representations, warranties, indemnification caps, MAC clauses, and termination covenants with local LLM.
                        </p>
                      </div>
                    ) : (
                      <div className="card p-12 flex flex-col items-center justify-center text-center text-canvas-textMuted gap-3 bg-white">
                        <PlayCircle className="w-10 h-10 text-neutral-300" />
                        <div>
                          <h4 className="font-serif text-base text-canvas-text font-normal mb-1">Diligence Audit Pending</h4>
                          <p className="text-xs text-canvas-textMuted max-w-sm">
                            Click "Run Due Diligence" above to trigger automated clause synthesis.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Executive Summary in Clean White Card */}
                      {result.executive_summary && (
                        <div className="card p-6 space-y-3 bg-white">
                          <div className="flex items-center gap-2 pb-2.5 border-b border-canvas-borderSubtle">
                            <Briefcase className="w-4 h-4 text-black" />
                            <h3 className="font-serif text-lg font-normal text-canvas-text">Executive Diligence Summary</h3>
                          </div>
                          <p className="text-xs text-canvas-text leading-relaxed whitespace-pre-line font-sans">
                            {result.executive_summary}
                          </p>
                        </div>
                      )}

                      {/* Transaction Parameters Ledger */}
                      <div className="card p-6 space-y-3 bg-white">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-canvas-borderSubtle">
                          <DollarSign className="w-4 h-4 text-black" />
                          <h3 className="font-serif text-lg font-normal text-canvas-text">Transaction Parameters</h3>
                        </div>
                        <div className="divide-y divide-canvas-borderSubtle">
                          <TermRow label="Deal Title" value={result.deal_title} />
                          <TermRow label="Deal Type" value={result.deal_type} />
                          <TermRow label="Consideration" value={result.deal_value} />
                          <TermRow label="Governing Law" value={result.governing_law} />
                          <TermRow label="Jurisdiction" value={result.jurisdiction} />
                          <TermRow label="Signing Date" value={result.signing_date} />
                          <TermRow label="Target Closing" value={result.closing_date} />
                        </div>
                      </div>

                      {/* Strategic Recommendations */}
                      {result.key_recommendations?.length > 0 && (
                        <div className="card p-6 space-y-3 bg-white">
                          <div className="flex items-center gap-2 pb-2.5 border-b border-canvas-borderSubtle">
                            <CheckSquare className="w-4 h-4 text-risk-low" />
                            <h3 className="font-serif text-lg font-normal text-canvas-text">Strategic Counsel Recommendations</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {result.key_recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-3 text-xs text-canvas-text leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                                  {i + 1}
                                </span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── PARTIES TAB ──────────────────────────────────── */}
              {activeTab === 'parties' && result && (
                <div className="space-y-5 animate-fade-in">
                  <div className="card p-6 space-y-4 bg-white">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-canvas-borderSubtle">
                      <Users className="w-4 h-4 text-black" />
                      <h3 className="font-serif text-lg font-normal text-canvas-text">Contracting Entities & Roles</h3>
                    </div>

                    {result.parties?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {result.parties.map((party, i) => (
                          <div key={i} className="p-4 rounded-lg bg-canvas-bg border border-canvas-border flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center font-serif text-sm font-semibold flex-shrink-0">
                              {party.name?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-canvas-text truncate">{party.name}</p>
                              <p className="text-[11px] text-canvas-textMuted uppercase tracking-wider font-semibold mt-0.5">{party.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-canvas-textMuted">No party entities extracted.</p>
                    )}
                  </div>

                  <div className="card p-6 space-y-3 bg-white">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-canvas-borderSubtle">
                      <Scale className="w-4 h-4 text-black" />
                      <h3 className="font-serif text-lg font-normal text-canvas-text">Legal Framework</h3>
                    </div>
                    <div className="divide-y divide-canvas-borderSubtle">
                      <TermRow label="Governing Law" value={result.governing_law} />
                      <TermRow label="Jurisdiction" value={result.jurisdiction} />
                      <TermRow label="Consideration" value={result.deal_value} />
                      <TermRow label="Signing Date" value={result.signing_date} />
                      <TermRow label="Closing Date" value={result.closing_date} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── CLAUSES TAB ──────────────────────────────────── */}
              {activeTab === 'clauses' && result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                  <ClauseCard title="Conditions Precedent" items={result.conditions_precedent} icon={CheckSquare} />
                  <ClauseCard title="Representations & Warranties" items={result.representations_warranties} icon={Scale} />
                  <ClauseCard title="Indemnification & Caps" items={result.indemnification_provisions} icon={AlertTriangle} />
                  <ClauseCard title="Non-Compete Covenants" items={result.non_compete_clauses} icon={Shield} />
                  <ClauseCard title="Material Adverse Change (MAC)" items={result.mac_clauses} icon={AlertTriangle} />
                  <ClauseCard title="Termination Rights" items={result.termination_rights} icon={List} />
                </div>
              )}

              {/* ── RISKS TAB ────────────────────────────────────── */}
              {activeTab === 'risks' && (
                <div className="animate-fade-in">
                  {result ? (
                    <RiskFlags
                      riskFlags={result.risk_flags || []}
                      overallRisk={result.overall_risk_level || 'UNKNOWN'}
                    />
                  ) : (
                    <div className="card p-12 text-center text-canvas-textMuted space-y-2 bg-white">
                      <AlertTriangle className="w-8 h-8 mx-auto text-neutral-300" />
                      <p className="font-serif text-sm text-canvas-text">Risk Matrix Pending</p>
                      <p className="text-xs text-canvas-textMuted">Run analysis to generate the liability ledger.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── CHAT TAB ─────────────────────────────────────── */}
              {activeTab === 'chat' && (
                <div className="card overflow-hidden h-[560px] animate-fade-in bg-white">
                  <ChatInterface
                    documentId={selectedDocument.id}
                    documentName={selectedDocument.original_name}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
