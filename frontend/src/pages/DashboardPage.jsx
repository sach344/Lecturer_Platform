import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Bookmark, TrendingUp, BookOpen, Menu, X } from 'lucide-react';
import Sidebar, { MODULES } from '../components/Sidebar';
import ContentCard from '../components/ContentCard';
import CreateModal from '../components/CreateModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ total: 0, notes: 0, questions: 0, files: 0 });

  const isBookmarked = searchParams.get('bookmarked') === 'true';

  async function loadContent(q = '', bookmarked = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (q) params.set('q', q);
      if (bookmarked) params.set('bookmarked', 'true');
      const { data } = await api.get(`/content?${params}`);
      setItems(data.docs || []);
      if (!bookmarked && !q) {
        setStats({
          total: data.total || 0,
          notes: (data.docs || []).filter((d) => d.type === 'note').length,
          questions: (data.docs || []).filter((d) => d.type === 'question').length,
          files: (data.docs || []).filter((d) => d.type === 'file').length,
        });
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadContent('', isBookmarked); }, [isBookmarked]);

  useEffect(() => {
    const t = setTimeout(() => { if (search.length >= 2) loadContent(search); else if (!search) loadContent(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const sidebarW = sidebarOpen ? 220 : 64;

  return (
    <div className="min-h-screen hero-gradient" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{ marginLeft: sidebarW, transition: 'margin 0.3s' }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-6 py-4" style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1 relative max-w-lg">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-dark pl-10 py-2 text-sm"
              placeholder="Search across all modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <Plus size={15} /> Add
          </button>
        </header>

        <div className="px-6 py-8">
          {/* Welcome */}
          {!search && !isBookmarked && (
            <>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold">
                  Hey, {user?.name?.split(' ')[0] || 'Student'} 👋
                </h1>
                <p className="text-slate-400 mt-1">Ready to study? Let's ace that exam.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
                {[
                  { label: 'Total Items', val: stats.total, icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                  { label: 'Notes', val: stats.notes, icon: BookOpen, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  { label: 'Questions', val: stats.questions, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { label: 'Files', val: stats.files, icon: Bookmark, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
                ].map(({ label, val, icon: Icon, color, bg }) => (
                  <div key={label} className="glass rounded-2xl p-4 animate-slide-up">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                      <Icon size={18} color={color} />
                    </div>
                    <p className="text-2xl font-display font-bold">{val}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Module Cards */}
              <h2 className="font-display text-lg font-semibold mb-4">📚 Modules</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 stagger">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/module/${encodeURIComponent(m.id)}`)}
                    className="module-card glass rounded-2xl p-5 text-left group animate-slide-up"
                    style={{ borderTop: `2px solid ${m.color}` }}
                  >
                    <span className="text-3xl mb-3 block">{m.icon}</span>
                    <h3 className="font-display font-bold text-sm" style={{ color: m.color }}>{m.id}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{m.label}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: m.color }}>
                      Open <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Page heading for search/bookmark */}
          {(search || isBookmarked) && (
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold">
                {isBookmarked ? '🔖 Bookmarks' : `🔍 Results for "${search}"`}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Recent content or search results */}
          {(search || isBookmarked) && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-500">Searching...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-display font-semibold">No items found</p>
                  <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                items.map((item) => {
                  const mod = MODULES.find((m) => m.id === item.module);
                  return (
                    <ContentCard key={item._id} item={item} color={mod?.color}
                      onDelete={(id) => setItems((p) => p.filter((i) => i._id !== id))}
                      onUpdate={(updated) => setItems((p) => p.map((i) => i._id === updated._id ? updated : i))} />
                  );
                })
              )}
            </div>
          )}

          {/* Recent items when not searching */}
          {!search && !isBookmarked && items.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold mb-4">🕐 Recent Activity</h2>
              <div className="space-y-3">
                {items.slice(0, 6).map((item) => {
                  const mod = MODULES.find((m) => m.id === item.module);
                  return (
                    <ContentCard key={item._id} item={item} color={mod?.color}
                      onDelete={(id) => setItems((p) => p.filter((i) => i._id !== id))}
                      onUpdate={(updated) => setItems((p) => p.map((i) => i._id === updated._id ? updated : i))} />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(item) => { setItems((p) => [item, ...p]); loadContent(); }}
        />
      )}
    </div>
  );
}
