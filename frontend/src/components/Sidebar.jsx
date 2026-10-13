import { NavLink } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  Scale,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: Layers, label: 'Overview' },
  { to: '/ma', icon: Briefcase, label: 'M&A Due Diligence', badge: 'ACTIVE' },
  { to: '/reports', icon: FileText, label: 'Reports & Audits' },
]

const upcomingModules = [
  { icon: Scale, label: 'Contract Intelligence' },
  { icon: Shield, label: 'Compliance & GDPR' },
  { icon: Database, label: 'Vault (Multi-Doc)' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore()

  return (
    <aside
      className={clsx(
        'flex flex-col bg-harvey-charcoal border-r border-harvey-border select-none transition-all duration-300 relative flex-shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={clsx(
        'flex items-center gap-3 px-5 py-5 border-b border-harvey-border/80',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0 shadow-sm">
          <span className="font-serif text-base font-semibold text-harvey-ivory">A</span>
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg tracking-tight text-harvey-ivory font-normal">:Axiom:</span>
              <span className="bg-harvey-surface text-harvey-gold text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded border border-harvey-border">PRO</span>
            </div>
            <p className="text-[10px] text-harvey-muted uppercase tracking-[0.08em] font-medium">Legal Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          {!sidebarCollapsed && (
            <p className="section-title px-2.5 mb-2">Practice Areas</p>
          )}
          <div className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2 rounded text-xs transition-all duration-150 group relative',
                  isActive
                    ? 'bg-harvey-surface text-harvey-ivory font-medium border border-harvey-border shadow-sm'
                    : 'text-harvey-muted hover:text-harvey-ivory hover:bg-harvey-surface/60 border border-transparent',
                  sidebarCollapsed && 'justify-center px-0 py-2.5'
                )}
              >
                <Icon className={clsx('w-4 h-4 flex-shrink-0 transition-colors', 'text-harvey-muted group-hover:text-harvey-ivory')} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate tracking-tight">{label}</span>
                    {badge && (
                      <span className="text-[9px] font-medium text-harvey-gold bg-harvey-gold/10 px-1.5 py-0.5 rounded border border-harvey-gold/20">
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {/* Collapsed Tooltip */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-harvey-charcoal border border-harvey-border rounded text-[11px] text-harvey-ivory whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
                    {label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {!sidebarCollapsed && (
          <div>
            <p className="section-title px-2.5 mb-2">Platform Horizon</p>
            <div className="space-y-1">
              {upcomingModules.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2 rounded text-xs text-harvey-darkMuted cursor-not-allowed opacity-75"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate tracking-tight">{label}</span>
                  <span className="text-[9px] font-mono text-harvey-muted bg-harvey-surface px-1.5 py-0.2 rounded border border-harvey-borderSubtle">
                    SOON
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer / Engine Status */}
      <div className={clsx(
        'p-3 border-t border-harvey-border/80 bg-harvey-obsidian/40',
        sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''
      )}>
        {!sidebarCollapsed ? (
          <div className="p-2.5 rounded bg-harvey-surface/80 border border-harvey-border mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harvey-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-harvey-emerald"></span>
              </span>
              <div>
                <p className="text-[11px] font-medium text-harvey-ivory tracking-tight leading-none">Local AI Core</p>
                <p className="text-[10px] text-harvey-muted font-mono mt-0.5">Ollama · Zero-Data Leak</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-harvey-gold" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-harvey-emerald mb-2" title="Engine Active" />
        )}

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-between text-harvey-muted hover:text-harvey-ivory transition-colors w-full px-2 py-1.5 rounded hover:bg-harvey-surface text-xs"
        >
          {!sidebarCollapsed && <span className="text-[11px] text-harvey-muted font-medium">Collapse Navigation</span>}
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5 mx-auto" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  )
}
