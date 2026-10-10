export interface UserProfile {
  name: string;
  academicLevel: string;
  dailyStudyTarget: number; // hours
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  weaknessLevel: number; // 1-5
  deadline?: string;
  examDate?: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  subjectId: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  mode: '25/5' | '50/10' | 'custom';
  subjectId?: string;
  completed: boolean;
}

export interface StudyDay {
  date: string;
  hoursStudied: number;
  tasksCompleted: number;
  focusSessions: number;
}

export interface PlannerSlot {
  id: string;
  subjectId: string;
  day: string;
  startTime: string;
  duration: number;
  priority: number;
  type: 'study' | 'revision' | 'break';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface XPEvent {
  id: string;
  type: 'task_complete' | 'focus_session' | 'daily_target' | 'streak';
  xp: number;
  timestamp: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'deadline' | 'task' | 'study';
  subjectId?: string;
  color?: string;
  description?: string;
}

export interface AICoachSuggestion {
  id: string;
  message: string;
  type: 'tip' | 'warning' | 'encouragement';
  timestamp: string;
  dismissed: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}
