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
  ChevronLeft,
  ChevronRight
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
      style={{ backgroundColor: '#0e0e10', borderColor: '#232328' }}
      className={clsx(
        'flex flex-col bg-[#0e0e10] border-r border-[#232328] select-none transition-all duration-300 relative flex-shrink-0 z-20 text-white',
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
            <span
              style={{ color: '#ffffff' }}
              className="font-serif text-2xl font-normal tracking-tight text-white select-none cursor-default"
            >
              Axiom
            </span>
            <div className="flex items-center gap-1.5 text-[#8e8e93]">
              <button
                className="p-1 hover:text-white transition-colors rounded hover:bg-[#1a1a1d]"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:text-white transition-colors rounded hover:bg-[#1a1a1d]"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <span style={{ color: '#ffffff' }} className="font-serif text-xl font-normal text-white">
            A
          </span>
        )}
      </div>

      {/* "+ New Diligence" Action Button */}
      <div className="px-3 py-2">
        <NavLink
          to="/ma"
          style={{ backgroundColor: '#1a1a1d', borderColor: '#232328', color: '#ffffff' }}
          className={clsx(
            'flex items-center gap-2 rounded-lg bg-[#1a1a1d] hover:bg-[#242429] text-white text-[13.5px] font-medium px-3.5 py-2 transition-all border border-[#232328]',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0 text-white" />
          {!sidebarCollapsed && <span className="text-white">New Diligence</span>}
        </NavLink>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto overflow-x-hidden text-[13.5px]">
        <div className="space-y-0.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-[#242429] text-white font-medium'
                : 'text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d]',
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
                ? 'bg-[#242429] text-white font-medium'
                : 'text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d]',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <Bot className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>M&A Agents</span>}
          </NavLink>

          <div
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-[#8e8e93]/50 cursor-not-allowed',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <Database className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Vaults</span>}
          </div>

          <div
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-[#8e8e93]/50 cursor-not-allowed',
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
            <p className="px-3 text-[11px] uppercase font-semibold text-[#8e8e93]/80 tracking-wider">
              Apps
            </p>
            <NavLink
              to="/reports"
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors',
                isActive && 'bg-[#242429] text-white font-medium'
              )}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Contract Intelligence</span>
            </NavLink>
          </div>
        )}

        {/* Section: Recents */}
        {!sidebarCollapsed && (
          <div className="space-y-1">
            <p className="px-3 text-[11px] uppercase font-semibold text-[#8e8e93]/80 tracking-wider">
              Recents
            </p>
            <div className="space-y-0.5">
              {documents.slice(0, 3).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectRecent(doc)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors text-left"
                >
                  <span className="text-[#8e8e93] text-[10px]">•</span>
                  <span className="truncate text-[13px]">{doc.original_name}</span>
                </button>
              ))}

              {documents.length === 0 && (
                <p className="px-3 py-1 text-[12px] text-[#8e8e93]/50 italic">No recent audits</p>
              )}

              <NavLink
                to="/reports"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>View History</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Section: Spaces */}
        {!sidebarCollapsed && (
          <div className="space-y-1">
            <p className="px-3 text-[11px] uppercase font-semibold text-[#8e8e93]/80 tracking-wider">
              Spaces
            </p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-[#1a1a1d] text-white flex items-center justify-center text-[10px] font-medium border border-[#232328]">
                  A
                </span>
                <span className="truncate text-[13px]">Acme Acquisition</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-[#1a1a1d] text-white flex items-center justify-center text-[10px] font-medium border border-[#232328]">
                  T
                </span>
                <span className="truncate text-[13px]">Project Titan</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#1a1a1d] transition-colors cursor-pointer">
                <span className="w-4 h-4 rounded bg-[#1a1a1d] text-white flex items-center justify-center text-[10px] font-medium border border-[#232328]">
                  D
                </span>
                <span className="truncate text-[13px]">Delphi Diligence</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Profile Bar */}
      <div
        style={{ backgroundColor: '#0e0e10', borderColor: '#232328' }}
        className={clsx(
          'p-3 border-t border-[#232328] flex items-center justify-between bg-[#0e0e10]',
          sidebarCollapsed && 'justify-center p-2'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-[#242429] border border-[#333338] flex items-center justify-center text-xs font-serif font-bold text-white flex-shrink-0">
            A
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate leading-none">Axiom Counsel</p>
              <p className="text-[11px] text-[#8e8e93] truncate mt-1 font-mono">Local Core Active</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-[#8e8e93] hover:text-white p-1 rounded hover:bg-[#1a1a1d] transition-colors"
          title="Toggle Navigation"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  )
}
