import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, Clock, BookOpen, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId, nowISO } from '../utils/storage';
import { generatePlannerSlots, calculatePriorityScore, getSubjectColor } from '../utils/helpers';
import type { Subject } from '../utils/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Planner() {
  const { state, dispatch } = useApp();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [availableHours, setAvailableHours] = useState(6);
  const [form, setForm] = useState({ name: '', weaknessLevel: 3, deadline: '', examDate: '' });

  const handleAddSubject = () => {
    if (!form.name.trim()) return;
    const subject: Subject = {
      id: generateId(),
      name: form.name.trim(),
      weaknessLevel: form.weaknessLevel,
      deadline: form.deadline || undefined,
      examDate: form.examDate || undefined,
      color: getSubjectColor(state.subjects.length),
    };
    dispatch({ type: 'ADD_SUBJECT', payload: subject });
    // Auto-sync deadline and exam date to calendar
    if (subject.deadline) {
      dispatch({
        type: 'ADD_CALENDAR_EVENT',
        payload: { id: generateId(), title: `${subject.name} Deadline`, date: subject.deadline, type: 'deadline', subjectId: subject.id },
      });
    }
    if (subject.examDate) {
      dispatch({
        type: 'ADD_CALENDAR_EVENT',
        payload: { id: generateId(), title: `${subject.name} Exam`, date: subject.examDate, type: 'exam', subjectId: subject.id },
      });
    }
    setForm({ name: '', weaknessLevel: 3, deadline: '', examDate: '' });
    setShowAddSubject(false);
    toast.success('Subject added');
  };

  const handleEditSubject = () => {
    if (!editSubject || !form.name.trim()) return;
    dispatch({
      type: 'UPDATE_SUBJECT',
      payload: {
        ...editSubject,
        name: form.name.trim(),
        weaknessLevel: form.weaknessLevel,
        deadline: form.deadline || undefined,
        examDate: form.examDate || undefined,
      },
    });
    setEditSubject(null);
    setForm({ name: '', weaknessLevel: 3, deadline: '', examDate: '' });
    toast.success('Subject updated');
  };

  const startEdit = (s: Subject) => {
    setEditSubject(s);
    setForm({ name: s.name, weaknessLevel: s.weaknessLevel, deadline: s.deadline || '', examDate: s.examDate || '' });
  };

  const generateSchedule = () => {
    if (state.subjects.length === 0) {
      toast.error('Add at least one subject first');
      return;
    }
    const slots = generatePlannerSlots(state.subjects, availableHours);
    dispatch({ type: 'SET_PLANNER_SLOTS', payload: slots });
    toast.success('AI schedule generated!');
  };

  const openAdd = () => {
    setForm({ name: '', weaknessLevel: 3, deadline: '', examDate: '' });
    setShowAddSubject(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Smart Planner</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">AI-powered study schedule generator</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 glass-card px-3 py-2">
              <Clock className="w-4 h-4 text-surface-400" />
              <input type="number" min={1} max={16} value={availableHours}
                onChange={e => setAvailableHours(parseInt(e.target.value) || 1)}
                className="w-12 bg-transparent text-sm font-medium text-surface-900 dark:text-white focus:outline-none" />
              <span className="text-xs text-surface-400">hrs/week</span>
            </div>
            <button onClick={generateSchedule}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all">
              <Sparkles className="w-4 h-4" /> Generate Schedule
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subjects */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-500" /> Subjects
          </h2>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </button>
        </div>

        {state.subjects.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-400">Add subjects to generate your AI study plan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.subjects.map(s => {
              const priority = calculatePriorityScore(s);
              return (
                <motion.div key={s.id} layout className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <h3 className="text-sm font-medium text-surface-900 dark:text-white">{s.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(s)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => { dispatch({ type: 'DELETE_SUBJECT', payload: s.id }); toast.success('Subject removed'); }}
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-surface-400 hover:text-rose-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-400">Weakness</span>
                      <span className="text-surface-600 dark:text-surface-300">{s.weaknessLevel}/5</span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1">
                      <div className="h-1 rounded-full" style={{
                        width: `${s.weaknessLevel * 20}%`,
                        backgroundColor: s.color,
                      }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-400">Priority Score</span>
                      <span className={`font-medium ${priority > 70 ? 'text-rose-500' : priority > 40 ? 'text-amber-500' : 'text-accent-500'}`}>{priority}</span>
                    </div>
                    {s.deadline && (
                      <p className="text-[10px] text-surface-400">Deadline: {s.deadline}</p>
                    )}
                    {s.examDate && (
                      <p className="text-[10px] text-surface-400">Exam: {s.examDate}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generated Schedule */}
      {state.plannerSlots.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary-500" /> AI-Generated Weekly Schedule
          </h2>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              {DAYS.map(day => {
                const daySlots = state.plannerSlots.filter(s => s.day === day);
                return (
                  <div key={day}>
                    <h3 className="text-xs font-medium text-surface-500 dark:text-surface-400 text-center mb-2">{day}</h3>
                    <div className="space-y-1.5">
                      {daySlots.map(slot => {
                        const subject = state.subjects.find(s => s.id === slot.subjectId);
                        const isBreak = slot.type === 'break';
                        return (
                          <div key={slot.id} className={`p-2 rounded-lg text-xs ${
                            isBreak
                              ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 border border-dashed border-surface-300 dark:border-surface-600'
                              : 'bg-surface-50 dark:bg-surface-800/80 border border-surface-200/50 dark:border-surface-700/50'
                          }`}>
                            {!isBreak && (
                              <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: subject?.color || '#999' }} />
                            )}
                            <p className={`font-medium ${isBreak ? 'text-surface-400' : 'text-surface-700 dark:text-surface-300'}`}>
                              {isBreak ? 'Break' : subject?.name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-surface-400">{slot.startTime} - {slot.duration}min</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Subject Modal */}
      <AnimatePresence>
        {(showAddSubject || editSubject) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAddSubject(false); setEditSubject(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                  {editSubject ? 'Edit Subject' : 'Add Subject'}
                </h3>
                <button onClick={() => { setShowAddSubject(false); setEditSubject(null); }} className="text-surface-400 hover:text-surface-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Subject Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Mathematics" autoFocus />
                </div>
                <div>
                  <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Weakness Level: {form.weaknessLevel}/5</label>
                  <input type="range" min={1} max={5} value={form.weaknessLevel}
                    onChange={e => setForm(f => ({ ...f, weaknessLevel: parseInt(e.target.value) }))}
                    className="w-full accent-primary-500" />
                </div>
                <div>
                  <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Deadline (optional)</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Exam Date (optional)</label>
                  <input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={editSubject ? handleEditSubject : handleAddSubject}
                  className="w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
                  {editSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
