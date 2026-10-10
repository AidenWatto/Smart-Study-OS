import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, User, GraduationCap, Clock, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateId, nowISO } from '../utils/storage';

const academicLevels = ['High School', 'Undergraduate', 'Graduate', 'PhD', 'Professional'];

export default function Onboarding() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [target, setTarget] = useState(4);

  const handleFinish = () => {
    if (!name.trim() || !level) return;
    dispatch({
      type: 'SET_USER',
      payload: {
        name: name.trim(),
        academicLevel: level,
        dailyStudyTarget: target,
        createdAt: nowISO(),
      },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: generateId(),
        title: 'Welcome to Smart StudyOS!',
        message: 'Start by adding subjects in the Planner, then generate your AI study schedule.',
        type: 'success',
        timestamp: nowISO(),
        read: false,
      },
    });
    dispatch({ type: 'REFRESH_SUGGESTIONS' });
  };

  const steps = [
    // Welcome
    <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
      <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
        <Brain className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Smart StudyOS</h1>
      <p className="text-surface-500 dark:text-surface-400 mb-2">AI-Powered Academic Productivity</p>
      <p className="text-sm text-surface-400 dark:text-surface-500 max-w-md mx-auto mb-8">
        Your personal study companion that helps you plan, focus, and achieve your academic goals with intelligent recommendations.
      </p>
      <button
        onClick={() => setStep(1)}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
      >
        Get Started <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>,

    // Name
    <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-500/20 mx-auto flex items-center justify-center mb-6">
        <User className="w-7 h-7 text-primary-600 dark:text-primary-400" />
      </div>
      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">What's your name?</h2>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">We'll personalize your experience</p>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
        className="w-full px-4 py-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all mb-4"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(2); }}
      />
      <button
        onClick={() => setStep(2)}
        disabled={!name.trim()}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>,

    // Academic Level
    <motion.div key="level" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-500/20 mx-auto flex items-center justify-center mb-6">
        <GraduationCap className="w-7 h-7 text-accent-600 dark:text-accent-400" />
      </div>
      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Academic Level</h2>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">Helps us tailor your study plans</p>
      <div className="space-y-2 mb-4">
        {academicLevels.map(l => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
              level === l
                ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border-2 border-primary-500/30'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-2 border-transparent hover:border-surface-300 dark:hover:border-surface-600'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <button
        onClick={() => setStep(3)}
        disabled={!level}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>,

    // Daily Target
    <motion.div key="target" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 mx-auto flex items-center justify-center mb-6">
        <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Daily Study Target</h2>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">How many hours do you aim to study daily?</p>
      <div className="mb-6">
        <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{target}h</div>
        <input
          type="range"
          min={1}
          max={12}
          step={0.5}
          value={target}
          onChange={e => setTarget(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-200 dark:bg-surface-700 accent-primary-500"
        />
        <div className="flex justify-between text-xs text-surface-400 mt-1">
          <span>1h</span>
          <span>6h</span>
          <span>12h</span>
        </div>
      </div>
      <button
        onClick={handleFinish}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-accent text-white font-medium shadow-lg shadow-accent-500/25 hover:shadow-xl transition-all duration-300"
      >
        <Sparkles className="w-4 h-4" /> Launch Smart StudyOS
      </button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-primary-500' : 'w-4 bg-surface-300 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
