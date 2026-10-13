import { useEffect, useState } from 'react'
import {
  Briefcase, FileText, Trash2, PlayCircle, Loader2,
  Users, DollarSign, Calendar, Scale, AlertTriangle,
  ChevronRight, CheckSquare, List, MessageSquare, Shield,
  ArrowRight, Sparkles, Building2
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { documentsApi, analysisApi } from '../lib/api'
import DocumentUpload from '../components/DocumentUpload'
import RiskFlags from '../components/RiskFlags'
import ChatInterface from '../components/ChatInterface'
import clsx from 'clsx'

const TABS = [
  { id: 'overview', label: 'Executive Summary', icon: Briefcase },
  { id: 'parties', label: 'Parties & Terms', icon: Users },
  { id: 'clauses', label: 'Key Clauses', icon: List },
  { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
  { id: 'chat', label: 'Legal Assistant', icon: MessageSquare },
]

function TermRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-harvey-borderSubtle last:border-0 text-xs">
      <span className="text-harvey-muted text-[11px] uppercase tracking-wider font-medium">{label}</span>
      <span className="text-harvey-ivory text-right font-medium max-w-sm truncate">{value}</span>
    </div>
  )
}

function ClauseCard({ title, items, icon: Icon }) {
  if (!items?.length) return null
  return (
    <div className="card p-4 space-y-3 bg-harvey-charcoal">
      <div className="flex items-center justify-between pb-2 border-b border-harvey-borderSubtle">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-harvey-muted" />
          <h4 className="font-serif text-sm text-harvey-ivory font-normal">{title}</h4>
        </div>
        <span className="text-[10px] font-mono text-harvey-muted bg-harvey-surface px-1.5 py-0.5 rounded border border-harvey-borderSubtle">
          {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-harvey-textDim leading-relaxed">
            <span className="text-harvey-muted font-mono text-[10px] mt-0.5 flex-shrink-0">•</span>
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
    <div className="flex gap-6 h-[calc(100vh-7rem)] max-w-[1600px] mx-auto font-sans">
      {/* ── Left Ledger: Contract Vault ───────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <DocumentUpload module="ma" onUploaded={handleSelectDoc} />

        <div className="card flex-1 overflow-hidden flex flex-col bg-harvey-charcoal">
          <div className="px-4 py-3 border-b border-harvey-border flex items-center justify-between bg-harvey-surface/40">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-harvey-muted" />
              <span className="font-serif text-sm font-normal text-harvey-ivory">Contract Vault</span>
            </div>
            <span className="text-[10px] font-mono text-harvey-muted bg-harvey-surface px-1.5 py-0.5 rounded border border-harvey-borderSubtle">
              {documents.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {documentsLoading ? (
              <div className="space-y-2 p-1">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded" />)}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-harvey-muted px-4 space-y-1.5">
                <FileText className="w-6 h-6 mx-auto text-harvey-border" />
                <p className="font-serif text-xs text-harvey-ivory">No Agreements Found</p>
                <p className="text-[11px] text-harvey-muted">Drop a contract PDF above to begin.</p>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => doc.status === 'ready' && handleSelectDoc(doc)}
                  className={clsx(
                    'group flex items-start gap-2.5 p-2.5 rounded transition-all select-none',
                    doc.status === 'ready' ? 'cursor-pointer hover:bg-harvey-surface' : 'cursor-not-allowed opacity-50',
                    selectedDocument?.id === doc.id
                      ? 'bg-harvey-surface border border-harvey-border shadow-sm'
                      : 'border border-transparent'
                  )}
                >
                  <FileText className={clsx(
                    'w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-colors',
                    selectedDocument?.id === doc.id ? 'text-harvey-ivory' : 'text-harvey-muted'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-harvey-ivory truncate">{doc.original_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {doc.status === 'ready' && <span className="badge-low text-[9px]">Ready</span>}
                      {doc.status === 'processing' && (
                        <span className="flex items-center gap-1 text-[9px] text-harvey-muted">
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-harvey-ivory" />
                          Indexing
                        </span>
                      )}
                      {doc.status === 'error' && <span className="badge-high text-[9px]">Error</span>}
                      <span className="text-[10px] text-harvey-muted font-mono">{doc.page_count}p</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc) }}
                    className="opacity-0 group-hover:opacity-100 text-harvey-muted hover:text-harvey-coral transition-all p-1"
                    title="Remove from vault"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Due Diligence Analysis Console ───────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!selectedDocument ? (
          <div className="flex-1 card flex flex-col items-center justify-center text-center p-8 bg-harvey-charcoal">
            <Briefcase className="w-10 h-10 mb-3 text-harvey-border" />
            <h3 className="font-serif text-lg font-normal text-harvey-ivory mb-1">Select Agreement to Audit</h3>
            <p className="text-xs text-harvey-muted max-w-sm">
              Choose an agreement from your Contract Vault or upload a new M&A document to execute automated legal diligence.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Agreement Console Header */}
            <div className="card px-5 py-3.5 mb-3 flex items-center justify-between gap-4 flex-shrink-0 bg-harvey-charcoal">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0">
                  <FileText className="w-4 h-4 text-harvey-muted" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-base text-harvey-ivory font-normal truncate">
                    {selectedDocument.original_name}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-harvey-muted">
                    <span className="font-mono">{selectedDocument.page_count} Pages</span>
                    <span>·</span>
                    <span className="font-mono">{selectedDocument.chunk_count} Chunks</span>
                    {result && (
                      <>
                        <span>·</span>
                        <span className={riskBadgeClass}>{result.overall_risk_level} RISK</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {currentAnalysis?.status === 'running' ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-harvey-surface border border-harvey-border text-xs text-harvey-ivory">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing clauses...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading || currentAnalysis?.status === 'running'}
                    className="btn-primary"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{result ? 'Re-Audit Contract' : 'Run Due Diligence'}</span>
                  </button>
                )}
              </div>
            </div>

            {analysisError && (
              <div className="flex items-center gap-2 bg-harvey-coral/10 border border-harvey-coral/30 rounded p-3 mb-3 text-harvey-coral text-xs flex-shrink-0">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Editorial Tabs */}
            <div className="flex gap-1 border-b border-harvey-border mb-3 flex-shrink-0 overflow-x-auto select-none">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap',
                    activeTab === id
                      ? 'border-harvey-ivory text-harvey-ivory'
                      : 'border-transparent text-harvey-muted hover:text-harvey-cream hover:border-harvey-border'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {id === 'risks' && result?.risk_flags?.length > 0 && (
                    <span className={clsx(
                      'text-[9px] font-mono px-1.5 py-0.2 rounded font-medium',
                      result.overall_risk_level === 'HIGH' ? 'bg-harvey-coral/20 text-harvey-coral' :
                        result.overall_risk_level === 'MEDIUM' ? 'bg-harvey-amber/20 text-harvey-amber' :
                          'bg-harvey-emerald/20 text-harvey-emerald'
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
                <div className="space-y-4 animate-fade-in">
                  {!result ? (
                    currentAnalysis?.status === 'running' ? (
                      <div className="card p-12 flex flex-col items-center justify-center text-center gap-3 bg-harvey-charcoal">
                        <Loader2 className="w-8 h-8 text-harvey-ivory animate-spin" />
                        <h4 className="font-serif text-base text-harvey-ivory font-normal">Extracting Deal Architecture</h4>
                        <p className="text-xs text-harvey-muted max-w-sm">
                          Evaluating representations, warranties, indemnity caps, and termination rights with local LLM.
                        </p>
                      </div>
                    ) : (
                      <div className="card p-12 flex flex-col items-center justify-center text-center text-harvey-muted gap-3 bg-harvey-charcoal">
                        <PlayCircle className="w-10 h-10 text-harvey-border" />
                        <div>
                          <h4 className="font-serif text-base text-harvey-ivory font-normal mb-1">Diligence Pending</h4>
                          <p className="text-xs text-harvey-muted max-w-sm">
                            Click "Run Due Diligence" above to trigger automated clause synthesis.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Executive Summary Card */}
                      {result.executive_summary && (
                        <div className="card p-5 space-y-2.5 bg-harvey-charcoal">
                          <div className="flex items-center gap-2 pb-2 border-b border-harvey-borderSubtle">
                            <Briefcase className="w-3.5 h-3.5 text-harvey-gold" />
                            <h3 className="font-serif text-base font-normal text-harvey-ivory">Executive Diligence Summary</h3>
                          </div>
                          <p className="text-xs text-harvey-cream leading-relaxed whitespace-pre-line font-sans">
                            {result.executive_summary}
                          </p>
                        </div>
                      )}

                      {/* Transaction Parameters */}
                      <div className="card p-5 space-y-3 bg-harvey-charcoal">
                        <div className="flex items-center gap-2 pb-2 border-b border-harvey-borderSubtle">
                          <DollarSign className="w-3.5 h-3.5 text-harvey-gold" />
                          <h3 className="font-serif text-base font-normal text-harvey-ivory">Transaction Structure</h3>
                        </div>
                        <div className="divide-y divide-harvey-borderSubtle">
                          <TermRow label="Deal Title" value={result.deal_title} />
                          <TermRow label="Transaction Type" value={result.deal_type} />
                          <TermRow label="Consideration" value={result.deal_value} />
                          <TermRow label="Governing Law" value={result.governing_law} />
                          <TermRow label="Jurisdiction" value={result.jurisdiction} />
                          <TermRow label="Execution Date" value={result.signing_date} />
                          <TermRow label="Target Closing" value={result.closing_date} />
                        </div>
                      </div>

                      {/* Recommendations */}
                      {result.key_recommendations?.length > 0 && (
                        <div className="card p-5 space-y-3 bg-harvey-charcoal">
                          <div className="flex items-center gap-2 pb-2 border-b border-harvey-borderSubtle">
                            <CheckSquare className="w-3.5 h-3.5 text-harvey-emerald" />
                            <h3 className="font-serif text-base font-normal text-harvey-ivory">Strategic Counsel Recommendations</h3>
                          </div>
                          <ul className="space-y-2">
                            {result.key_recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-harvey-textDim leading-relaxed">
                                <span className="w-4 h-4 rounded bg-harvey-surface border border-harvey-border text-harvey-ivory text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
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
                <div className="space-y-4 animate-fade-in">
                  <div className="card p-5 space-y-4 bg-harvey-charcoal">
                    <div className="flex items-center gap-2 pb-2 border-b border-harvey-borderSubtle">
                      <Users className="w-3.5 h-3.5 text-harvey-muted" />
                      <h3 className="font-serif text-base font-normal text-harvey-ivory">Contracting Entities & Roles</h3>
                    </div>

                    {result.parties?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.parties.map((party, i) => (
                          <div key={i} className="p-3 rounded bg-harvey-surface border border-harvey-border flex items-center gap-3">
                            <div className="w-7 h-7 rounded border border-harvey-borderSubtle bg-harvey-charcoal flex items-center justify-center font-serif text-xs text-harvey-ivory">
                              {party.name?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-harvey-ivory truncate">{party.name}</p>
                              <p className="text-[10px] text-harvey-muted uppercase tracking-wider font-mono">{party.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-harvey-muted">No explicit party roles detected in excerpts.</p>
                    )}
                  </div>

                  <div className="card p-5 space-y-3 bg-harvey-charcoal">
                    <div className="flex items-center gap-2 pb-2 border-b border-harvey-borderSubtle">
                      <Scale className="w-3.5 h-3.5 text-harvey-muted" />
                      <h3 className="font-serif text-base font-normal text-harvey-ivory">Core Legal Foundations</h3>
                    </div>
                    <div className="divide-y divide-harvey-borderSubtle">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <ClauseCard title="Conditions Precedent" items={result.conditions_precedent} icon={CheckSquare} />
                  <ClauseCard title="Representations & Warranties" items={result.representations_warranties} icon={Scale} />
                  <ClauseCard title="Indemnification & Caps" items={result.indemnification_provisions} icon={AlertTriangle} />
                  <ClauseCard title="Non-Compete & Restrictive Covenants" items={result.non_compete_clauses} icon={Shield} />
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
                    <div className="card p-12 text-center text-harvey-muted space-y-2 bg-harvey-charcoal">
                      <AlertTriangle className="w-8 h-8 mx-auto text-harvey-border" />
                      <p className="font-serif text-sm text-harvey-ivory">Risk Assessment Pending</p>
                      <p className="text-xs text-harvey-muted">Run analysis to generate the liability ledger.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── CHAT TAB ─────────────────────────────────────── */}
              {activeTab === 'chat' && (
                <div className="card overflow-hidden h-[540px] animate-fade-in">
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
