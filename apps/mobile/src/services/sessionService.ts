import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SessionRecord,
  SessionDraft,
  PrepStep,
  TimerMode,
  TimerType,
  SessionType,
  SessionStatus,
  DailySummary,
  DailyStat,
  ActiveSession,
} from '@flowmate/shared/types';

const STORAGE_KEYS = {
  DRAFT: '@flowmate:v1:sessionDraft',
  HISTORY: '@flowmate:v1:sessionHistory',
  ACTIVE_SESSION: '@flowmate:v1:activeSession',
};

const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Retention period in days (time-based, not count-based)
export const RETENTION_DAYS = 90;

// ===== Draft Management =====

export async function getDraft(): Promise<SessionDraft> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading draft:', error);
  }
  return { intent: '', steps: [] };
}

export async function saveDraft(draft: SessionDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}

// ===== Prep Step Helpers =====

export function createPrepStep(text: string): PrepStep {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    text,
    done: false,
  };
}

// ===== Session History Management =====

export async function getHistory(): Promise<SessionRecord[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      const history: SessionRecord[] = JSON.parse(data);

      // Filter to retention period and add backward compatibility
      const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
      return history
        .filter(session => session.startedAt >= cutoffDate)
        .map((session: any) => {
          // Backward compatibility: add timerType if missing
          if (!session.timerType) {
            return { ...session, timerType: 'focus' as TimerType };
          }
          return session;
        });
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  return [];
}

export async function appendHistory(record: SessionRecord): Promise<void> {
  try {
    const history = await getHistory();

    // Filter to keep only sessions within retention period (time-based)
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(session => session.startedAt >= cutoffDate);

    const updatedHistory = [record, ...filteredHistory];
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error appending history:', error);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export async function updateHistoryRecord(
  id: string,
  updates: Partial<Pick<SessionRecord, 'status' | 'note' | 'steps'>>
): Promise<boolean> {
  try {
    const history = await getHistory();
    const index = history.findIndex((record) => record.id === id);
    if (index === -1) {
      console.warn('Record not found for update:', id);
      return false;
    }
    history[index] = { ...history[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error updating history record:', error);
    return false;
  }
}

// ===== Session Record Creation =====

export function createSessionRecord(
  startedAt: number,
  endedAt: number,
  plannedSeconds: number,
  completedSeconds: number,
  mode: TimerMode,
  timerType: TimerType,
  type: SessionType,
  status: SessionStatus,
  draft?: SessionDraft,
  note?: string,
  resumedFromId?: string
): SessionRecord {
  const record: SessionRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    startedAt,
    endedAt,
    plannedSeconds,
    completedSeconds,
    mode,
    timerType,
    type,
    status,
  };

  if (draft) {
    if (draft.intent) {
      record.intent = draft.intent;
    }
    if (draft.steps.length > 0) {
      record.steps = {
        total: draft.steps.length,
        done: draft.steps.filter((s) => s.done).length,
      };
      record.stepsDetail = draft.steps;
    }
  }

  if (note) {
    record.note = note;
  }

  if (resumedFromId) {
    record.resumedFromId = resumedFromId;
  }

  return record;
}

// ===== Active Session (crash recovery) =====

export async function getActiveSession(): Promise<ActiveSession | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (data) return JSON.parse(data) as ActiveSession;
  } catch (error) {
    console.error('Error loading active session:', error);
  }
  return null;
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving active session:', error);
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch (error) {
    console.error('Error clearing active session:', error);
  }
}

// ===== Resume Helpers =====

export function isResumable(session: SessionRecord): boolean {
  return (
    session.timerType === 'focus' &&
    session.status === 'partial' &&
    Date.now() - session.endedAt < RESUME_WINDOW_MS
  );
}

export async function getResumableSession(): Promise<SessionRecord | null> {
  const history = await getHistory();
  return history.find((s) => isResumable(s)) ?? null;
}

// Builds a SessionDraft from a session record.
// Pass preserveDone=true to keep existing step completion state (e.g. for Resume).
export function sessionToDraft(session: SessionRecord, preserveDone = false): SessionDraft {
  return {
    intent: session.intent ?? '',
    steps: session.stepsDetail
      ? session.stepsDetail.map((s) => ({ ...s, done: preserveDone ? s.done : false }))
      : [],
  };
}

// ===== Today's Sessions =====

export async function getTodaysSessions(): Promise<SessionRecord[]> {
  const history = await getHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return history.filter((session) => {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === todayTimestamp;
  });
}

// ===== Today's Stats =====

