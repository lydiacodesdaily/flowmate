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

export type TimerType = 'focus' | 'break'; // Overall session type (work vs rest)

export type SessionStatus = 'completed' | 'partial' | 'skipped';

export interface Session {
  type: SessionType;
  durationMinutes: number;
  label?: string;
}

// Session Intent Types
export interface PrepStep {
  id: string;
  text: string;
  done: boolean;
}

export interface SessionDraft {
  intent: string;
  steps: PrepStep[];
}

// Session Recording Types
export interface SessionRecord {
  id: string;
  startedAt: number; // Unix timestamp
  endedAt: number; // Unix timestamp
  plannedSeconds: number;
  completedSeconds: number;
  mode: TimerMode;
  timerType: TimerType; // Focus vs break classification
  type: SessionType; // Block type within session
  status: SessionStatus;
  intent?: string;
  steps?: {
    total: number;
    done: number;
  };
  stepsDetail?: PrepStep[]; // Full step list, used for Continue Today / Repeat
  note?: string;
  resumedFromId?: string; // ID of the partial session this continues (lineage only)
}

// Active session written to storage when timer starts; cleared on normal completion.
// Used to detect app crashes so the user can be offered a resume.
export interface ActiveSession {
  startedAt: number;
  plannedSeconds: number;
  draft: SessionDraft;
}

// Daily Summary Types
export interface DailySummary {
  date: string; // YYYY-MM-DD
  displayDate: string; // 'Today', 'Yesterday', 'Mar 15'
  sessions: SessionRecord[];
  totalMinutes: number;
  breakMinutes: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  breakCount: number;
}

// Settings Types
export interface AudioSettings {
  tickVolume: number;
  announcementVolume: number;
  tickSound: 'alternating' | 'classic' | 'beep';
  muteAll: boolean;
  muteDuringBreaks: boolean;
  announcementInterval: 1 | 5 | 10;
  secondsCountdown: boolean;
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
