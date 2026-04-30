import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Folder, Filter, Menu, X, ChevronRight, RefreshCw } from 'lucide-react';
import Sidebar, { MODULES } from '../components/Sidebar';
import ContentCard from '../components/ContentCard';
import CreateModal from '../components/CreateModal';
import api from '../api/client';

const TYPE_LABELS = { note: '📝 Notes', question: '❓ Questions', file: '📎 Files' };

export default function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = MODULES.find((m) => m.id === decodeURIComponent(moduleId));

  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]); // categories/folders
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const groupBy = mod?.id === 'DSA' ? 'folder' : ['Paper 1', 'Paper 2'].includes(mod?.id) ? 'section' : 'category';

  const loadGroups = useCallback(async () => {
    try {
      const { data } = await api.get(`/content/groups?module=${mod?.id}&groupBy=${groupBy}`);
      setGroups(data);
    } catch {}
  }, [mod?.id, groupBy]);

  const loadItems = useCallback(async () => {
    if (!mod) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ module: mod.id, limit: 100 });
      if (selectedType) params.set('type', selectedType);
      if (selectedGroup) params.set(groupBy, selectedGroup);
      if (search) params.set('q', search);
      const { data } = await api.get(`/content?${params}`);
      setItems(data.docs || []);
    } catch {}
    setLoading(false);
  }, [mod?.id, selectedGroup, selectedType, search, groupBy]);

  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => {
    const t = setTimeout(loadItems, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadItems, search]);

  if (!mod) return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">🤔</p>
        <p className="font-display font-bold text-xl">Module not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-400 hover:underline text-sm">← Back to Home</button>
      </div>
    </div>
  );

  const sidebarW = sidebarOpen ? 220 : 64;

  return (
    <div className="min-h-screen hero-gradient">
      <Sidebar collapsed={!sidebarOpen} />

      <main style={{ marginLeft: sidebarW, transition: 'margin 0.3s' }}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-6 py-4"
          style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300">Home</button>
            <ChevronRight size={14} color="#4b5563" />
            <span className="font-semibold" style={{ color: mod.color }}>{mod.icon} {mod.id}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-dark pl-10 py-2 text-sm w-48" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${mod.color}cc, ${mod.color})` }}>
              <Plus size={15} /> Add
            </button>
          </div>
        </header>

        <div className="flex h-[calc(100vh-65px)] overflow-hidden">
          {/* Left panel: groups */}
          <aside className="w-52 flex-shrink-0 border-r overflow-y-auto py-4 px-3 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(7,7,18,0.5)' }}>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 pb-2">
              {groupBy === 'folder' ? 'Folders' : groupBy === 'section' ? 'Sections' : 'Categories'}
            </p>
            <button
              onClick={() => setSelectedGroup(null)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={!selectedGroup ? { background: `${mod.color}20`, color: mod.color } : { color: '#64748b' }}
            >
              <FolderOpen size={14} className="flex-shrink-0" />
              <span className="truncate">All</span>
            </button>
            {groups.map((g) => (
              <button key={g}
                onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                style={selectedGroup === g ? { background: `${mod.color}20`, color: mod.color } : { color: '#64748b' }}
              >
                {selectedGroup === g ? <FolderOpen size={14} className="flex-shrink-0" /> : <Folder size={14} className="flex-shrink-0" />}
                <span className="truncate">{g}</span>
              </button>
            ))}
            {groups.length === 0 && (
              <p className="text-xs text-slate-600 px-2 py-4 text-center">No {groupBy}s yet. Add content to create them.</p>
            )}

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 pb-2">Type</p>
              {[null, 'note', 'question', 'file'].map((t) => (
                <button key={t || 'all'}
                  onClick={() => setSelectedType(t)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all mb-1"
                  style={selectedType === t ? { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' } : { color: '#64748b' }}
                >
                  {t ? TYPE_LABELS[t] : '🗂 All Types'}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Module hero */}
            {!selectedGroup && !search && !selectedType && items.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">{mod.icon}</div>
                <h2 className="font-display text-2xl font-bold mb-2">{mod.label}</h2>
                <p className="text-slate-400 mb-6">No content yet. Start by adding notes, questions, or files.</p>
                <button onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${mod.color}aa, ${mod.color})` }}>
                  <Plus size={16} /> Add First Item
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={24} color={mod.color} className="animate-spin" />
              </div>
            ) : (
              <>
                {items.length > 0 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    {selectedGroup && <span className="text-sm font-medium" style={{ color: mod.color }}>📁 {selectedGroup}</span>}
                  </div>
                )}
                <div className="space-y-3 animate-fade-in">
                  {items.map((item) => (
                    <ContentCard key={item._id} item={item} color={mod.color}
                      onDelete={(id) => { setItems((p) => p.filter((i) => i._id !== id)); loadGroups(); }}
                      onUpdate={(updated) => setItems((p) => p.map((i) => i._id === updated._id ? updated : i))} />
                  ))}
                </div>
                {items.length === 0 && (selectedGroup || search || selectedType) && (
                  <div className="text-center py-20 glass rounded-2xl">
                    <p className="text-3xl mb-3">🔍</p>
                    <p className="font-display font-semibold">Nothing found</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateModal
          defaultModule={mod.id}
          onClose={() => setShowCreate(false)}
          onCreated={(item) => { setItems((p) => [item, ...p]); loadGroups(); }}
        />
      )}
    </div>
  );
}
