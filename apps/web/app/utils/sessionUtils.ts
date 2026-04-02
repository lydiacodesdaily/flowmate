import { SessionDraft, SessionRecord, PrepStep, TimerMode, SessionType, TimerType, SessionStatus, ActiveSession } from '../types';

const STORAGE_KEYS = {
  DRAFT: 'flowmate:v1:sessionDraft',
  HISTORY: 'flowmate:v1:sessionHistory',
  ACTIVE_SESSION: 'flowmate:v1:activeSession',
} as const;

const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Retention period in days (time-based, not count-based)
export const RETENTION_DAYS = 90;

// ===== Draft Storage =====

export function getDraft(): SessionDraft {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!stored) {
      return { intent: '', steps: [] };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading session draft:', error);
    return { intent: '', steps: [] };
  }
}

export function saveDraft(draft: SessionDraft): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving session draft:', error);
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (error) {
    console.error('Error clearing session draft:', error);
  }
}

// ===== History Storage =====

export function getHistory(): SessionRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!stored) {
      return [];
    }
    const history = JSON.parse(stored);

    // Filter to retention period and add backward compatibility
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    return history
      .filter((session: any) => session.startedAt >= cutoffDate)
      .map((session: any) => {
        // Migrate old sessions without timerType field (backward compatibility)
        if (!session.timerType) {
          return { ...session, timerType: 'focus' };
        }
        return session;
      });
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
}

export function appendHistory(record: SessionRecord): void {
  try {
    const history = getHistory();

    // Filter to keep only sessions within retention period (time-based)
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(session => session.startedAt >= cutoffDate);

    const updatedHistory = [record, ...filteredHistory];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error appending to session history:', error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing session history:', error);
  }
}

// ===== Helper Functions =====

export function createPrepStep(text: string): PrepStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: text.trim(),
    done: false,
  };
}

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
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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
        done: draft.steps.filter(s => s.done).length,
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

export function getActiveSession(): ActiveSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!stored) return null;
    return JSON.parse(stored) as ActiveSession;
  } catch {
    return null;
  }
}

