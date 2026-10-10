import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export default function Analytics() {
  const { state, productivityScore, streak, totalXP, levelInfo } = useApp();

  // Weekly study hours (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = state.studyDays.find(s => s.date === dateStr);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: dayData?.hoursStudied || 0,
        sessions: dayData?.focusSessions || 0,
      });
    }
    return days;
  }, [state.studyDays]);

  // Subject distribution
  const subjectData = useMemo(() => {
    return state.subjects.map(s => {
      const taskCount = state.tasks.filter(t => t.subjectId === s.id).length;
      const sessionCount = state.focusSessions.filter(f => f.subjectId === s.id).length;
      return {
        name: s.name,
        value: Math.max(1, taskCount + sessionCount),
        color: s.color,
      };
    });
  }, [state.subjects, state.tasks, state.focusSessions]);

  // Focus sessions per day (last 7)
  const focusData = useMemo(() => {
    return weeklyData.map(d => ({
      day: d.day,
      sessions: d.sessions,
    }));
  }, [weeklyData]);

  // Productivity trend (last 14 days)
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = state.studyDays.find(s => s.date === dateStr);
      const tasksCompleted = state.tasks.filter(t => t.completedAt?.startsWith(dateStr)).length;
      const hours = dayData?.hoursStudied || 0;
      days.push({
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.min(100, (hours / (state.user?.dailyStudyTarget || 4)) * 60 + tasksCompleted * 10),
        hours,
      });
    }
    return days;
  }, [state.studyDays, state.tasks, state.user]);

  const isDark = state.theme === 'dark';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Insights into your study patterns and progress</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Productivity', value: productivityScore, suffix: '/100', icon: TrendingUp, color: 'primary' },
          { label: 'Current Streak', value: streak.current, suffix: ' days', icon: Activity, color: 'amber' },
          { label: 'Total XP', value: totalXP, suffix: '', icon: BarChart3, color: 'accent' },
          { label: 'Level', value: levelInfo.level, suffix: ` - ${levelInfo.title}`, icon: Activity, color: 'primary' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${
                card.color === 'primary' ? 'text-primary-500' :
                card.color === 'amber' ? 'text-amber-500' : 'text-accent-500'
              }`} />
              <span className="text-xs text-surface-500 dark:text-surface-400">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{card.value}<span className="text-xs font-normal text-surface-400">{card.suffix}</span></p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Study Hours */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Weekly Study Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Subject Distribution</h3>
          </div>
          {subjectData.length === 0 ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-xs text-surface-400">Add subjects to see distribution</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Focus Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Focus Sessions</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={focusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="sessions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Productivity Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Productivity Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
