import { SessionDraft, SessionRecord, PrepStep, TimerMode, SessionType, SessionStatus } from '../types';

const STORAGE_KEYS = {
  DRAFT: 'flowmate:v1:sessionDraft',
  HISTORY: 'flowmate:v1:sessionHistory',
} as const;

const MAX_HISTORY_SIZE = 30;

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
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
}

export function appendHistory(record: SessionRecord): void {
  try {
    const history = getHistory();
    history.unshift(record); // Add to beginning (most recent first)

    // Trim to last 30 sessions
    const trimmed = history.slice(0, MAX_HISTORY_SIZE);

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
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
  type: SessionType,
  status: SessionStatus,
  draft?: SessionDraft,
  note?: string
): SessionRecord {
  const record: SessionRecord = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startedAt,
    endedAt,
    plannedSeconds,
    completedSeconds,
    mode,
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
    }
  }

  if (note) {
    record.note = note;
  }

  return record;
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
  sessionCount: number;
  completedCount: number;
} {
  const todaySessions = getTodaysSessions();

  const totalMinutes = todaySessions.reduce((sum, session) => {
    // Only count completed seconds for completed and partial sessions (not skipped)
    if (session.status === 'completed' || session.status === 'partial') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);

  const completedCount = todaySessions.filter(
    s => s.status === 'completed'
  ).length;

  return {
    totalMinutes,
    sessionCount: todaySessions.length,
    completedCount,
  };
}

export function getAllTimeTotalMinutes(): number {
  const history = getHistory();
  return history.reduce((sum, session) => {
    if (session.status === 'completed' || session.status === 'partial') {
      return sum + Math.floor(session.completedSeconds / 60);
    }
    return sum;
  }, 0);
}

export function getAllTimeSavedSessions(): number {
  const history = getHistory();
  return history.filter(
    s => s.status === 'completed' || s.status === 'partial'
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
