import { useState } from 'react'
import { Scale, ArrowRight, ShieldAlert, Sparkles, FileDiff, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

export default function AsymmetryDetector({ asymmetries = [], onSelectRedline }) {
  if (!asymmetries || asymmetries.length === 0) {
    return (
      <div className="card p-12 text-center text-canvas-textMuted space-y-2 bg-white">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <h4 className="font-serif text-base text-canvas-text font-normal">Symmetrical Risk Distribution</h4>
        <p className="text-xs text-canvas-textMuted max-w-sm mx-auto">
          No severe structural clause imbalances (such as one-sided uncapped indemnities vs restricted warranty baskets) were detected.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="card p-4.5 bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-white" />
            <h3 className="font-serif text-base font-normal text-white">Structural Deal Asymmetries</h3>
            <span className="badge-high">Agent Rule Active</span>
          </div>
          <p className="text-xs text-neutral-400">
            Automated inter-clause pairing to identify one-sided risks shifting liability between Buyer and Seller.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono bg-neutral-800 text-white px-2.5 py-1 rounded border border-neutral-700">
            {asymmetries.length} Imbalances Detected
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {asymmetries.map((item, idx) => (
          <div key={idx} className="card p-5 bg-white border border-canvas-border hover:border-neutral-400 transition-all shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                  {item.category}
                </span>
                <h4 className="font-serif text-base text-canvas-text font-normal mt-0.5">
                  {item.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                  item.imbalance_severity === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>
                  {item.imbalance_severity} Asymmetry
                </span>
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                  Favors: {item.favoring_party}
                </span>
              </div>
            </div>

            {/* Side-by-side Clause Pairing Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                  Provision A (Limitation)
                </p>
                <p className="text-xs font-medium text-canvas-text">
                  {item.clause_a}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-red-600">
                  Provision B (Exposure)
                </p>
                <p className="text-xs font-medium text-canvas-text">
                  {item.clause_b}
                </p>
              </div>
            </div>

            <p className="text-xs text-canvas-textMuted leading-relaxed">
              {item.analysis}
            </p>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-800">
                  Strategic Recommendation
                </span>
                <p className="text-xs text-emerald-900 leading-snug">
                  {item.suggested_fix}
                </p>
              </div>

              {onSelectRedline && (
                <button
                  onClick={() => onSelectRedline(item.clause_a || item.title)}
                  className="btn-primary flex-shrink-0 text-xs py-1.5 px-3 bg-black text-white hover:bg-neutral-800"
                >
                  <FileDiff className="w-3.5 h-3.5" />
                  <span>Generate Redline</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
