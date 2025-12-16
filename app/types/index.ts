export type SessionType = "focus" | "break";
export type SessionDuration = 25 | 30 | 55 | 60 | 85 | 90 | 120 | 145 | 180;
export type TimerMode = "pomodoro" | "guided" | "custom";

export interface PomodoroSession {
  type: SessionType;
  duration: number; // in seconds
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  focusTimeMinutes: number; // Total focus time in minutes for the day
  sessionsCompleted: number; // Number of focus sessions completed
}

export interface UserStats {
  dailyStats: DailyStats[];
  currentStreak: number; // Days in a row with at least one focus session
  longestStreak: number; // Best streak ever
  totalFocusTime: number; // Total focus time in minutes across all time
  totalSessions: number; // Total number of focus sessions completed
}

export const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
export const BREAK_DURATION = 5 * 60; // 5 minutes in seconds
