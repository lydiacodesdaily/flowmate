import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SessionRecord,
  SessionDraft,
  PrepStep,
  TimerMode,
  TimerType,
  SessionType,
  SessionStatus,
  DailySummary,
} from '@flowmate/shared/types';

const STORAGE_KEYS = {
  DRAFT: '@flowmate:v1:sessionDraft',
  HISTORY: '@flowmate:v1:sessionHistory',
};

const MAX_HISTORY_ITEMS = 30;

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
      // Backward compatibility: add timerType if missing
      return history.map((session: any) => {
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
    const updatedHistory = [record, ...history].slice(0, MAX_HISTORY_ITEMS);
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
  note?: string
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
    }
  }

  if (note) {
    record.note = note;
  }

  return record;
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

  // Group sessions by date
  history.forEach((session) => {
    const date = new Date(session.startedAt);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
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

// ===== Formatting Helpers =====

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (inputDate.getTime() === yesterday.getTime()) {
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
