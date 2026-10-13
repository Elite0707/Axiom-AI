import { useEffect, useState } from 'react'
import {
  Briefcase, FileText, Trash2, PlayCircle, Loader2,
  Users, DollarSign, Calendar, Scale, AlertTriangle,
  ChevronRight, CheckSquare, List, MessageSquare, Shield,
  ArrowRight, Sparkles, Building2, Tag, CheckCircle2, ChevronDown,
  FileDiff, ScrollText
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { documentsApi, analysisApi } from '../lib/api'
import DocumentUpload from '../components/DocumentUpload'
import RiskFlags from '../components/RiskFlags'
import ChatInterface from '../components/ChatInterface'
import AsymmetryDetector from '../components/AsymmetryDetector'
import RedlineStudio from '../components/RedlineStudio'
import NegotiationMemo from '../components/NegotiationMemo'
import clsx from 'clsx'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Briefcase },
  { id: 'asymmetries', label: 'Clause Asymmetries', icon: Scale },
  { id: 'redline', label: 'Redline Studio', icon: FileDiff },
  { id: 'memo', label: 'Negotiation Memo', icon: ScrollText },
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
  const [redlineClause, setRedlineClause] = useState('4.3')

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

  const handleJumpToRedline = (clauseName) => {
    if (clauseName && clauseName.includes('6.2')) {
      setRedlineClause('6.2')
    } else if (clauseName && clauseName.toLowerCase().includes('mac')) {
      setRedlineClause('mac')
    } else if (clauseName && clauseName.toLowerCase().includes('compete')) {
      setRedlineClause('non-compete')
    } else {
      setRedlineClause('4.3')
    }
    setActiveTab('redline')
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
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        <DocumentUpload module="ma" onUploaded={(doc) => handleSelectDoc(doc)} />

        <div className="card p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="section-title">Indexed Contracts ({documents.length})</span>
            {documentsLoading && <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />}
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-25rem)] overflow-y-auto pr-0.5">
            {documents.map(doc => {
              const isSelected = selectedDocument?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={clsx(
                    'p-3 rounded-lg cursor-pointer transition-all border text-xs group relative',
                    isSelected
                      ? 'bg-neutral-100/80 border-black text-black font-medium shadow-xs'
                      : 'bg-white border-canvas-border hover:bg-neutral-50 hover:border-neutral-300 text-canvas-text'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className={clsx('w-3.5 h-3.5 flex-shrink-0', isSelected ? 'text-black' : 'text-neutral-400')} />
                      <p className="font-medium truncate">{doc.original_name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc); }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5"
                      title="Delete contract"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-canvas-textMuted font-mono">
                    <span>{doc.page_count} pages</span>
                    <span>·</span>
                    <span>{doc.chunk_count} clauses</span>
                    <span>·</span>
                    <span className={clsx(
                      doc.status === 'ready' ? 'text-emerald-700' :
                        doc.status === 'processing' ? 'text-amber-700' : 'text-red-700'
                    )}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              )
            })}

            {documents.length === 0 && !documentsLoading && (
              <div className="text-center py-8 text-neutral-400">
                <FileText className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <p className="text-xs">No documents uploaded yet</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Upload a PDF or DOCX to begin diligence</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Diligence Review Console ────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selectedDocument ? (
          <div className="card flex-1 flex flex-col items-center justify-center text-center p-8 text-canvas-textMuted bg-white">
            <Briefcase className="w-12 h-12 text-neutral-300 mb-3" />
            <h3 className="font-serif text-xl font-normal text-canvas-text mb-1">Contract Intelligence Console</h3>
            <p className="text-xs text-canvas-textMuted max-w-sm">
              Select an agreement from the sidebar vault or upload a new transaction draft to begin audit.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Agreement Workspace Header */}
            <div className="card p-5 mb-4 space-y-3 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-canvas-textMuted font-mono">
                    <span>Matter Ref #: M&A-{selectedDocument.id.slice(0, 6).toUpperCase()}</span>
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

              {/* Source Pill & Overview Tags */}
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

            {/* Clean White Tabs Bar */}
            <div className="flex gap-2 border-b border-canvas-border mb-4 flex-shrink-0 overflow-x-auto select-none bg-canvas-bg pb-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-md transition-all whitespace-nowrap',
                    activeTab === id
                      ? 'bg-white text-black font-semibold border-t-2 border-black shadow-sm'
                      : 'text-canvas-textMuted hover:text-black hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {id === 'asymmetries' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ml-1 bg-red-100 text-red-700">
                      New
                    </span>
                  )}
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
                      {/* Executive Summary */}
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

              {/* ── ASYMMETRY DETECTOR TAB ──────────────────────── */}
              {activeTab === 'asymmetries' && (
                <AsymmetryDetector
                  asymmetries={result?.asymmetric_clauses || []}
                  onSelectRedline={handleJumpToRedline}
                />
              )}

              {/* ── REDLINE STUDIO TAB ──────────────────────────── */}
              {activeTab === 'redline' && (
                <RedlineStudio
                  documentId={selectedDocument.id}
                  initialClause={redlineClause}
                />
              )}

              {/* ── NEGOTIATION MEMO TAB ────────────────────────── */}
              {activeTab === 'memo' && (
                <NegotiationMemo
                  documentId={selectedDocument.id}
                  documentTitle={selectedDocument.original_name}
                />
              )}

              {/* ── PARTIES TAB ─────────────────────────────────── */}
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

              {/* ── CLAUSES TAB ─────────────────────────────────── */}
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

              {/* ── RISKS TAB ───────────────────────────────────── */}
              {activeTab === 'risks' && (
                <div className="animate-fade-in">
                  {result ? (
                    <RiskFlags
                      riskFlags={result.risk_flags || []}
                      overallRisk={result.overall_risk_level || 'UNKNOWN'}
                      onSelectRedline={handleJumpToRedline}
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

              {/* ── CHAT TAB ────────────────────────────────────── */}
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
