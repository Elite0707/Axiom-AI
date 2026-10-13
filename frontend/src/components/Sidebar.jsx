import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Plus,
  Bot,
  Database,
  LayoutGrid,
  MoreHorizontal,
  FileText,
  Clock,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, documents, setSelectedDocument } = useStore()
  const navigate = useNavigate()

  const handleSelectRecent = (doc) => {
    setSelectedDocument(doc)
    navigate('/ma')
  }

  return (
    <aside
      className={clsx(
        'flex flex-col bg-sidebar-bg border-r border-sidebar-border select-none transition-all duration-300 relative flex-shrink-0 z-20 text-sidebar-text',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header: Logo + Bell + Search */}
      <div className={clsx(
        'flex items-center justify-between px-5 pt-5 pb-3',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        {!sidebarCollapsed ? (
          <>
            <span className="font-serif text-2xl font-normal tracking-tight text-white">
              Axiom
            </span>
            <div className="flex items-center gap-1.5 text-sidebar-muted">
              <button className="p-1 hover:text-white transition-colors rounded hover:bg-sidebar-hover">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-1 hover:text-white transition-colors rounded hover:bg-sidebar-hover">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <span className="font-serif text-xl font-normal text-white">A</span>
        )}
      </div>

      {/* "+ New Thread / New Diligence" Action Button */}
      <div className="px-3 py-2">
        <NavLink
          to="/ma"
          className={clsx(
            'flex items-center gap-2 rounded-lg bg-sidebar-hover hover:bg-sidebar-active text-white text-xs font-medium px-3 py-2 transition-all border border-sidebar-border',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>New Diligence</span>}
        </NavLink>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto overflow-x-hidden text-xs">
        <div className="space-y-0.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-sidebar-active text-white font-medium'
                : 'text-sidebar-muted hover:text-white hover:bg-sidebar-hover',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Command Center</span>}
          </NavLink>

          <NavLink
            to="/ma"
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-sidebar-active text-white font-medium'
                : 'text-sidebar-muted hover:text-white hover:bg-sidebar-hover',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <Bot className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>M&A Agents</span>}
          </NavLink>

          <div
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-muted/60 cursor-not-allowed',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <Database className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Vaults</span>}
          </div>

          <div
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-muted/60 cursor-not-allowed',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <MoreHorizontal className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>More</span>}
          </div>
        </div>

        {/* Section: Apps */}
        {!sidebarCollapsed && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-semibold text-sidebar-muted/70 tracking-wider">
              Apps
            </p>
            <NavLink
              to="/reports"
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors',
                isActive && 'bg-sidebar-active text-white font-medium'
              )}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Contract Intelligence</span>
            </NavLink>
          </div>
        )}

        {/* Section: Recents (Real documents) */}
        {!sidebarCollapsed && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-semibold text-sidebar-muted/70 tracking-wider">
              Recents
            </p>
            <div className="space-y-0.5">
              {documents.slice(0, 3).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectRecent(doc)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors text-left"
                >
                  <span className="text-sidebar-muted text-[10px]">•</span>
                  <span className="truncate text-xs">{doc.original_name}</span>
                </button>
              ))}

              {documents.length === 0 && (
                <p className="px-3 py-1 text-[11px] text-sidebar-muted/60 italic">No recent audits</p>
              )}

              <NavLink
                to="/reports"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>View History</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Section: Spaces (Active Matters) */}
        {!sidebarCollapsed && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-semibold text-sidebar-muted/70 tracking-wider">
              Spaces
            </p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-sidebar-hover text-white flex items-center justify-center text-[10px] font-medium border border-sidebar-border">
                  A
                </span>
                <span className="truncate">Acme Acquisition</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-sidebar-hover text-white flex items-center justify-center text-[10px] font-medium border border-sidebar-border">
                  T
                </span>
                <span className="truncate">Project Titan</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-hover transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-sidebar-hover text-white flex items-center justify-center text-[10px] font-medium border border-sidebar-border">
                  D
                </span>
                <span className="truncate">Delphi Diligence</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Profile Bar from Screenshot */}
      <div className={clsx(
        'p-3 border-t border-sidebar-border flex items-center justify-between bg-sidebar-bg',
        sidebarCollapsed && 'justify-center p-2'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
            A
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-none">Axiom Counsel</p>
              <p className="text-[10px] text-sidebar-muted truncate mt-0.5 font-mono">Local Core Active</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-sidebar-muted hover:text-white p-1 rounded hover:bg-sidebar-hover transition-colors"
          title="Toggle Navigation"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  )
}