export function setActiveSession(session: ActiveSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving active session:', error);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
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

// Returns the most recent partial focus session within the 24-hour resume window.
export function getResumableSession(): SessionRecord | null {
  const history = getHistory();
  return history.find(s => isResumable(s)) ?? null;
}

// Builds a SessionDraft from a session record.
// Pass preserveDone=true to keep existing step completion state (e.g. for Resume).
export function sessionToDraft(session: SessionRecord, preserveDone = false): SessionDraft {
  return {
    intent: session.intent ?? '',
    steps: session.stepsDetail
      ? session.stepsDetail.map(s => ({ ...s, done: preserveDone ? s.done : false }))
      : [],
  };
}

// ===== Today's Summary Helpers =====

export function getTodaysSessions(): SessionRecord[] {
  const history = getHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return history.filter(record => {
    const recordDate = new Date(record.startedAt);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === todayTimestamp;
  });
}

export function getTodayStats(): {
  totalMinutes: number;
  breakMinutes: number;
  sessionCount: number;
  breakCount: number;
  completedCount: number;
} {
  const todaySessions = getTodaysSessions();

  const totalMinutes = todaySessions.reduce((sum, session) => {
    // Only count completed seconds for completed and partial focus sessions (not skipped or breaks)
    if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'focus') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);

  const breakMinutes = todaySessions.reduce((sum, session) => {
    // Only count completed seconds for completed and partial break sessions (not skipped)
    if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'break') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);

  const completedCount = todaySessions.filter(
    s => s.status === 'completed' && s.timerType === 'focus'
  ).length;

  const breakCount = todaySessions.filter(
    s => (s.status === 'completed' || s.status === 'partial') && s.timerType === 'break'
  ).length;

  return {
    totalMinutes,
    breakMinutes,
    sessionCount: todaySessions.filter(s => s.timerType === 'focus').length,
    breakCount,
    completedCount,
  };
}

export function getAllTimeTotalMinutes(): number {
  const history = getHistory();
  return history.reduce((sum, session) => {
    if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'focus') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);
}

export function getAllTimeBreakMinutes(): number {
  const history = getHistory();
  return history.reduce((sum, session) => {
    if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'break') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);
}

export function getAllTimeSavedSessions(): number {
  const history = getHistory();
  return history.filter(
    s => (s.status === 'completed' || s.status === 'partial') && s.timerType === 'focus'
  ).length;
}

export function getAllTimeSavedBreaks(): number {
  const history = getHistory();
  return history.filter(
    s => (s.status === 'completed' || s.status === 'partial') && s.timerType === 'break'
  ).length;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
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
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  const todayOnly = new Date(today);
  todayOnly.setHours(0, 0, 0, 0);
  const yesterdayOnly = new Date(yesterday);
  yesterdayOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return `Today, ${formatTime(timestamp)}`;
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return `Yesterday, ${formatTime(timestamp)}`;
  } else {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}, ${formatTime(timestamp)}`;
  }
}

export function getSessionHistory(): SessionRecord[] {
  return getHistory();
}

// ===== Daily Summary Helpers =====

export interface DailySummary {
  date: string; // Date string in format "YYYY-MM-DD"
  displayDate: string; // Formatted display date like "Today", "Yesterday", or "Mar 15"
  sessions: SessionRecord[];
  totalMinutes: number;
  breakMinutes: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  breakCount: number;
}

// ===== Server Sync Helpers =====

/**
 * Reports a completed/partial focus session to the aggregate stats endpoint.
 * Called for all users (anonymous and authenticated) on every session save.
 * Fire-and-forget — localStorage remains the source of truth.
 */
export function reportSessionToAggregateStats(record: SessionRecord): void {
  if (typeof window === 'undefined') return;
  if (record.timerType !== 'focus') return;
  if (record.status !== 'completed' && record.status !== 'partial') return;
  if (record.completedSeconds <= 0) return;

  fetch('/api/stats/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timerType: record.timerType,
      status: record.status,
      completedSeconds: record.completedSeconds,
    }),
  }).catch(() => {});
}

/**
 * Merges sessions fetched from the server into localStorage.
 * Additive only — server sessions fill gaps, never overwrite existing local data.
 * Call on sign-in to hydrate history from a previous device or browser.
 */
export function mergeServerSessions(serverSessions: SessionRecord[]): void {
  try {
    const local = getHistory();
    const localIds = new Set(local.map(s => s.id));
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const newSessions = serverSessions.filter(
      s => !localIds.has(s.id) && s.startedAt >= cutoffDate
    );

    if (newSessions.length === 0) return;

    const merged = [...local, ...newSessions].sort((a, b) => b.startedAt - a.startedAt);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(merged));
  } catch (error) {
    console.error('Error merging server sessions:', error);
  }
}

/**
 * Syncs a session record to Supabase for logged-in users.
 * Call only when user is authenticated. Fire-and-forget.
 */
export function syncSessionToServer(record: SessionRecord): void {
  if (typeof window === 'undefined') return;

  fetch('/api/sessions/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessions: [record] }),
  }).catch(() => {});
}

/**
 * Bulk-syncs all local history to Supabase on sign-in.
 * Idempotent — the server upserts on id, so re-sending existing sessions is safe.
 * Call only when user is authenticated. Fire-and-forget.
 */
export function syncLocalHistoryToServer(): void {
  if (typeof window === 'undefined') return;

  const sessions = getHistory();
  if (sessions.length === 0) return;

  // API accepts max 500 per request; slice to the most recent 500 if needed
  const batch = sessions.length > 500 ? sessions.slice(0, 500) : sessions;

  fetch('/api/sessions/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessions: batch }),
  }).catch(() => {});
}

export function groupSessionsByDay(): DailySummary[] {
  const history = getHistory();
  const grouped = new Map<string, SessionRecord[]>();

  // Group sessions by date (use local date components to avoid UTC offset issues)
  history.forEach(session => {
    const date = new Date(session.startedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(session);
  });

  // Convert to array of DailySummary objects
  const summaries: DailySummary[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  grouped.forEach((sessions, dateKey) => {
    // Parse as local midnight to avoid UTC offset shifting the date
    const [y, mo, d] = dateKey.split('-').map(Number);
    const date = new Date(y, mo - 1, d);

    // Calculate stats
    const totalMinutes = sessions.reduce((sum, session) => {
      if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'focus') {
        return sum + Math.floor(session.completedSeconds / 60);
      }
      return sum;
    }, 0);

    const breakMinutes = sessions.reduce((sum, session) => {
      if ((session.status === 'completed' || session.status === 'partial') && session.timerType === 'break') {
        return sum + Math.floor(session.completedSeconds / 60);
      }
      return sum;
    }, 0);

    const completedCount = sessions.filter(s => s.status === 'completed' && s.timerType === 'focus').length;
    const partialCount = sessions.filter(s => s.status === 'partial' && s.timerType === 'focus').length;
    const skippedCount = sessions.filter(s => s.status === 'skipped' && s.timerType === 'focus').length;
    const breakCount = sessions.filter(s => (s.status === 'completed' || s.status === 'partial') && s.timerType === 'break').length;

    // Format display date
    let displayDate: string;
    if (date.getTime() === today.getTime()) {
      displayDate = 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      displayDate = 'Yesterday';
    } else {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        displayDate = `${month} ${day}`;
      } else {
        displayDate = `${month} ${day}, ${year}`;
      }
    }

    summaries.push({
      date: dateKey,
      displayDate,
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
  summaries.sort((a, b) => b.date.localeCompare(a.date));

  return summaries;
}
