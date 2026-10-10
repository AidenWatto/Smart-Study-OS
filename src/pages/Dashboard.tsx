import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Flame, Target, TrendingUp, AlertTriangle, CheckCircle2,
  Brain, BookOpen, Zap, ChevronRight, Send, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { calculateBurnoutIndicator } from '../utils/helpers';
import { todayStr } from '../utils/storage';
import { askGemini, canUseAI } from '../utils/ai';

function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        className="stroke-surface-200 dark:stroke-surface-700" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        className="stroke-primary-500" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
    </svg>
  );
}

const widgetDelay = (i: number) => ({ delay: i * 0.08 });

export default function Dashboard() {
  const { state, dispatch, productivityScore, streak, levelInfo, totalXP, earnedBadges } = useApp();
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const today = todayStr();
  const todayData = state.studyDays.find(d => d.date === today);
  const hoursStudied = todayData?.hoursStudied || 0;
  const dailyTarget = state.user?.dailyStudyTarget || 4;
  const progress = Math.min(100, Math.round((hoursStudied / dailyTarget) * 100));
  const burnout = calculateBurnoutIndicator(state.focusSessions, state.studyDays);
  const upcomingDeadlines = state.tasks
    .filter(t => t.status !== 'completed' && t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const activeSuggestions = state.suggestions.filter(s => !s.dismissed).slice(0, 3);
  const earnedCount = earnedBadges.filter(b => b.earnedAt).length;
  const aiLimit = canUseAI();

  const handleAskAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    const context = [
      `Student: ${state.user?.name || 'Unknown'}`,
      `Level: ${state.user?.academicLevel || 'Unknown'}`,
      `Subjects: ${state.subjects.map(s => `${s.name} (weakness: ${s.weaknessLevel}/5)`).join(', ') || 'None'}`,
      `Pending tasks: ${state.tasks.filter(t => t.status !== 'completed').length}`,
      `Streak: ${streak.current} days`,
      `Productivity score: ${productivityScore}/100`,
    ].join('. ');

    const result = await askGemini(aiInput.trim(), context);

    if (result.success && result.response) {
      setAiResponse(result.response);
    } else {
      setAiResponse(result.error || 'Something went wrong. Try the local recommendations below.');
      if (result.error?.includes('No API key')) {
        toast('Add a Gemini API key in Settings for AI features', { icon: '💡' });
      }
    }
    setAiLoading(false);
    setAiInput('');
  };

  const dismissSuggestion = (id: string) => {
    dispatch({ type: 'DISMISS_SUGGESTION', payload: id });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Top row - Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(0)}
          className="glass-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing progress={progress} size={72} strokeWidth={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5">Daily Progress</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white">{hoursStudied.toFixed(1)}h</p>
            <p className="text-xs text-surface-400">of {dailyTarget}h target</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(1)}
          className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-surface-500 dark:text-surface-400">Study Streak</span>
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{streak.current}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-surface-400">Best: {streak.best}</span>
            {streak.current >= 7 && <span className="text-xs text-amber-500 font-medium">On fire!</span>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(2)}
          className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <span className="text-xs text-surface-500 dark:text-surface-400">Productivity</span>
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{productivityScore}<span className="text-sm font-normal text-surface-400">/100</span></p>
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full gradient-accent transition-all duration-500" style={{ width: `${productivityScore}%` }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(3)}
          className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-500" />
            <span className="text-xs text-surface-500 dark:text-surface-400">{levelInfo.title}</span>
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-white">{totalXP} XP</p>
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full gradient-primary transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
          </div>
          <p className="text-[10px] text-surface-400 mt-1">Level {levelInfo.level} - {levelInfo.progress}% to next</p>
        </motion.div>
      </div>

      {/* Second row - Coach, Deadlines, Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Study Coach */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(4)}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">AI Study Coach</h3>
            <span className="text-[10px] text-surface-400 ml-auto">{aiLimit.remaining} queries left</span>
          </div>

          {/* AI Chat input */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text" value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAskAI(); }}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ask your AI coach..."
            />
            <button onClick={handleAskAI} disabled={aiLoading || !aiInput.trim()}
              className="p-2 rounded-lg gradient-primary text-white disabled:opacity-40 transition-opacity flex-shrink-0">
              {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-xs text-primary-700 dark:text-primary-300 mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3 h-3" />
                <span className="font-medium">AI Response</span>
              </div>
              {aiResponse}
            </div>
          )}

          {/* Local suggestions */}
          {activeSuggestions.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-[10px] text-surface-400 uppercase font-semibold">Smart Suggestions</p>
              {activeSuggestions.map(s => (
                <div key={s.id} className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2 ${
                  s.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                  s.type === 'encouragement' ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300' :
                  'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                }`}>
                  <span>{s.message}</span>
                  <button onClick={() => dismissSuggestion(s.id)} className="opacity-60 hover:opacity-100 flex-shrink-0">&times;</button>
                </div>
              ))}
            </div>
          )}

          {activeSuggestions.length === 0 && !aiResponse && (
            <div className="text-center py-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mx-auto mb-2">
                <Brain className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-xs text-surface-400">Add subjects and tasks to get personalized tips</p>
            </div>
          )}

          <Link to="/planner" className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 mt-3">
            View Planner <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(5)}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Upcoming Deadlines</h3>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <p className="text-xs text-surface-400">No upcoming deadlines</p>
              <Link to="/tasks" className="text-xs text-primary-500 hover:text-primary-600 mt-1 inline-block">Create a task</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-accent-500'
                      }`} />
                      <span className="text-xs text-surface-700 dark:text-surface-300 truncate">{t.title}</span>
                    </div>
                    <span className={`text-[10px] font-medium flex-shrink-0 ml-2 ${
                      daysLeft <= 0 ? 'text-rose-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-surface-400'
                    }`}>
                      {daysLeft <= 0 ? 'Overdue' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/tasks" className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 mt-3">
            View Tasks <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Burnout & Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(6)}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Wellness & Badges</h3>
          </div>
          <div className={`p-3 rounded-xl mb-3 ${
            burnout === 'healthy' ? 'bg-accent-50 dark:bg-accent-500/10' :
            burnout === 'moderate' ? 'bg-amber-50 dark:bg-amber-500/10' :
            'bg-rose-50 dark:bg-rose-500/10'
          }`}>
            <div className="flex items-center gap-2">
              {burnout === 'healthy' ? <CheckCircle2 className="w-4 h-4 text-accent-500" /> :
               burnout === 'moderate' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
               <AlertTriangle className="w-4 h-4 text-rose-500" />}
              <span className={`text-xs font-medium ${
                burnout === 'healthy' ? 'text-accent-700 dark:text-accent-300' :
                burnout === 'moderate' ? 'text-amber-700 dark:text-amber-300' :
                'text-rose-700 dark:text-rose-300'
              }`}>
                Burnout Risk: {burnout === 'healthy' ? 'Healthy' : burnout === 'moderate' ? 'Moderate' : 'High Risk'}
              </span>
            </div>
            {burnout === 'high-risk' && (
              <p className="text-[10px] mt-1.5 text-rose-600 dark:text-rose-400">Consider taking a break or reducing study hours.</p>
            )}
          </div>
          <div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
              Badges: {earnedCount}/{earnedBadges.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.slice(0, 8).map(b => (
                <div key={b.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                  b.earnedAt
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-300 dark:text-surface-600'
                }`} title={b.name}>
                  {b.earnedAt ? <Zap className="w-4 h-4" /> : <BookOpen className="w-3 h-3" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={widgetDelay(7)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/focus', icon: Clock, label: 'Start Focus', color: 'primary' },
          { to: '/tasks', icon: CheckCircle2, label: 'Add Task', color: 'accent' },
          { to: '/planner', icon: BookOpen, label: 'Plan Study', color: 'amber' },
          { to: '/analytics', icon: TrendingUp, label: 'View Stats', color: 'cyan' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:shadow-xl transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              a.color === 'primary' ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' :
              a.color === 'accent' ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400' :
              a.color === 'amber' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
              'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
            } group-hover:scale-110 transition-transform`}>
              <a.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{a.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
