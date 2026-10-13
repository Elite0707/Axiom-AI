import { useState, useEffect } from 'react'
import { Briefcase, Copy, Check, Printer, ShieldAlert, AlertTriangle, ArrowRight, MessageSquareQuote } from 'lucide-react'
import { analysisApi } from '../lib/api'

export default function NegotiationMemo({ documentId, documentTitle }) {
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchMemo = async () => {
      setLoading(true)
      try {
        const { data } = await analysisApi.getNegotiationMemo({
          document_id: documentId,
          perspective: 'buyer',
          doc_title: documentTitle || 'M&A Agreement'
        })
        setMemo(data)
      } catch (err) {
        console.error('Failed to load memo:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMemo()
  }, [documentId, documentTitle])

  const handleCopy = () => {
    if (!memo) return
    const text = `
DEAL NEGOTIATION BRIEF — ${memo.deal_title}
Perspective: ${memo.perspective}

EXECUTIVE POSTURE:
${memo.executive_posture}

DEAL BREAKERS:
${memo.deal_breakers.map(b => `- ${b}`).join('\n')}

PRIMARY BATTLEGROUNDS:
${memo.battlegrounds.map(bg => `
* ${bg.issue}
  - Seller: ${bg.seller_position}
  - Buyer: ${bg.buyer_position}
  - Partner Talking Point: ${bg.talking_point}
  - Fallback Compromise: ${bg.fallback_compromise}
`).join('\n')}

NEGOTIATION PROTOCOL:
${memo.negotiation_protocol.join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading || !memo) {
    return (
      <div className="card p-12 text-center text-canvas-textMuted space-y-3 bg-white">
        <Briefcase className="w-8 h-8 mx-auto text-neutral-300 animate-pulse" />
        <p className="font-serif text-sm text-canvas-text">Compiling Counsel Negotiation Brief...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
            Executive Partner Brief
          </span>
          <h2 className="font-serif text-xl font-normal text-canvas-text">
            Deal Negotiation Memo
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Memo</span>
          </button>
          <button onClick={handleCopy} className="btn-primary text-xs bg-black text-white hover:bg-neutral-800">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Brief!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>

      {/* 1-Page Printable Brief Card */}
      <div className="card p-7 bg-white border border-canvas-border shadow-sm space-y-6">
        {/* Deal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-canvas-border">
          <div>
            <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded border border-neutral-200">
              {memo.perspective}
            </span>
            <h3 className="font-serif text-lg font-normal text-canvas-text mt-1.5">
              {memo.deal_title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-canvas-textMuted font-mono">
              Confidential · Attorney Work Product
            </span>
          </div>
        </div>

        {/* Executive Posture & Leverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Executive Bargaining Posture
            </span>
            <p className="text-xs text-canvas-text leading-relaxed">
              {memo.executive_posture}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Strategic Commercial Leverage
            </span>
            <p className="text-xs text-canvas-text leading-relaxed">
              {memo.deal_leverage}
            </p>
          </div>
        </div>

        {/* Non-Negotiable Deal Breakers */}
        <div className="p-4 rounded-lg bg-red-50/60 border border-red-200 space-y-2">
          <div className="flex items-center gap-1.5 text-red-700">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Non-Negotiable Deal Breakers (Redlines Required)
            </span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-red-900 leading-relaxed">
            {memo.deal_breakers.map((breaker, i) => (
              <li key={i}>{breaker}</li>
            ))}
          </ul>
        </div>

        {/* Key Negotiation Battlegrounds */}
        <div className="space-y-4">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 tracking-wider block">
            Core Battlegrounds & Lead Attorney Talking Points
          </span>

          <div className="space-y-3.5">
            {memo.battlegrounds.map((bg, idx) => (
              <div key={idx} className="p-4.5 rounded-lg border border-canvas-border bg-neutral-50/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-serif text-sm font-normal text-canvas-text">
                    {bg.issue}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                      Seller: {bg.seller_position}
                    </span>
                    <span className="text-neutral-400">vs</span>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      Buyer: {bg.buyer_position}
                    </span>
                  </div>
                </div>

                {/* Lead Attorney Scripted Talking Point */}
                <div className="p-3 rounded-md bg-white border border-canvas-border flex items-start gap-2.5">
                  <MessageSquareQuote className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                      Partner Talking Point (Script)
                    </span>
                    <p className="font-serif text-xs italic text-canvas-text leading-relaxed">
                      {bg.talking_point}
                    </p>
                  </div>
                </div>

                {/* Fallback Position */}
                <div className="text-xs text-neutral-600 flex items-baseline gap-2 pl-1">
                  <span className="text-[10px] uppercase font-semibold text-neutral-500">
                    Fallback Compromise:
                  </span>
                  <span>{bg.fallback_compromise}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Order */}
        <div className="p-4 rounded-lg bg-neutral-100 border border-neutral-200 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-neutral-600 tracking-wider block">
            Recommended Meeting Sequence & Concession Strategy
          </span>
          <div className="space-y-1 text-xs text-neutral-800">
            {memo.negotiation_protocol.map((step, idx) => (
              <p key={idx}>{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
