export type SessionType = "focus" | "break";
export type SessionDuration = 25 | 30 | 55 | 60 | 85 | 90 | 120 | 145 | 180;
export type TimerMode = "pomodoro" | "guided" | "custom";

export interface PomodoroSession {
  type: SessionType;
  duration: number; // in seconds
}

export const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
export const BREAK_DURATION = 5 * 60; // 5 minutes in seconds