export async function getTodayStats() {
  const todaySessions = await getTodaysSessions();

  const totalMinutes = todaySessions.reduce((sum, session) => {
    if (
      (session.status === 'completed' || session.status === 'partial') &&
      session.timerType === 'focus'
    ) {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);

  const breakMinutes = todaySessions.reduce((sum, session) => {
    if (
      (session.status === 'completed' || session.status === 'partial') &&
      session.timerType === 'break'
    ) {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);

  const completedCount = todaySessions.filter(
    (s) => s.status === 'completed' && s.timerType === 'focus'
  ).length;

  const partialCount = todaySessions.filter(
    (s) => s.status === 'partial' && s.timerType === 'focus'
  ).length;

  const skippedCount = todaySessions.filter(
    (s) => s.status === 'skipped' && s.timerType === 'focus'
  ).length;

  const breakCount = todaySessions.filter((s) => s.timerType === 'break').length;

  return {
    totalMinutes,
    breakMinutes,
    completedCount,
    partialCount,
    skippedCount,
    breakCount,
  };
}

// ===== Group Sessions by Day =====

export async function groupSessionsByDay(): Promise<DailySummary[]> {
  const history = await getHistory();
  const grouped = new Map<string, SessionRecord[]>();

  // Group sessions by date (using local timezone)
  history.forEach((session) => {
    const date = new Date(session.startedAt);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!grouped.has(dateStr)) {
      grouped.set(dateStr, []);
    }
    grouped.get(dateStr)!.push(session);
  });

  // Convert to DailySummary array
  const summaries: DailySummary[] = [];
  grouped.forEach((sessions, dateStr) => {
    const totalMinutes = sessions.reduce((sum, session) => {
      if (
        (session.status === 'completed' || session.status === 'partial') &&
        session.timerType === 'focus'
      ) {
        return sum + Math.floor(session.completedSeconds / 60);
      }
      return sum;
    }, 0);

    const breakMinutes = sessions.reduce((sum, session) => {
      if (
        (session.status === 'completed' || session.status === 'partial') &&
        session.timerType === 'break'
      ) {
        return sum + Math.floor(session.completedSeconds / 60);
      }
      return sum;
    }, 0);

    const completedCount = sessions.filter(
      (s) => s.status === 'completed' && s.timerType === 'focus'
    ).length;

    const partialCount = sessions.filter(
      (s) => s.status === 'partial' && s.timerType === 'focus'
    ).length;

    const skippedCount = sessions.filter(
      (s) => s.status === 'skipped' && s.timerType === 'focus'
    ).length;

    const breakCount = sessions.filter((s) => s.timerType === 'break').length;

    summaries.push({
      date: dateStr,
      displayDate: formatDisplayDate(dateStr),
      sessions,
      totalMinutes,
      breakMinutes,
      completedCount,
      partialCount,
      skippedCount,
      breakCount,
    });
  });

  // Sort by date descending (most recent first)
  return summaries.sort((a, b) => b.date.localeCompare(a.date));
}

// ===== All-time Stats =====

export async function getAllTimeTotalMinutes(): Promise<number> {
  const history = await getHistory();
  return history.reduce((sum, session) => {
    if (
      (session.status === 'completed' || session.status === 'partial') &&
      session.timerType === 'focus'
    ) {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);
}

export async function getAllTimeSavedSessions(): Promise<number> {
  const history = await getHistory();
  return history.filter((s) => s.timerType === 'focus').length;
}

export async function getAllTimeBreakMinutes(): Promise<number> {
  const history = await getHistory();
  return history.reduce((sum, session) => {
    if (
      (session.status === 'completed' || session.status === 'partial') &&
      session.timerType === 'break'
    ) {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);
}

export async function getAllTimeSavedBreaks(): Promise<number> {
  const history = await getHistory();
  return history.filter((s) => s.timerType === 'break').length;
}

// ===== Week Stats (for WeeklyChart) =====

export async function getWeekStats(): Promise<DailyStat[]> {
  const history = await getHistory();

  // Get date range for last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Group sessions by date and calculate stats
  const statsMap = new Map<string, DailyStat>();

  for (const session of history) {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);

    // Skip sessions older than 7 days
    if (sessionDate < weekAgo) continue;

    const dateStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`;

    if (!statsMap.has(dateStr)) {
      statsMap.set(dateStr, {
        date: dateStr,
        focusTimeMinutes: 0,
        sessionsCompleted: 0,
      });
    }

    const stat = statsMap.get(dateStr)!;

    // Only count focus sessions that were completed or partial
    if (
      session.timerType === 'focus' &&
      (session.status === 'completed' || session.status === 'partial')
    ) {
      stat.focusTimeMinutes += Math.floor(session.completedSeconds / 60);
      stat.sessionsCompleted += 1;
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ===== This Week Summary (Mon-Sun) =====

export async function getThisWeekSummary(): Promise<{
  daysActive: number;
  totalMinutes: number;
  totalSessions: number;
}> {
  const weekStats = await getWeekStats();

  // Calculate Monday of current week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so offset is 6
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

  // Filter to this week (Mon-Sun)
  const thisWeek = weekStats.filter((s) => s.date >= mondayStr);

  return {
    daysActive: thisWeek.filter((s) => s.sessionsCompleted > 0).length,
    totalMinutes: thisWeek.reduce((sum, s) => sum + s.focusTimeMinutes, 0),
    totalSessions: thisWeek.reduce((sum, s) => sum + s.sessionsCompleted, 0),
  };
}

// ===== All-Time Stats (Combined) =====

export async function getAllTimeStats(): Promise<{
  totalFocusTime: number;
  totalSessions: number;
  daysActive: number;
}> {
  const history = await getHistory();
  const uniqueDays = new Set<string>();

  let totalFocusTime = 0;
  let totalSessions = 0;

  for (const session of history) {
    if (session.timerType === 'focus') {
      const sessionDate = new Date(session.startedAt);
      const dateStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`;
      uniqueDays.add(dateStr);

      if (session.status === 'completed' || session.status === 'partial') {
        totalFocusTime += Math.floor(session.completedSeconds / 60);
      }
      totalSessions += 1;
    }
  }

  return {
    totalFocusTime,
    totalSessions,
    daysActive: uniqueDays.size,
  };
}

// ===== Formatting Helpers =====

function formatDisplayDate(dateStr: string): string {
  // Parse YYYY-MM-DD explicitly to avoid timezone issues
  const [yearNum, monthNum, dayNum] = dateStr.split('-').map(Number);
  const date = new Date(yearNum, monthNum - 1, dayNum); // month is 0-indexed

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    return `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function formatFocusTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  const timeStr = formatTime(timestamp);

  if (inputDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  }
  if (inputDate.getTime() === yesterday.getTime()) {
    return `Yesterday`;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}`;
}
