import { useEffect, useState } from 'react'
import {
  Briefcase, FileText, Trash2, PlayCircle, Loader2,
  Users, DollarSign, Calendar, Scale, AlertTriangle,
  ChevronRight, CheckSquare, List, MessageSquare, X
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
  { id: 'risks', label: 'Risk Flags', icon: AlertTriangle },
  { id: 'chat', label: 'Ask AI', icon: MessageSquare },
]

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2 border-b border-axiom-border last:border-0">
      <span className="text-xs text-axiom-muted w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-axiom-text leading-relaxed flex-1">{value}</span>
    </div>
  )
}

function ClauseList({ title, items, icon: Icon }) {
  if (!items?.length) return null
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-axiom-accent" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className="text-xs text-axiom-muted bg-axiom-border px-1.5 py-0.5 rounded-full">{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-axiom-textDim">
            <ChevronRight className="w-3 h-3 text-axiom-accent mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MAndA() {
  const { documents, fetchDocuments, documentsLoading, selectedDocument, setSelectedDocument,
    removeDocument, currentAnalysis, startAnalysis, setCurrentAnalysis } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  useEffect(() => { fetchDocuments() }, [])

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
    // Load latest analysis for this document
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
      setAnalysisError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const result = currentAnalysis?.result

  const riskBadgeClass = {
    HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low'
  }[result?.overall_risk_level] || 'badge-unknown'

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] max-w-[1600px]">
      {/* ── Left Panel: Document List ───────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        <DocumentUpload module="ma" onUploaded={handleSelectDoc} />

        <div className="card flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-axiom-border flex items-center gap-2">
            <FileText className="w-4 h-4 text-axiom-accent" />
            <span className="text-sm font-semibold text-white">Documents</span>
            <span className="ml-auto text-xs text-axiom-muted bg-axiom-border px-1.5 py-0.5 rounded-full">{documents.length}</span>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {documentsLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-axiom-muted">
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs">No documents yet</p>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => doc.status === 'ready' && handleSelectDoc(doc)}
                  className={clsx(
                    'group flex items-start gap-2.5 p-2.5 rounded-lg mb-1 transition-all',
                    doc.status === 'ready' ? 'cursor-pointer hover:bg-axiom-border' : 'cursor-not-allowed opacity-60',
                    selectedDocument?.id === doc.id && 'bg-axiom-accent/10 border border-axiom-accent/25'
                  )}
                >
                  <FileText className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', selectedDocument?.id === doc.id ? 'text-axiom-accent' : 'text-axiom-muted')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-axiom-text truncate">{doc.original_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {doc.status === 'ready' && <span className="badge-low text-[9px]">Ready</span>}
                      {doc.status === 'processing' && <span className="flex items-center gap-1 text-[9px] text-axiom-accent"><Loader2 className="w-2.5 h-2.5 animate-spin" />Processing</span>}
                      {doc.status === 'error' && <span className="badge-high text-[9px]">Error</span>}
                      <span className="text-[9px] text-axiom-muted">{doc.page_count}p</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc) }}
                    className="opacity-0 group-hover:opacity-100 text-axiom-muted hover:text-red-400 transition-all p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Analysis ───────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!selectedDocument ? (
          <div className="flex-1 card flex flex-col items-center justify-center text-axiom-muted">
            <Briefcase className="w-12 h-12 mb-4 text-axiom-border" />
            <h3 className="text-base font-semibold text-axiom-textDim mb-1">Select a Document</h3>
            <p className="text-sm text-center max-w-sm">
              Upload an M&A document and select it to begin AI-powered due diligence analysis.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Document Header */}
            <div className="card px-5 py-4 mb-4 flex items-center gap-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-axiom-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white truncate">{selectedDocument.original_name}</h2>
                <p className="text-xs text-axiom-muted">
                  {selectedDocument.page_count} pages · {selectedDocument.chunk_count} indexed chunks
                  {result && (
                    <> · <span className={riskBadgeClass}>{result.overall_risk_level} RISK</span></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentAnalysis?.status === 'running' ? (
                  <div className="flex items-center gap-2 text-xs text-axiom-accent">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading || currentAnalysis?.status === 'running'}
                    className="btn-primary text-xs py-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {result ? 'Re-Analyze' : 'Run Analysis'}
                  </button>
                )}
              </div>
            </div>

            {analysisError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm flex-shrink-0">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {analysisError}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-axiom-border mb-4 flex-shrink-0 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap',
                    activeTab === id
                      ? 'border-axiom-accent text-axiom-accent'
                      : 'border-transparent text-axiom-muted hover:text-axiom-text hover:border-axiom-border'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {id === 'risks' && result?.risk_flags?.length > 0 && (
                    <span className={clsx(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                      result.overall_risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        result.overall_risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                    )}>
                      {result.risk_flags.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* ── OVERVIEW TAB ─────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  {!result ? (
                    currentAnalysis?.status === 'running' ? (
                      <div className="card p-8 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-axiom-accent animate-spin" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-white mb-1">AI Analysis Running</p>
                          <p className="text-xs text-axiom-muted">
                            Extracting deal terms, parties, and risk factors...<br />
                            This may take 1–3 minutes depending on your hardware.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="card p-8 flex flex-col items-center gap-4 text-axiom-muted">
                        <PlayCircle className="w-12 h-12 text-axiom-border" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-axiom-textDim mb-1">No Analysis Yet</p>
                          <p className="text-xs">Click "Run Analysis" to start AI-powered M&A due diligence.</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Executive Summary */}
                      {result.executive_summary && (
                        <div className="card p-5">
                          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-axiom-accent" />
                            Executive Summary
                          </h3>
                          <p className="text-xs text-axiom-textDim leading-relaxed whitespace-pre-line">{result.executive_summary}</p>
                        </div>
                      )}

                      {/* Deal Info */}
                      <div className="card p-5">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-axiom-gold" />
                          Deal Information
                        </h3>
                        <InfoRow label="Deal Title" value={result.deal_title} />
                        <InfoRow label="Deal Type" value={result.deal_type} />
                        <InfoRow label="Deal Value" value={result.deal_value} />
                        <InfoRow label="Governing Law" value={result.governing_law} />
                        <InfoRow label="Jurisdiction" value={result.jurisdiction} />
                        <InfoRow label="Signing Date" value={result.signing_date} />
                        <InfoRow label="Closing Date" value={result.closing_date} />
                      </div>

                      {/* Recommendations */}
                      {result.key_recommendations?.length > 0 && (
                        <div className="card p-5">
                          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-green-400" />
                            Key Recommendations
                          </h3>
                          <ul className="space-y-2">
                            {result.key_recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-axiom-textDim">
                                <span className="w-4 h-4 rounded-full bg-axiom-accent/20 text-axiom-accent text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{rec}</span>
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
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-axiom-accent" />
                      Deal Parties
                    </h3>
                    {result.parties?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.parties.map((party, i) => (
                          <div key={i} className="flex items-center gap-3 bg-axiom-surface border border-axiom-border rounded-lg px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-axiom-accent/10 border border-axiom-accent/20 flex items-center justify-center text-xs font-bold text-axiom-accent">
                              {party.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-axiom-text">{party.name}</p>
                              <p className="text-xs text-axiom-muted">{party.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-axiom-muted">No party information extracted.</p>
                    )}
                  </div>

                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-axiom-gold" />
                      Deal Terms Summary
                    </h3>
                    <InfoRow label="Deal Type" value={result.deal_type} />
                    <InfoRow label="Consideration" value={result.deal_value} />
                    <InfoRow label="Governing Law" value={result.governing_law} />
                    <InfoRow label="Jurisdiction" value={result.jurisdiction} />
                    <InfoRow label="Signing Date" value={result.signing_date} />
                    <InfoRow label="Target Closing" value={result.closing_date} />
                  </div>
                </div>
              )}

              {/* ── CLAUSES TAB ──────────────────────────────────── */}
              {activeTab === 'clauses' && result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <ClauseList title="Conditions Precedent" items={result.conditions_precedent} icon={CheckSquare} />
                  <ClauseList title="Representations & Warranties" items={result.representations_warranties} icon={Scale} />
                  <ClauseList title="Indemnification Provisions" items={result.indemnification_provisions} icon={AlertTriangle} />
                  <ClauseList title="Non-Compete Obligations" items={result.non_compete_clauses} icon={X} />
                  <ClauseList title="MAC Clauses" items={result.mac_clauses} icon={AlertTriangle} />
                  <ClauseList title="Termination Rights" items={result.termination_rights} icon={X} />
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
                    <div className="card p-8 flex flex-col items-center text-axiom-muted gap-2">
                      <AlertTriangle className="w-8 h-8" />
                      <p className="text-sm">Run analysis to see risk flags.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── CHAT TAB ─────────────────────────────────────── */}
              {activeTab === 'chat' && (
                <div className="card overflow-hidden h-[500px] animate-fade-in">
                  <ChatInterface
                    documentId={selectedDocument.id}
                    documentName={selectedDocument.original_name}
                  />
                </div>
              )}

              {/* No result placeholder for non-overview tabs */}
              {!result && activeTab !== 'overview' && activeTab !== 'chat' && (
                <div className="card p-8 flex flex-col items-center text-axiom-muted gap-2">
                  <PlayCircle className="w-8 h-8 text-axiom-border" />
                  <p className="text-sm">Run analysis to view this section.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
