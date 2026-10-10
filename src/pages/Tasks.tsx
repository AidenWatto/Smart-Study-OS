import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId, nowISO, todayStr } from '../utils/storage';
import { awardXP, markTaskCompleted } from '../utils/helpers';
import type { Task } from '../utils/types';

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-surface-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'completed', label: 'Completed', color: 'bg-accent-500' },
];

export default function Tasks() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as Task['priority'],
    subjectId: '', dueDate: todayStr(),
  });

  const resetForm = () => setForm({ title: '', description: '', priority: 'medium', subjectId: '', dueDate: todayStr() });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const task: Task = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description,
      status: 'todo',
      priority: form.priority,
      subjectId: form.subjectId,
      dueDate: form.dueDate,
      createdAt: nowISO(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    // Also add calendar event
    dispatch({
      type: 'ADD_CALENDAR_EVENT',
      payload: {
        id: generateId(),
        title: form.title.trim(),
        date: form.dueDate,
        type: 'task' as const,
        subjectId: form.subjectId || undefined,
        description: form.description,
      },
    });
    resetForm();
    setShowAdd(false);
    toast.success('Task created');
  };

  const handleEdit = () => {
    if (!editingTask || !form.title.trim()) return;
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        ...editingTask,
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        subjectId: form.subjectId,
        dueDate: form.dueDate,
      },
    });
    setEditingTask(null);
    resetForm();
    toast.success('Task updated');
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      subjectId: task.subjectId,
      dueDate: task.dueDate,
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    const task = state.tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      if (newStatus === 'completed' && task.status !== 'completed') {
        dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: newStatus, completedAt: nowISO() } });
        markTaskCompleted(taskId);
        const xp = awardXP('task_complete', `Completed task: ${task.title}`);
        dispatch({ type: 'ADD_XP', payload: xp });
        toast.success(`+${xp.xp} XP! Task completed`);
      } else {
        dispatch({ type: 'MOVE_TASK', payload: { id: taskId, status: newStatus } });
      }
    }
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    toast.success('Task deleted');
  };

  const priorityColor = (p: Task['priority']) =>
    p === 'high' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' :
    p === 'medium' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
    'bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400';

  const TaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={`p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200/50 dark:border-surface-700/50 shadow-sm mb-2 group transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500/30' : ''}`}>
          <div className="flex items-start gap-2">
            <GripVertical className="w-3.5 h-3.5 text-surface-300 dark:text-surface-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{task.title}</p>
              {task.description && (
                <p className="text-xs text-surface-400 mt-0.5 truncate">{task.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.subjectId && (() => {
                  const s = state.subjects.find(sub => sub.id === task.subjectId);
                  return s ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-surface-100 dark:bg-surface-700 text-surface-500">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                  ) : null;
                })()}
                <span className="text-[10px] text-surface-400">{task.dueDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(task)} className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-surface-400 hover:text-rose-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Tasks</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Manage your assignments and deadlines</p>
          </div>
          <button onClick={() => { resetForm(); setShowAdd(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const columnTasks = state.tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h2 className="text-sm font-semibold text-surface-900 dark:text-white">{col.label}</h2>
                  <span className="text-xs text-surface-400 ml-auto">{columnTasks.length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`min-h-[120px] rounded-xl p-1 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''
                      }`}>
                      {columnTasks.map((task, i) => (
                        <TaskCard key={task.id} task={task} index={i} />
                      ))}
                      {provided.placeholder}
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-surface-300 dark:border-surface-600">
                          <p className="text-xs text-surface-400">Drop tasks here</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAdd || editingTask) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAdd(false); setEditingTask(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button onClick={() => { setShowAdd(false); setEditingTask(null); }} className="text-surface-400 hover:text-surface-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task title" autoFocus />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Description (optional)" rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 mb-1 block">Subject</label>
                    <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">No subject</option>
                      {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-surface-500 mb-1 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={editingTask ? handleEdit : handleAdd}
                  className="w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
