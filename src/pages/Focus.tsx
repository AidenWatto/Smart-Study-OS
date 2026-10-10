import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Clock, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { generateId, nowISO } from '../utils/storage';
import { awardXP, recordStudyTime } from '../utils/helpers';
import type { FocusSession } from '../utils/types';

type Mode = '25/5' | '50/10' | 'custom';

const MODES: { id: Mode; work: number; break_: number; label: string }[] = [
  { id: '25/5', work: 25, break_: 5, label: '25/5' },
  { id: '50/10', work: 50, break_: 10, label: '50/10' },
  { id: 'custom', work: 45, break_: 10, label: 'Custom' },
];

export default function FocusMode() {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<Mode>('25/5');
  const [customWork, setCustomWork] = useState(45);
  const [customBreak, setCustomBreak] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string>('');

  const getWorkMin = () => mode === 'custom' ? customWork : MODES.find(m => m.id === mode)?.work ?? 25;
  const getBreakMin = () => mode === 'custom' ? customBreak : MODES.find(m => m.id === mode)?.break_ ?? 5;
  const workMinutes = getWorkMin();
  const breakMinutes = getBreakMin();

  const totalSeconds = (isBreak ? breakMinutes : workMinutes) * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isBreak ? 440 : 660;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* audio not available */ }
  }, [soundEnabled, isBreak]);

  const completeSession = useCallback(() => {
    const session: FocusSession = {
      id: generateId(),
      startTime: startTimeRef.current,
      endTime: nowISO(),
      duration: workMinutes,
      mode,
      completed: true,
    };
    dispatch({ type: 'ADD_FOCUS_SESSION', payload: session });
    recordStudyTime(workMinutes);
    const xp = awardXP('focus_session', `Completed ${workMinutes}-min focus session`);
    dispatch({ type: 'ADD_XP', payload: xp });
    toast.success(`+${xp.xp} XP! Focus session completed`);
    setSessionsCompleted(prev => prev + 1);
  }, [workMinutes, mode, dispatch]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (!isBreak) {
            completeSession();
            setIsBreak(true);
            playBeep();
            return breakMinutes * 60;
          } else {
            setIsBreak(false);
            setIsRunning(false);
            playBeep();
            return workMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isBreak, breakMinutes, workMinutes, completeSession, playBeep]);

  const start = () => {
    if (!isRunning) {
      startTimeRef.current = nowISO();
      setIsRunning(true);
    }
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(workMinutes * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const switchMode = (newMode: Mode) => {
    reset();
    setMode(newMode);
    const m = MODES.find(m => m.id === newMode);
    const work = newMode === 'custom' ? customWork : (m?.work ?? 25);
    setSecondsLeft(work * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFocusHours = state.focusSessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((sum, s) => sum + s.duration, 0) / 60;
  const todaySessions = state.focusSessions.filter(s => s.startTime.startsWith(todayStr)).length;
  const totalFocusHours = state.focusSessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  const circumference = 2 * Math.PI * 140;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Focus Mode</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Pomodoro timer to maximize your productivity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 lg:col-span-2 flex flex-col items-center">
          {/* Mode selector */}
          <div className="flex items-center gap-2 mb-6">
            {MODES.map(m => (
              <button key={m.id} onClick={() => switchMode(m.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === m.id
                    ? 'gradient-primary text-white shadow-lg shadow-primary-500/25'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && !isRunning && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-500" />
                <input type="number" min={5} max={120} value={customWork}
                  onChange={e => { const v = parseInt(e.target.value) || 25; setCustomWork(v); if (!isRunning) setSecondsLeft(v * 60); }}
                  className="w-16 px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-center text-surface-900 dark:text-white" />
                <span className="text-xs text-surface-400">min work</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-accent-500" />
                <input type="number" min={1} max={30} value={customBreak}
                  onChange={e => setCustomBreak(parseInt(e.target.value) || 5)}
                  className="w-16 px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-center text-surface-900 dark:text-white" />
                <span className="text-xs text-surface-400">min break</span>
              </div>
            </div>
          )}

          {/* Timer ring */}
          <div className="relative mb-6">
            <svg width="320" height="320" className="-rotate-90">
              <circle cx="160" cy="160" r="140" fill="none"
                className="stroke-surface-200 dark:stroke-surface-700" strokeWidth="8" />
              <circle cx="160" cy="160" r="140" fill="none"
                className={isBreak ? 'stroke-accent-500' : 'stroke-primary-500'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-surface-900 dark:text-white tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className={`text-sm font-medium mt-1 ${isBreak ? 'text-accent-500' : 'text-primary-500'}`}>
                {isBreak ? 'Break Time' : 'Focus Time'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={reset}
              className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={isRunning ? pause : start}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  : 'gradient-primary hover:shadow-primary-500/40 shadow-primary-500/25'
              }`}>
              {isRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
            </button>
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500">
              <span className="text-sm font-medium">{sessionsCompleted}</span>
              <span className="text-xs ml-1">done</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Today's Focus</h3>
            </div>
            <p className="text-3xl font-bold text-surface-900 dark:text-white">{todayFocusHours.toFixed(1)}h</p>
            <p className="text-xs text-surface-400 mt-1">{todaySessions} sessions</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">All Time</h3>
            </div>
            <p className="text-3xl font-bold text-surface-900 dark:text-white">{totalFocusHours.toFixed(1)}h</p>
            <p className="text-xs text-surface-400 mt-1">{state.focusSessions.length} total sessions</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-accent-500" />
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-surface-500 dark:text-surface-400">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">1.</span>
                Start with shorter sessions and gradually increase
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">2.</span>
                Remove distractions before starting your timer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">3.</span>
                Use breaks to stretch, hydrate, and rest your eyes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">4.</span>
                Aim for 3-4 sessions per study block for best results
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
