import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  UserProfile, Subject, Task, FocusSession, StudyDay,
  PlannerSlot, Badge, XPEvent, CalendarEvent, AICoachSuggestion, AppNotification,
} from '../utils/types';
import { getItem, setItem, clearAll } from '../utils/storage';
import {
  calculateProductivityScore, getStreak, getLevelInfo,
  checkAndAwardBadges, generateSuggestions, awardXP, ALL_BADGES,
} from '../utils/helpers';

interface AppState {
  user: UserProfile | null;
  subjects: Subject[];
  tasks: Task[];
  focusSessions: FocusSession[];
  studyDays: StudyDay[];
  plannerSlots: PlannerSlot[];
  badges: Badge[];
  xpEvents: XPEvent[];
  calendarEvents: CalendarEvent[];
  suggestions: AICoachSuggestion[];
  notifications: AppNotification[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isOnboarded: boolean;
}

type Action =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: Task['status'] } }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'SET_STUDY_DAYS'; payload: StudyDay[] }
  | { type: 'SET_PLANNER_SLOTS'; payload: PlannerSlot[] }
  | { type: 'ADD_XP'; payload: XPEvent }
  | { type: 'ADD_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_CALENDAR_EVENT'; payload: string }
  | { type: 'DISMISS_SUGGESTION'; payload: string }
  | { type: 'REFRESH_SUGGESTIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isOnboarded: true };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        ),
      };
    case 'ADD_FOCUS_SESSION':
      return { ...state, focusSessions: [...state.focusSessions, action.payload] };
    case 'SET_STUDY_DAYS':
      return { ...state, studyDays: action.payload };
    case 'SET_PLANNER_SLOTS':
      return { ...state, plannerSlots: action.payload };
    case 'ADD_XP':
      return { ...state, xpEvents: [...state.xpEvents, action.payload] };
    case 'ADD_CALENDAR_EVENT':
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case 'UPDATE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: state.calendarEvents.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_CALENDAR_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) };
    case 'DISMISS_SUGGESTION':
      return {
        ...state,
        suggestions: state.suggestions.map(s =>
          s.id === action.payload ? { ...s, dismissed: true } : s
        ),
      };
    case 'REFRESH_SUGGESTIONS':
      return { ...state, suggestions: generateSuggestions(state.subjects, state.tasks, getStreak(state.studyDays).current, state.focusSessions) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 20) };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'RESET_ALL':
      clearAll();
      return { ...initialState, theme: state.theme };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  user: null,
  subjects: [],
  tasks: [],
  focusSessions: [],
  studyDays: [],
  plannerSlots: [],
  badges: [],
  xpEvents: [],
  calendarEvents: [],
  suggestions: [],
  notifications: [],
  theme: 'dark',
  sidebarOpen: true,
  isOnboarded: false,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  productivityScore: number;
  streak: { current: number; best: number };
  totalXP: number;
  levelInfo: { level: number; title: string; progress: number };
  earnedBadges: Badge[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const theme = getItem<'light' | 'dark'>('theme', 'dark');
    const user = getItem<UserProfile | null>('user', null);
    const isOnboarded = !!user;
    return {
      ...initialState,
      user,
      isOnboarded,
      theme,
      subjects: getItem<Subject[]>('subjects', []),
      tasks: getItem<Task[]>('tasks', []),
      focusSessions: getItem<FocusSession[]>('focus_sessions', []),
      studyDays: getItem<StudyDay[]>('study_days', []),
      plannerSlots: getItem<PlannerSlot[]>('planner_slots', []),
      badges: getItem<Badge[]>('badges', []),
      xpEvents: getItem<XPEvent[]>('xp_events', []),
      calendarEvents: getItem<CalendarEvent[]>('calendar_events', []),
      suggestions: getItem<AICoachSuggestion[]>('suggestions', []),
      notifications: getItem<AppNotification[]>('notifications', []),
    };
  });

  // Persist state changes
  useEffect(() => { setItem('user', state.user); }, [state.user]);
  useEffect(() => { setItem('theme', state.theme); document.documentElement.classList.toggle('dark', state.theme === 'dark'); }, [state.theme]);
  useEffect(() => { setItem('subjects', state.subjects); }, [state.subjects]);
  useEffect(() => { setItem('tasks', state.tasks); }, [state.tasks]);
  useEffect(() => { setItem('focus_sessions', state.focusSessions); }, [state.focusSessions]);
  useEffect(() => { setItem('study_days', state.studyDays); }, [state.studyDays]);
  useEffect(() => { setItem('planner_slots', state.plannerSlots); }, [state.plannerSlots]);
  useEffect(() => { setItem('badges', state.badges); }, [state.badges]);
  useEffect(() => { setItem('xp_events', state.xpEvents); }, [state.xpEvents]);
  useEffect(() => { setItem('calendar_events', state.calendarEvents); }, [state.calendarEvents]);
  useEffect(() => { setItem('suggestions', state.suggestions); }, [state.suggestions]);
  useEffect(() => { setItem('notifications', state.notifications); }, [state.notifications]);

  // Check badges periodically
  useEffect(() => {
    const streak = getStreak(state.studyDays);
    const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
    const score = calculateProductivityScore(state.tasks, state.focusSessions, state.studyDays);
    const newBadges = checkAndAwardBadges(streak.current, completedTasks, state.focusSessions, score);

    const earnedIds = new Set(state.badges.filter(b => b.earnedAt).map(b => b.id));
    const freshBadges = newBadges.filter(b => !earnedIds.has(b.id));

    if (freshBadges.length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: { badges: [...state.badges.filter(b => b.earnedAt), ...newBadges] } });
    }
  }, [state.studyDays, state.tasks, state.focusSessions, state.badges]);

  const productivityScore = calculateProductivityScore(state.tasks, state.focusSessions, state.studyDays);
  const streak = getStreak(state.studyDays);
  const totalXP = state.xpEvents.reduce((sum, e) => sum + e.xp, 0);
  const levelInfo = getLevelInfo(totalXP);
  const earnedBadges = [...ALL_BADGES].map(b => {
    const earned = state.badges.find(eb => eb.id === b.id && eb.earnedAt);
    return earned ? { ...b, earnedAt: earned.earnedAt } : b;
  });

  return (
    <AppContext.Provider value={{ state, dispatch, productivityScore, streak, totalXP, levelInfo, earnedBadges }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
