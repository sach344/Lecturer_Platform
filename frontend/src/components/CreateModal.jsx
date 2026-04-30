import { useState, useRef } from 'react';
import { X, Upload, Plus, RefreshCw } from 'lucide-react';
import RichEditor from './RichEditor';
import api from '../api/client';

const MODULES = ['GK', 'DSA', 'Hindi', 'Paper 1', 'Paper 2', 'System Design'];

export default function CreateModal({ onClose, onCreated, defaultModule, defaultType }) {
  const [form, setForm] = useState({
    module: defaultModule || 'GK',
    type: defaultType || 'note',
    title: '',
    category: '',
    folder: '',
    section: '',
    body: '',
    questionLink: '',
    videoLink: '',
    tags: '',
    difficulty: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setBody = (v) => setForm((f) => ({ ...f, body: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('files', f));
      const { data } = await api.post('/content', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  const isDSA = form.module === 'DSA';
  const isPaper = ['Paper 1', 'Paper 2'].includes(form.module);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass rounded-2xl w-full max-w-2xl my-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display font-bold text-lg">Add New Content</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400 border border-red-900" style={{ background: '#2d0a0a' }}>{error}</div>
          )}

          {/* Module + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Module</label>
              <select className="input-dark" value={form.module} onChange={set('module')}>
                {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Type</label>
              <select className="input-dark" value={form.type} onChange={set('type')}>
                <option value="note">📝 Note</option>
                <option value="question">❓ Question</option>
                <option value="file">📎 File Upload</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Title *</label>
            <input className="input-dark" placeholder="Enter title..." value={form.title} onChange={set('title')} required />
          </div>

          {/* Context fields */}
          <div className="grid grid-cols-2 gap-3">
            {isDSA && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Folder (e.g. Arrays)</label>
                <input className="input-dark" placeholder="Arrays, Trees, Graphs..." value={form.folder} onChange={set('folder')} />
              </div>
            )}
            {!isDSA && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Category</label>
                <input className="input-dark" placeholder="Awards, Sports, History..." value={form.category} onChange={set('category')} />
              </div>
            )}
            {isPaper && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Section (e.g. OS, DBMS)</label>
                <input className="input-dark" placeholder="COA, Algorithms, DBMS..." value={form.section} onChange={set('section')} />
              </div>
            )}
            {form.type === 'question' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Difficulty</label>
                <select className="input-dark" value={form.difficulty} onChange={set('difficulty')}>
                  <option value="">None</option>
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>
            )}
          </div>

          {/* Links for questions */}
          {form.type === 'question' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Problem Link</label>
                <input className="input-dark" type="url" placeholder="https://leetcode.com/..." value={form.questionLink} onChange={set('questionLink')} />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Video Link</label>
                <input className="input-dark" type="url" placeholder="https://youtube.com/..." value={form.videoLink} onChange={set('videoLink')} />
              </div>
            </div>
          )}

          {/* Rich editor */}
          {form.type !== 'file' && (
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                {form.type === 'note' ? 'Notes Content' : 'Solution / Notes'}
              </label>
              <RichEditor value={form.body} onChange={setBody} />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Tags (comma-separated)</label>
            <input className="input-dark" placeholder="array, two-pointer, sorting..." value={form.tags} onChange={set('tags')} />
          </div>

          {/* File upload */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Upload Files (PDF/Images)</label>
            <div
              className="border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-indigo-500/50"
              style={{ borderColor: '#1e293b' }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={20} color="#4b5563" className="mx-auto mb-1.5" />
              <p className="text-sm text-slate-500">Click to upload PDF or images</p>
              <p className="text-xs text-slate-600 mt-0.5">Max 20MB per file</p>
              <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files))} />
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400 px-3 py-1.5 rounded-lg" style={{ background: '#0f172a' }}>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-slate-600">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <X size={13} color="#4b5563" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <><Plus size={16} /><span>Save Content</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
