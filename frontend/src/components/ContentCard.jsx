import { useState } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Edit, ExternalLink, FileText, Video, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import api from '../api/client';

export default function ContentCard({ item, onDelete, onUpdate, color = '#6366f1' }) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(item.bookmarked);

  async function toggleBookmark(e) {
    e.stopPropagation();
    try {
      const { data } = await api.patch(`/content/${item._id}/bookmark`);
      setBookmarked(data.bookmarked);
      onUpdate && onUpdate(data);
    } catch {}
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/content/${item._id}`);
      onDelete && onDelete(item._id);
    } catch {}
  }

  const diffClass = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }[item.difficulty] || '';

  return (
    <div
      className="glass rounded-2xl overflow-hidden transition-all hover:border-white/10 cursor-pointer"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {item.type === 'note' && <span className="tag-pill" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>Note</span>}
              {item.type === 'question' && <span className="tag-pill" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)' }}>Question</span>}
              {item.type === 'file' && <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>File</span>}
              {item.difficulty && <span className={`tag-pill ${diffClass}`}>{item.difficulty}</span>}
              {item.category && <span className="text-xs text-slate-500">{item.category}</span>}
              {item.folder && <span className="text-xs text-slate-500">📁 {item.folder}</span>}
            </div>
            <h3 className="font-display font-semibold text-white text-sm leading-snug truncate">{item.title}</h3>
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.slice(0, 4).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e293b', color: '#64748b' }}>
                    <Tag size={9} />{t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleBookmark} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              {bookmarked ? <BookmarkCheck size={15} color="#f59e0b" /> : <Bookmark size={15} color="#4b5563" />}
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-900/20 transition-colors">
              <Trash2 size={15} color="#4b5563" />
            </button>
            {expanded ? <ChevronUp size={15} color="#4b5563" /> : <ChevronDown size={15} color="#4b5563" />}
          </div>
        </div>

        {/* Links row */}
        {(item.questionLink || item.videoLink) && (
          <div className="flex gap-3 mt-2">
            {item.questionLink && (
              <a href={item.questionLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink size={12} /> Problem
              </a>
            )}
            {item.videoLink && (
              <a href={item.videoLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                <Video size={12} /> Video
              </a>
            )}
          </div>
        )}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-4 animate-fade-in">
          {item.body && (
            <div className="prose-dark text-sm" dangerouslySetInnerHTML={{ __html: item.body }} />
          )}
          {item.files?.length > 0 && (
            <div className="mt-3 space-y-2">
              {item.files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  style={{ color: '#94a3b8' }} onClick={(e) => e.stopPropagation()}>
                  <FileText size={14} color="#6366f1" />
                  <span className="truncate">{f.filename}</span>
                  <ExternalLink size={12} className="ml-auto flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-600 mt-3">
            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}
