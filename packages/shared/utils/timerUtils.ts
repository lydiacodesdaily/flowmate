import type { Session, SessionType } from '../types';

/**
 * Calculate total duration of all sessions in minutes
 */
export const calculateTotalDuration = (sessions: Session[]): number => {
  return sessions.reduce((total, session) => total + session.durationMinutes, 0);
};

/**
 * Calculate progress through the current session list
 */
export const calculateProgress = (
  sessions: Session[],
  currentIndex: number,
  timeRemaining: number
): number => {
  if (sessions.length === 0) return 0;

  // Calculate total time elapsed in previous sessions
  let elapsedMinutes = 0;
  for (let i = 0; i < currentIndex; i++) {
    elapsedMinutes += sessions[i].durationMinutes;
  }

  // Add time elapsed in current session
  const currentSession = sessions[currentIndex];
  if (currentSession) {
    const currentElapsed =
      currentSession.durationMinutes - timeRemaining / 60;
    elapsedMinutes += currentElapsed;
  }

  const totalMinutes = calculateTotalDuration(sessions);
  return totalMinutes > 0 ? (elapsedMinutes / totalMinutes) * 100 : 0;
};

/**
 * Format seconds into MM:SS display
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get the display label for a session type
 */
export const getSessionLabel = (session: Session): string => {
  if (session.label) return session.label;

  switch (session.type) {
    case 'settle':
      return 'Settle In';
    case 'focus':
      return 'Focus';
    case 'break':
      return 'Break';
    case 'wrap':
      return 'Wrap Up';
    default:
      return 'Session';
  }
};

/**
 * Check if a session type should count toward focus time statistics
 */
export const isFocusSession = (sessionType: SessionType): boolean => {
  return sessionType === 'focus' || sessionType === 'settle' || sessionType === 'wrap';
};

/**
 * Calculate total focus time from a list of sessions (in minutes)
 */
export const calculateFocusTime = (sessions: Session[]): number => {
  return sessions
    .filter(session => isFocusSession(session.type))
    .reduce((total, session) => total + session.durationMinutes, 0);
};

/**
 * Adjust time by a given number of minutes
 * Returns new time remaining in seconds, ensuring it doesn't go below 0
 */
export const adjustTime = (
  currentSeconds: number,
  adjustMinutes: number
): number => {
  const newSeconds = currentSeconds + adjustMinutes * 60;
  return Math.max(0, newSeconds);
};

/**
 * Check if we should announce minutes at this point
 * Based on announcement interval and current time remaining
 */
export const shouldAnnounceMinute = (
  minutes: number,
  interval: 1 | 2 | 3 | 5 | 10
): boolean => {
  return minutes > 0 && minutes <= 24 && minutes % interval === 0;
};

/**
 * Check if we should play ding at 5-minute intervals for long sessions
 */
export const shouldPlayDing = (
  seconds: number,
  sessionDuration: number
): boolean => {
  // Only for sessions longer than 25 minutes
  if (sessionDuration <= 25 * 60) return false;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Play ding at exactly 5, 10, 15, 20, etc. minutes (when seconds hit 0)
  return secs === 0 && minutes > 0 && minutes % 5 === 0;
};
