import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Search, Pencil, Check, X, BookOpen, Clock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId, nowISO } from '../utils/storage';

interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const NOTES_KEY = 'smartstudyos_notes';

function getNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export default function Notes() {
  const { state } = useApp();
  const [notes, setNotes] = useState<Note[]>(getNotes);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).slice(0, 20);
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    if (subjectFilter) {
      result = result.filter(n => n.subjectId === subjectFilter);
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, search, subjectFilter]);

  const resetForm = () => {
    setFormTitle('');
    setFormSubject('');
    setFormContent('');
    setFormTags('');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!formTitle.trim()) return;
    const note: Note = {
      id: generateId(),
      subjectId: formSubject,
      title: formTitle.trim(),
      content: formContent,
      tags: formTags
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(Boolean),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    const next = [note, ...notes];
    setNotes(next);
    saveNotes(next);
    toast.success('Note created');
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingId || !formTitle.trim()) return;
    const next = notes.map(n =>
      n.id === editingId
        ? {
            ...n,
            title: formTitle.trim(),
            subjectId: formSubject,
            content: formContent,
            tags: formTags
              .split(/[,\s]+/)
              .map(t => t.trim())
              .filter(Boolean),
            updatedAt: nowISO(),
          }
        : n,
    );
    setNotes(next);
    saveNotes(next);
    toast.success('Note updated');
    resetForm();
  };

  const handleDelete = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveNotes(next);
    toast.success('Note deleted');
  };

  const startEdit = (note: Note) => {
    setFormTitle(note.title);
    setFormSubject(note.subjectId);
    setFormContent(note.content);
    setFormTags(note.tags.join(', '));
    setEditingId(note.id);
    setIsCreating(true);
  };

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const activeForm = isCreating || editingId;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Study Notes</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {notes.length} note{notes.length !== 1 ? 's' : ''} across your subjects
            </p>
          </div>
          <button
            onClick={() => {
              if (activeForm) {
                resetForm();
              } else {
                setIsCreating(true);
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
              activeForm
                ? 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                : 'gradient-primary text-white shadow-primary-500/25 hover:shadow-xl'
            }`}
          >
            {activeForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {activeForm ? 'Cancel' : 'New Note'}
          </button>
        </div>
      </motion.div>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {activeForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Title</label>
                  <input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Subject</label>
                  <select
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">General</option>
                    {state.subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Content</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Write your notes here..."
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">
                  Tags (comma separated)
                </label>
                <input
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="e.g., formulas, exam-prep, chapter-3"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={!formTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {editingId ? <Pencil className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="">All Subjects</option>
          {state.subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSearch(prev => (prev === tag ? '' : tag))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                search === tag
                  ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              <Tag className="w-3 h-3 inline mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-surface-400" />
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            {notes.length === 0 ? 'Start by creating your first study note.' : 'No notes match your search.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(note => {
              const subject = state.subjects.find(s => s.id === note.subjectId);
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-5 hover:shadow-xl transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">{note.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-surface-400">
                          {subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {subject.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-surface-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-300 whitespace-pre-wrap line-clamp-5 mb-3">
                    {note.content}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
