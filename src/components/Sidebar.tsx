import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, BarChart3, Target, Brain,
  FileText, Settings, Code2, ListTodo, Sparkles, X,
  LinkIcon, BookOpen, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/planner', icon: Sparkles, label: 'Planner' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/focus', icon: Target, label: 'Focus Mode' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
  { to: '/resources', icon: LinkIcon, label: 'Resources' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/developer', icon: Code2, label: 'Developer' },
];

export default function Sidebar() {
  const { state, dispatch, streak, totalXP, levelInfo } = useApp();
  const { sidebarOpen } = state;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 left-0 h-full w-64 glass-sidebar z-50 flex flex-col py-5 px-3 lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-2 mb-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-base font-bold text-surface-900 dark:text-white leading-tight">Smart StudyOS</h1>
              <p className="text-[10px] text-surface-500 dark:text-surface-400 leading-tight">AI-Powered Productivity</p>
            </div>
          </motion.div>
          <button
            onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-2 mb-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10 border border-surface-200/50 dark:border-surface-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-500 dark:text-surface-400">Level {levelInfo.level}</span>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{levelInfo.progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-surface-500 dark:text-surface-400">{totalXP} XP</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" /> {streak.current} streak
              </span>
            </div>
          </div>
        </motion.div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) dispatch({ type: 'SET_SIDEBAR', payload: false });
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-primary-500/5 dark:from-primary-500/20 dark:to-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-500/20'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-500' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom AI indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 px-2"
        >
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/15 dark:to-accent-500/15 border border-primary-500/20">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <p className="text-xs font-medium text-surface-900 dark:text-white">AI Coach Ready</p>
              <p className="text-[10px] text-surface-500 dark:text-surface-400">Ask for study tips</p>
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
