import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Menu, Flame, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopNavbar() {
  const { state, dispatch, streak, levelInfo } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="h-16 glass border-b border-surface-200/50 dark:border-surface-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">
            Welcome back, {state.user?.name || 'Student'}
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {levelInfo.title} - Level {levelInfo.level}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Badge - Animated */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 border border-amber-500/20"
        >
          <motion.div
            animate={streak.current >= 7 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className={`w-4 h-4 ${streak.current >= 7 ? 'text-orange-500' : 'text-amber-500'}`} />
          </motion.div>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{streak.current}</span>
          <span className="text-xs text-amber-600/70 dark:text-amber-400/70 hidden sm:inline">day streak</span>
        </motion.div>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] flex items-center justify-center font-bold shadow-lg shadow-rose-500/30"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-12 w-80 glass-card p-4 shadow-xl border border-surface-200/50 dark:border-surface-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <p className="text-xs text-surface-500 text-center py-4">No notifications yet</p>
                  ) : (
                    state.notifications.slice(0, 10).map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                          n.read
                            ? 'bg-surface-50 dark:bg-surface-800/50'
                            : 'bg-primary-50 dark:bg-primary-500/10 border-l-2 border-primary-500'
                        }`}
                      >
                        <p className="text-xs font-medium text-surface-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{n.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
