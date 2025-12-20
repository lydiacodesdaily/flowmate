// Timer Types
export type TimerMode = 'pomodoro' | 'guided' | 'custom';

export type PomodoroType = '1pom' | '2pom' | '3pom' | '5pom';

export type GuidedType =
  | 'guided-30-pom'
  | 'guided-60-pom'
  | 'guided-90-pom'
  | 'guided-120-pom'
  | 'guided-180-pom'
  | 'guided-30-deep'
  | 'guided-60-deep'
  | 'guided-90-deep'
  | 'guided-120-deep'
  | 'guided-180-deep';

export type SessionType = 'settle' | 'focus' | 'break' | 'wrap';

export interface Session {
  type: SessionType;
  durationMinutes: number;
  label?: string;
}

// Settings Types
export interface AudioSettings {
  tickVolume: number;
  announcementVolume: number;
  tickSound: 'alternating' | 'single';
  muteAll: boolean;
  muteDuringBreaks: boolean;
  announcementInterval: 1 | 2 | 3 | 5 | 10;
}

export interface UISettings {
  darkMode: boolean;
}

// Statistics Types
export interface DailyStat {
  date: string; // ISO date string YYYY-MM-DD
  focusTimeMinutes: number;
  sessionsCompleted: number;
}

export interface UserStats {
  dailyStats: DailyStat[];
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number;
  totalSessions: number;
}

// Timer State Types
export interface TimerState {
  mode: TimerMode | null;
  sessions: Session[];
  currentSessionIndex: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  endTime: number | null; // timestamp
}
