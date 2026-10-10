import type { Task, Subject, FocusSession, StudyDay, Badge, XPEvent } from './types';
import { getItem, setItem, todayStr, generateId, nowISO } from './storage';

const SUBJECT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
];

export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

export function calculateProductivityScore(
  tasks: Task[],
  sessions: FocusSession[],
  studyDays: StudyDay[]
): number {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length || 1;
  const taskScore = (completedTasks / totalTasks) * 40;

  const completedSessions = sessions.filter(s => s.completed).length;
  const sessionScore = Math.min(completedSessions / 20, 1) * 30;

  const recentDays = studyDays.slice(-7);
  const consistencyScore = recentDays.length >= 5 ? 30 : (recentDays.length / 5) * 30;

  return Math.round(Math.min(taskScore + sessionScore + consistencyScore, 100));
}

export function calculateBurnoutIndicator(
  sessions: FocusSession[],
  studyDays: StudyDay[]
): 'healthy' | 'moderate' | 'high-risk' {
  const today = todayStr();
  const lastWeekDays = studyDays.filter(d => {
    const diff = (new Date(today).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const avgHours = lastWeekDays.reduce((sum, d) => sum + d.hoursStudied, 0) / (lastWeekDays.length || 1);

  const consecutiveDays = studyDays.filter(d => {
    const diff = (new Date(today).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && d.hoursStudied > 8;
  }).length;

  if (consecutiveDays >= 3 || avgHours > 10) return 'high-risk';
  if (avgHours > 6 || consecutiveDays >= 2) return 'moderate';
  return 'healthy';
}

export function calculatePriorityScore(subject: Subject): number {
  let score = 0;
  const now = new Date();

  if (subject.deadline) {
    const daysUntilDeadline = Math.max(0,
      (new Date(subject.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, (14 - daysUntilDeadline) / 14) * 40;
  }

  score += (subject.weaknessLevel / 5) * 35;

  if (subject.examDate) {
    const daysUntilExam = Math.max(0,
      (new Date(subject.examDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, (30 - daysUntilExam) / 30) * 25;
  }

  return Math.round(Math.min(score, 100));
}

export function generatePlannerSlots(subjects: Subject[], availableHours: number): import('./types').PlannerSlot[] {
  const slots: import('./types').PlannerSlot[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const prioritized = subjects
    .map(s => ({ ...s, priority: calculatePriorityScore(s) }))
    .sort((a, b) => b.priority - a.priority);

  const totalPriority = prioritized.reduce((sum, s) => sum + s.priority, 0) || 1;

  prioritized.forEach((subject, si) => {
    const hoursForSubject = (subject.priority / totalPriority) * availableHours;
    const slotsPerWeek = Math.max(1, Math.round(hoursForSubject));
    const slotsPerDay = Math.ceil(slotsPerWeek / 7);

    let assigned = 0;
    days.forEach((day, di) => {
      if (assigned >= slotsPerWeek) return;
      const isWeekend = di >= 5;
      if (isWeekend && assigned > slotsPerWeek * 0.7) return;

      slots.push({
        id: generateId(),
        subjectId: subject.id,
        day,
        startTime: `${9 + (si * 2) % 8}:00`,
        duration: Math.max(30, Math.round((hoursForSubject / slotsPerWeek) * 60)),
        priority: subject.priority,
        type: subject.weaknessLevel >= 4 ? 'revision' : 'study',
      });
      assigned++;
    });
  });

  // Add breaks
  days.forEach(day => {
    const daySlots = slots.filter(s => s.day === day);
    if (daySlots.length >= 2) {
      const midIndex = Math.floor(daySlots.length / 2);
      slots.push({
        id: generateId(),
        subjectId: 'break',
        day,
        startTime: `${12}:00`,
        duration: 15,
        priority: 0,
        type: 'break',
      });
    }
  });

  return slots.sort((a, b) => {
    const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getStreak(studyDays: StudyDay[]): { current: number; best: number } {
  const sorted = [...studyDays].sort((a, b) => b.date.localeCompare(a.date));
  let current = 0;
  let best = 0;
  let tempStreak = 0;
  const today = todayStr();

  // Calculate current streak
  let checkDate = new Date(today);
  for (const day of sorted) {
    const dayStr = day.date;
    const expectedStr = checkDate.toISOString().split('T')[0];
    if (dayStr === expectedStr && day.hoursStudied > 0) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dayStr < expectedStr) {
      break;
    }
  }

  // Calculate best streak
  tempStreak = 0;
  const dateSorted = [...studyDays].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < dateSorted.length; i++) {
    if (dateSorted[i].hoursStudied > 0) {
      tempStreak++;
      best = Math.max(best, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current, best: Math.max(best, current) };
}

export function getLevelInfo(totalXP: number): { level: number; title: string; progress: number } {
  const levels = [
    { title: 'Beginner', xp: 0 },
    { title: 'Consistent Learner', xp: 500 },
    { title: 'Study Master', xp: 1500 },
    { title: 'Academic Beast', xp: 4000 },
    { title: 'Elite Scholar', xp: 10000 },
  ];

  let level = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].xp) {
      level = i;
      break;
    }
  }

  const currentLevelXP = levels[level].xp;
  const nextLevelXP = levels[Math.min(level + 1, levels.length - 1)].xp;
  const progress = level === levels.length - 1
    ? 100
    : Math.round(((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  return { level: level + 1, title: levels[level].title, progress };
}

export const ALL_BADGES: Badge[] = [
  { id: 'streak_7', name: '7 Day Streak', description: 'Study for 7 consecutive days', icon: 'flame' },
  { id: 'streak_30', name: '30 Day Streak', description: 'Study for 30 consecutive days', icon: 'flame' },
  { id: 'tasks_100', name: '100 Tasks Completed', description: 'Complete 100 tasks', icon: 'check-circle' },
  { id: 'marathon_focus', name: 'Marathon Focus', description: 'Complete a 50-minute focus session', icon: 'brain' },
  { id: 'early_bird', name: 'Early Bird', description: 'Start a focus session before 8 AM', icon: 'sunrise' },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a focus session after 10 PM', icon: 'moon' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100 on productivity', icon: 'star' },
  { id: 'comeback', name: 'Comeback Kid', description: 'Resume after a broken streak', icon: 'rotate-ccw' },
];

export function checkAndAwardBadges(
  streak: number,
  tasksCompleted: number,
  sessions: FocusSession[],
  score: number
): Badge[] {
  const earned: Badge[] = [];
  const now = nowISO();

  if (streak >= 7) earned.push({ ...ALL_BADGES[0], earnedAt: now });
  if (streak >= 30) earned.push({ ...ALL_BADGES[1], earnedAt: now });
  if (tasksCompleted >= 100) earned.push({ ...ALL_BADGES[2], earnedAt: now });
  if (sessions.some(s => s.duration >= 50 && s.completed)) earned.push({ ...ALL_BADGES[3], earnedAt: now });
  if (score >= 100) earned.push({ ...ALL_BADGES[6], earnedAt: now });

  const earlySession = sessions.find(s => {
    const hour = new Date(s.startTime).getHours();
    return hour < 8 && s.completed;
  });
  if (earlySession) earned.push({ ...ALL_BADGES[4], earnedAt: now });

  const lateSession = sessions.find(s => {
    const hour = new Date(s.endTime || s.startTime).getHours();
    return hour >= 22 && s.completed;
  });
  if (lateSession) earned.push({ ...ALL_BADGES[5], earnedAt: now });

  return earned;
}

export function generateSuggestions(
  subjects: Subject[],
  tasks: Task[],
  streak: number,
  sessions: FocusSession[]
): import('./types').AICoachSuggestion[] {
  const suggestions: import('./types').AICoachSuggestion[] = [];

  const weakSubjects = subjects.filter(s => s.weaknessLevel >= 4);
  weakSubjects.forEach(s => {
    suggestions.push({
      id: generateId(),
      message: `Allocate 30 more minutes for ${s.name} practice. Your weakness level is high.`,
      type: 'tip',
      timestamp: nowISO(),
      dismissed: false,
    });
  });

  const urgentTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const daysLeft = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 2 && daysLeft >= 0;
  });

  if (urgentTasks.length > 0) {
    suggestions.push({
      id: generateId(),
      message: `Complete high-priority assignment "${urgentTasks[0].title}" today. Deadline is approaching!`,
      type: 'warning',
      timestamp: nowISO(),
      dismissed: false,
    });
  }

  if (streak === 0) {
    suggestions.push({
      id: generateId(),
      message: 'Resume with a small 20-minute session. Building momentum starts with one step!',
      type: 'encouragement',
      timestamp: nowISO(),
      dismissed: false,
    });
  }

  if (streak >= 7) {
    suggestions.push({
      id: generateId(),
      message: `Amazing ${streak}-day streak! Keep the momentum going. Consistency beats intensity.`,
      type: 'encouragement',
      timestamp: nowISO(),
      dismissed: false,
    });
  }

  return suggestions;
}

export function awardXP(type: XPEvent['type'], description: string): XPEvent {
  const xpMap: Record<XPEvent['type'], number> = {
    task_complete: 25,
    focus_session: 15,
    daily_target: 50,
    streak: 30,
  };

  return {
    id: generateId(),
    type,
    xp: xpMap[type],
    timestamp: nowISO(),
    description,
  };
}

export function recordStudyTime(minutes: number): void {
  const today = todayStr();
  const days = getItem<StudyDay[]>('study_days', []);
  const existing = days.find(d => d.date === today);

  if (existing) {
    existing.hoursStudied += minutes / 60;
    existing.focusSessions += 1;
  } else {
    days.push({
      date: today,
      hoursStudied: minutes / 60,
      tasksCompleted: 0,
      focusSessions: 1,
    });
  }

  setItem('study_days', days);
}

export function markTaskCompleted(taskId: string): void {
  const today = todayStr();
  const days = getItem<StudyDay[]>('study_days', []);
  const existing = days.find(d => d.date === today);

  if (existing) {
    existing.tasksCompleted += 1;
  } else {
    days.push({
      date: today,
      hoursStudied: 0,
      tasksCompleted: 1,
      focusSessions: 0,
    });
  }

  setItem('study_days', days);
}
