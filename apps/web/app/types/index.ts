export type SessionType = "focus" | "break";
export type SessionDuration = 25 | 30 | 55 | 60 | 85 | 90 | 120 | 145 | 180;
export type TimerMode = "pomodoro" | "guided" | "custom";
export type TimerType = "focus" | "break"; // Overall session type (focus work vs break/rest)

// Renamed from PomodoroSession to reflect usage across all modes
export interface TimerBlock {
  type: SessionType;
  duration: number; // in seconds
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  focusTimeMinutes: number; // Total focus time in minutes for the day
  breakTimeMinutes: number; // Total break time in minutes for the day
  sessionsSaved: number; // Number of saved focus sessions (completed + partial)
  breaksSaved: number; // Number of saved break sessions (completed + partial)
}

export interface UserStats {
  dailyStats: DailyStats[];
  totalFocusTime: number; // Total focus time in minutes across all time
  totalBreakTime: number; // Total break time in minutes across all time
  totalSessions: number; // Total number of focus sessions saved
  totalBreaks: number; // Total number of break sessions saved
}

export const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
export const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

// Session Layer v1 Types
export type SessionStatus = "completed" | "partial" | "skipped";

export interface PrepStep {
  id: string;
  text: string;
  done: boolean;
}

export interface SessionDraft {
  intent: string;
  steps: PrepStep[];
}

export interface SessionRecord {
  id: string;
  startedAt: number; // Unix timestamp
  endedAt: number; // Unix timestamp
  plannedSeconds: number;
  completedSeconds: number;
  mode: TimerMode; // pomodoro | guided | custom
  timerType: TimerType; // Overall session type: focus work vs break/rest
  type: SessionType; // Block type within session: focus | break (for pomodoro blocks)
  status: SessionStatus; // completed | partial | skipped
  intent?: string;
  steps?: {
    total: number;
    done: number;
  };
  note?: string;
}
