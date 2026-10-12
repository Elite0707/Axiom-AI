import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Scale,
  Settings,
  ChevronLeft,
  Shield,
  Zap
} from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ma', icon: Briefcase, label: 'M&A Due Diligence', badge: 'ACTIVE' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

const comingSoon = [
  { icon: Scale, label: 'Contract Review' },
  { icon: Shield, label: 'GDPR Compliance' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore()

  return (
    <aside
      className={clsx(
        'flex flex-col bg-axiom-surface border-r border-axiom-border transition-all duration-300 relative',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-axiom-border',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-axiom-accent to-blue-700 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="font-bold text-white tracking-tight">Axiom</span>
            <span className="font-bold text-axiom-accent"> AI</span>
            <p className="text-[10px] text-axiom-muted leading-none mt-0.5">Legal Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="section-title px-3 mb-2">Modules</p>
        )}
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
              isActive
                ? 'bg-axiom-accent/15 text-axiom-accent border border-axiom-accent/25'
                : 'text-axiom-textDim hover:bg-axiom-card hover:text-axiom-text',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="text-sm font-medium flex-1">{label}</span>
                {badge && (
                  <span className="text-[9px] font-bold bg-axiom-accent/20 text-axiom-accent px-1.5 py-0.5 rounded-full border border-axiom-accent/30">
                    {badge}
                  </span>
                )}
              </>
            )}
            {/* Tooltip when collapsed */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-axiom-card border border-axiom-border rounded-lg 
                             text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 
                             pointer-events-none transition-opacity z-50 shadow-lg">
                {label}
              </div>
            )}
          </NavLink>
        ))}

        {!sidebarCollapsed && (
          <>
            <p className="section-title px-3 mt-4 mb-2">Coming Soon</p>
            {comingSoon.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-axiom-muted cursor-not-allowed opacity-50"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{label}</span>
                <span className="text-[9px] font-bold bg-axiom-border text-axiom-muted px-1.5 py-0.5 rounded-full">
                  SOON
                </span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className={clsx(
        'p-3 border-t border-axiom-border',
        sidebarCollapsed ? 'flex justify-center' : ''
      )}>
        {!sidebarCollapsed && (
          <div className="card px-3 py-2 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
              <span className="text-xs text-axiom-textDim">AI Engine Online</span>
            </div>
            <p className="text-[10px] text-axiom-muted">Ollama · LLaMA 3.1 · Local</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 text-axiom-muted hover:text-axiom-text transition-colors w-full px-3 py-2 rounded-lg hover:bg-axiom-card"
        >
          <ChevronLeft className={clsx('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
