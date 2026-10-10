import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Target, Calendar, BarChart3, Zap, Clock, Flame,
  CheckCircle2, ArrowRight, Sparkles, BookOpen, Timer, TrendingUp,
  Sun, Moon, Shield, Lock, ChevronDown, Download, Puzzle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  {
    icon: Brain,
    title: 'AI Study Coach',
    description: 'Get personalized study tips powered by Gemini AI. Ask questions, get advice, and improve your learning strategy.',
    color: 'primary',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Built-in focus timer with break reminders. Track your concentration and build better study habits.',
    color: 'accent',
  },
  {
    icon: Calendar,
    title: 'Smart Planner',
    description: 'AI-generated study schedules based on your subjects, deadlines, and weak areas.',
    color: 'amber',
  },
  {
    icon: Flame,
    title: 'Streak Tracking',
    description: 'Build consistency with daily streaks. Watch your progress grow day by day.',
    color: 'rose',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Detailed insights into your productivity, time allocation, and learning patterns.',
    color: 'cyan',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set daily study targets and track your progress toward academic success.',
    color: 'violet',
  },
];

const stats = [
  { value: '100%', label: 'Free to Use' },
  { value: 'AI', label: 'Powered' },
  { value: 'Local', label: 'Data Storage' },
  { value: '24/7', label: 'Available' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const handleGetStarted = () => {
    navigate('/onboard');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900 dark:text-white">Smart StudyOS</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })}
                className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative">
            {/* Background gradient orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Study Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white mb-6 leading-tight">
                Your Personal
                <span className="text-gradient block">Study Operating System</span>
              </h1>

              <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-8">
                Plan, focus, and achieve your academic goals with AI-powered study schedules,
                streak tracking, and productivity insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-medium shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-all"
                >
                  Start for Free <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
                >
                  Learn More <ChevronDown className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 rounded-3xl blur-2xl" />
            <div className="relative glass-card overflow-hidden">
              <div className="h-12 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-accent-500" />
                </div>
              </div>
              <div className="p-6 bg-surface-100 dark:bg-surface-900">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    { icon: Clock, label: 'Daily Progress', value: '75%', color: 'primary' },
                    { icon: Flame, label: 'Streak', value: '12 days', color: 'amber' },
                    { icon: TrendingUp, label: 'Productivity', value: '85/100', color: 'accent' },
                    { icon: Zap, label: 'Level', value: 'Study Master', color: 'violet' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={`w-4 h-4 ${
                          item.color === 'primary' ? 'text-primary-500' :
                          item.color === 'amber' ? 'text-amber-500' :
                          item.color === 'accent' ? 'text-accent-500' :
                          'text-violet-500'
                        }`} />
                        <span className="text-xs text-surface-500">{item.label}</span>
                      </div>
                      <div className="text-lg font-bold text-surface-900 dark:text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                    <div className="text-xs text-surface-500 mb-2">AI Coach</div>
                    <div className="h-16 bg-primary-50 dark:bg-primary-500/10 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                    <div className="text-xs text-surface-500 mb-2">Tasks</div>
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-3 bg-surface-100 dark:bg-surface-700 rounded" style={{ width: `${80 - i * 15}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                    <div className="text-xs text-surface-500 mb-2">Focus Timer</div>
                    <div className="flex items-center justify-center h-16">
                      <div className="w-12 h-12 rounded-full border-4 border-primary-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-500">25:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              A complete study productivity suite designed to help you learn smarter, not harder.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'primary' ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' :
                  feature.color === 'accent' ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400' :
                  feature.color === 'amber' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                  feature.color === 'rose' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                  feature.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' :
                  'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                } group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-100/50 dark:bg-surface-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400">
              Get started in minutes with three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Add Your Subjects', description: 'Enter the subjects you need to study and rate your weakness level for each.', icon: BookOpen },
              { step: 2, title: 'Generate AI Schedule', description: 'Let AI create a personalized study plan based on your goals and deadlines.', icon: Sparkles },
              { step: 3, title: 'Track & Improve', description: 'Use the focus timer, track streaks, and watch your productivity soar.', icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="glass-card p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-surface-300 dark:text-surface-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
              Your Data Stays With You
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-xl mx-auto">
              All your study data, streaks, and progress are stored locally in your browser.
              Nothing is sent to external servers. Your privacy is protected.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: 'Local Storage' },
                { icon: CheckCircle2, label: 'No Tracking' },
                { icon: Shield, label: 'Private by Design' },
                { icon: Zap, label: 'Fast & Free' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
                  <item.icon className="w-4 h-4 text-accent-500" />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-xl opacity-25" />
            <div className="relative glass-card p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                Ready to Transform Your Study Habits?
              </h2>
              <p className="text-lg text-surface-500 dark:text-surface-400 mb-8">
                Join thousands of students who are already studying smarter with Smart StudyOS.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-medium shadow-xl shadow-primary-500/25 hover:shadow-2xl transition-all"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Browser Extension Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-100/50 dark:bg-surface-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-sm font-medium mb-4">
              <Puzzle className="w-4 h-4" />
              Browser Extension
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Study Anytime, Anywhere
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              Install our browser extension for quick access to the Pomodoro timer, task management, and AI coaching right from your browser toolbar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Quick Timer Access</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">One-click from toolbar</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Pomodoro, Extended, or Custom modes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Desktop notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Syncs with web app data
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-accent-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">AI Coach On Demand</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Ask study questions instantly</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Gemini AI integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Quick task creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                  Real-time progress sync
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-medium text-surface-900 dark:text-white">Smart StudyOS Extension</span>
              </div>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/downloads/aranya-vij-smart-studyos-extension.zip"
                download="aranya-vij-smart-studyos-extension.zip"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25"
              >
                <Download className="w-4 h-4" />
                Download for Chrome
              </motion.a>
            </div>
            <p className="text-xs text-surface-400 mt-3">
              Compatible with Chrome, Edge, and other Chromium browsers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-surface-700 dark:text-surface-300">Smart StudyOS</span>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Your AI-powered study companion
          </p>
        </div>
      </footer>
    </div>
  );
}
