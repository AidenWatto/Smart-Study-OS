import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon, Plus, Trash2, Search, ExternalLink, Clock, BookOpen,
  Globe, Video, File, GraduationCap, Check, X, Pencil, Tag, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId, nowISO } from '../utils/storage';

interface Resource {
  id: string;
  title: string;
  url: string;
  subjectId: string;
  type: 'article' | 'video' | 'course' | 'document' | 'other';
  tags: string[];
  visited: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const RESOURCES_KEY = 'smartstudyos_resources';

function getResources(): Resource[] {
  try {
    const raw = localStorage.getItem(RESOURCES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Resource[];
  } catch {
    return [];
  }
}

function saveResources(resources: Resource[]) {
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
}

const typeIcons = {
  article: Globe,
  video: Video,
  course: GraduationCap,
  document: File,
  other: LinkIcon,
};

const typeColors = {
  article: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  video: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  course: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  document: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  other: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300',
};

const priorityRings = {
  low: 'ring-1 ring-surface-200 dark:ring-surface-700',
  medium: 'ring-1 ring-amber-300 dark:ring-amber-500/40',
  high: 'ring-1 ring-rose-300 dark:ring-rose-500/40',
};

export default function Resources() {
  const { state } = useApp();
  const [resources, setResources] = useState<Resource[]>(getResources);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formType, setFormType] = useState<Resource['type']>('article');
  const [formTags, setFormTags] = useState('');
  const [formPriority, setFormPriority] = useState<Resource['priority']>('medium');

  const filtered = useMemo(() => {
    let result = resources;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    if (subjectFilter) {
      result = result.filter(r => r.subjectId === subjectFilter);
    }
    if (typeFilter) {
      result = result.filter(r => r.type === typeFilter);
    }
    return result.sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [resources, search, subjectFilter, typeFilter]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    resources.forEach(r => r.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).slice(0, 20);
  }, [resources]);

  const resetForm = () => {
    setFormTitle('');
    setFormUrl('');
    setFormSubject('');
    setFormType('article');
    setFormTags('');
    setFormPriority('medium');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!formTitle.trim() || !formUrl.trim()) return;
    const resource: Resource = {
      id: generateId(),
      title: formTitle.trim(),
      url: formUrl.trim(),
      subjectId: formSubject,
      type: formType,
      tags: formTags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean),
      visited: false,
      priority: formPriority,
      createdAt: nowISO(),
    };
    const next = [resource, ...resources];
    setResources(next);
    saveResources(next);
    toast.success('Resource saved');
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingId || !formTitle.trim() || !formUrl.trim()) return;
    const next = resources.map(r =>
      r.id === editingId
        ? {
            ...r,
            title: formTitle.trim(),
            url: formUrl.trim(),
            subjectId: formSubject,
            type: formType,
            tags: formTags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean),
            priority: formPriority,
          }
        : r,
    );
    setResources(next);
    saveResources(next);
    toast.success('Resource updated');
    resetForm();
  };

  const handleDelete = (id: string) => {
    const next = resources.filter(r => r.id !== id);
    setResources(next);
    saveResources(next);
    toast.success('Resource deleted');
  };

  const toggleVisited = (id: string) => {
    const next = resources.map(r => (r.id === id ? { ...r, visited: !r.visited } : r));
    setResources(next);
    saveResources(next);
  };

  const startEdit = (resource: Resource) => {
    setFormTitle(resource.title);
    setFormUrl(resource.url);
    setFormSubject(resource.subjectId);
    setFormType(resource.type);
    setFormTags(resource.tags.join(', '));
    setFormPriority(resource.priority);
    setEditingId(resource.id);
    setIsCreating(true);
  };

  useEffect(() => {
    saveResources(resources);
  }, [resources]);

  const activeForm = isCreating || editingId;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Study Resources</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {resources.length} resource{resources.length !== 1 ? 's' : ''} saved
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
            {activeForm ? 'Cancel' : 'Add Resource'}
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
                    placeholder="Resource title..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">URL</label>
                  <input
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as Resource['type'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="course">Course</option>
                    <option value="document">Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as Resource['priority'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Tags</label>
                <input
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="e.g., tutorial, exam, reference"
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
                  disabled={!formTitle.trim() || !formUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {editingId ? <Pencil className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
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
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="">All Types</option>
          <option value="article">Article</option>
          <option value="video">Video</option>
          <option value="course">Course</option>
          <option value="document">Document</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Tags */}
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

      {/* Resources List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-surface-400" />
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            {resources.length === 0 ? 'Save your first study resource link here.' : 'No resources match your filters.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(resource => {
              const subject = state.subjects.find(s => s.id === resource.subjectId);
              const Icon = typeIcons[resource.type];
              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-4 hover:shadow-xl transition-shadow group ${priorityRings[resource.priority]} ${
                    resource.visited ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[resource.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                            {subject && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {subject.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(resource.createdAt).toLocaleDateString()}
                            </span>
                            {resource.priority === 'high' && (
                              <span className="flex items-center gap-1 text-rose-500">
                                <Star className="w-3 h-3 fill-rose-500" />
                                High
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEdit(resource)}
                            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-surface-500 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open link
                        </a>
                        <button
                          onClick={() => toggleVisited(resource.id)}
                          className={`inline-flex items-center gap-1 text-xs transition-colors ${
                            resource.visited
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          {resource.visited ? 'Visited' : 'Mark visited'}
                        </button>
                      </div>
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map(t => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 text-xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
