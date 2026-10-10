import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/storage';
import type { CalendarEvent } from '../utils/types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_HEADER = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const typeColors: Record<string, string> = {
  exam: 'bg-rose-500', deadline: 'bg-amber-500', task: 'bg-primary-500', study: 'bg-accent-500',
};

export default function Calendar() {
  const { state, dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', type: 'task' as CalendarEvent['type'], description: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = useMemo(() => {
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: true });
    }
    // Next month days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
    }
    return days;
  }, [year, month, firstDay, daysInMonth, daysInPrevMonth]);

  const getEventsForDate = (date: string) => state.calendarEvents.filter(e => e.date === date);
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return;
    dispatch({
      type: 'ADD_CALENDAR_EVENT',
      payload: {
        id: generateId(),
        title: form.title.trim(),
        date: form.date,
        type: form.type,
        description: form.description,
      },
    });
    setForm({ title: '', date: '', type: 'task', description: '' });
    setShowAdd(false);
    toast.success('Event added');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Calendar</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Track exams, deadlines, and study sessions</p>
          </div>
          <button onClick={() => { setForm(f => ({ ...f, date: selectedDate || today })); setShowAdd(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 lg:col-span-2">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_HEADER.map(d => (
              <div key={d} className="text-center text-xs font-medium text-surface-400 py-1">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => {
              const events = getEventsForDate(d.date);
              const isToday = d.date === today;
              const isSelected = d.date === selectedDate;
              return (
                <button key={i} onClick={() => setSelectedDate(d.date)}
                  className={`relative p-1.5 rounded-lg text-xs transition-all min-h-[52px] flex flex-col ${
                    !d.isCurrentMonth ? 'text-surface-300 dark:text-surface-600' :
                    isSelected ? 'bg-primary-50 dark:bg-primary-500/15 ring-2 ring-primary-500/30 text-primary-600 dark:text-primary-400' :
                    isToday ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' :
                    'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}>
                  <span className={`text-[11px] ${isToday && !isSelected ? 'font-bold' : ''}`}>{d.day}</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {events.slice(0, 3).map(e => (
                      <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[e.type] || 'bg-surface-400'}`} />
                    ))}
                    {events.length > 3 && <span className="text-[8px] text-surface-400">+{events.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected day detail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalIcon className="w-4 h-4 text-primary-500" />
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
              {selectedDate ? new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
            </h2>
          </div>
          {selectedDate ? (
            selectedEvents.length === 0 ? (
              <div className="text-center py-6">
                <CalIcon className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-400">No events on this day</p>
                <button onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setShowAdd(true); }}
                  className="mt-2 text-xs text-primary-500 hover:text-primary-600">Add event</button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(e => (
                  <div key={e.id} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${typeColors[e.type]}`} />
                        <span className="text-sm font-medium text-surface-900 dark:text-white">{e.title}</span>
                      </div>
                      <button onClick={() => { dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: e.id }); toast.success('Event removed'); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-surface-400 hover:text-rose-500 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        e.type === 'exam' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                        e.type === 'deadline' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                        e.type === 'study' ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400' :
                        'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                      }`}>{e.type}</span>
                      {e.description && <span className="text-xs text-surface-400 truncate">{e.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-xs text-surface-400 text-center py-6">Click on a date to see events</p>
          )}
        </motion.div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Add Event</h3>
                <button onClick={() => setShowAdd(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Event title" autoFocus />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CalendarEvent['type'] }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="task">Task</option>
                      <option value="exam">Exam</option>
                      <option value="deadline">Deadline</option>
                      <option value="study">Study Session</option>
                    </select>
                  </div>
                </div>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Description (optional)" rows={2} />
                <button onClick={handleAdd}
                  className="w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
                  Add Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
