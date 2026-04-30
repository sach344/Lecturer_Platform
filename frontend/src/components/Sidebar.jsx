import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Home, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  { id: 'GK', label: 'General Knowledge', icon: '🌍', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'DSA', label: 'DSA', icon: '🧮', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'Hindi', label: 'Hindi', icon: '📖', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'Paper 1', label: 'Paper 1', icon: '📄', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'Paper 2', label: 'Paper 2', icon: '📋', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { id: 'System Design', label: 'System Design', icon: '🏗️', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '220px',
        background: '#070712',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
          <BookOpen size={18} color="white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-display font-bold text-sm leading-tight text-white">StudyPlatform</p>
            <p className="text-xs text-slate-500 truncate">{user?.name || 'Student'}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <NavLink to="/"
          className={({ isActive }) =>
            `sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'active' : ''}`
          }
          style={({ isActive }) => isActive
            ? { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderLeft: '3px solid #6366f1' }
            : { color: '#64748b' }}
          end
        >
          <Home size={16} className="flex-shrink-0" />
          {!collapsed && <span>Home</span>}
        </NavLink>

        {!collapsed && (
          <p className="text-xs text-slate-600 px-3 pt-4 pb-1 font-semibold uppercase tracking-wider">Modules</p>
        )}

        {MODULES.map((m) => (
          <NavLink key={m.id} to={`/module/${encodeURIComponent(m.id)}`}
            className={({ isActive }) =>
              `sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => isActive
              ? { background: m.bg, color: m.color, borderLeft: `3px solid ${m.color}` }
              : { color: '#64748b' }}
          >
            <span className="text-base flex-shrink-0">{m.icon}</span>
            {!collapsed && <span className="truncate">{m.id === 'System Design' ? 'Sys. Design' : m.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="text-xs text-slate-600 px-3 pt-4 pb-1 font-semibold uppercase tracking-wider">Quick</p>
        )}

        <NavLink to="/?bookmarked=true"
          className="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#64748b' }}
        >
          <Bookmark size={16} className="flex-shrink-0" />
          {!collapsed && <span>Bookmarks</span>}
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-3">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-900/20 hover:text-red-400"
          style={{ color: '#64748b' }}>
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export { MODULES };
