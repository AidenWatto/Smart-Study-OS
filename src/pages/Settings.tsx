import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Clock, Palette, Download, Upload, Trash2, Save, Sun, Moon,
  Key, AlertTriangle, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { exportAllData, importData, nowISO } from '../utils/storage';
import { canUseAI } from '../utils/ai';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.user?.name || '');
  const [academicLevel, setAcademicLevel] = useState(state.user?.academicLevel || '');
  const [target, setTarget] = useState(state.user?.dailyStudyTarget || 4);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('smartstudyos_gemini_key') || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    if (!name.trim()) return toast.error('Name is required');
    dispatch({
      type: 'SET_USER',
      payload: {
        name: name.trim(),
        academicLevel,
        dailyStudyTarget: target,
        createdAt: state.user?.createdAt || nowISO(),
      },
    });
    toast.success('Profile updated');
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartstudyos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleImportData = () => fileRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importData(text)) {
        toast.success('Data imported! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Invalid data file');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' });
    setShowResetConfirm(false);
    toast.success('All data reset');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleSaveGeminiKey = () => {
    localStorage.setItem('smartstudyos_gemini_key', geminiKey);
    toast.success(geminiKey ? 'Gemini API key saved' : 'Gemini API key removed');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Manage your profile and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Profile</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Academic Level</label>
            <select value={academicLevel} onChange={e => setAcademicLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="PhD">PhD</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1 block">Daily Study Target: {target}h</label>
            <input type="range" min={1} max={12} step={0.5} value={target}
              onChange={e => setTarget(parseFloat(e.target.value))}
              className="w-full accent-primary-500" />
          </div>
          <button onClick={handleSaveProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Theme</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              state.theme === 'light' ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 ring-2 ring-primary-500/30' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}>
            <Sun className="w-4 h-4" /> Light
          </button>
          <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              state.theme === 'dark' ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 ring-2 ring-primary-500/30' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}>
            <Moon className="w-4 h-4" /> Dark
          </button>
        </div>
      </motion.div>

      {/* Gemini API Key (optional) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-5 h-5 text-accent-500" />
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Gemini AI (Optional)</h2>
        </div>
        <p className="text-xs text-surface-400 mb-3">Add your free Gemini API key for AI-powered study advice. Get one at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Google AI Studio</a>.</p>
        <div className="flex items-center gap-2 mb-2">
          <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter API key" />
          <button onClick={handleSaveGeminiKey}
            className="px-4 py-2 rounded-lg bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-sm font-medium hover:bg-accent-100 dark:hover:bg-accent-500/20">
            Save
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <Zap className="w-3 h-3" />
          <span>{canUseAI().remaining}/20 AI queries remaining today</span>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-primary-500" />
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Data Management</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700">
              <Download className="w-4 h-4" /> Export Data
            </button>
            <button onClick={handleImportData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700">
              <Upload className="w-4 h-4" /> Import Data
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
            {!showResetConfirm ? (
              <button onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20">
                <Trash2 className="w-4 h-4" /> Reset All Data
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Are you sure? This cannot be undone.</p>
                </div>
                <button onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">
                  Confirm Reset
                </button>
                <button onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-sm font-medium">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
