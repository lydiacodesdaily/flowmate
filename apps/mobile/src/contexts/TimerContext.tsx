import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode, useMemo } from 'react';
import type { Session, SessionDraft, TimerType, TimerMode } from '@flowmate/shared';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerContextValue {
  // Session Configuration
  sessions: Session[];
  currentSessionIndex: number;
  currentSession: Session | null;

  // Session Recording
  timerType: TimerType;
  timerMode: TimerMode | null;
  sessionDraft: SessionDraft;
  sessionStartTime: number;
  sessionEndTime: number;

  // Timer State
  timeRemaining: number;
  totalTime: number;
  status: TimerStatus;
  progress: number;

  // Actions
  startTimer: (sessions: Session[], mode: TimerMode, type: TimerType, draft?: SessionDraft) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
  subtractTime: (seconds: number) => void;
  addPomodoros: (numPomodoros?: number) => void;
  removePomodoros: (numPomodoros?: number) => void;
  setTimerType: (type: TimerType) => void;
  setSessionDraft: (draft: SessionDraft) => void;
  updateSessionDraft: (draft: SessionDraft) => void;

  // Computed Properties
  isActive: boolean; // true when status is 'running' or 'paused'
  formattedTime: string; // "25:00" or "1:25:00"
  currentPhase: 'focus' | 'break' | 'settle' | 'wrap' | null;
  /** True when timer is in the "wrapping up" zone (last 60s by default) */
  isInTransitionZone: boolean;
  /** Seconds remaining until session end (for transition warning intensity) */
  transitionSecondsRemaining: number;

  // Callbacks
  onSessionComplete?: (session: Session, sessionIndex: number, actualTotalSeconds: number) => void;
  onAllSessionsComplete?: () => void;
  onSessionSkip?: (session: Session, elapsedSeconds: number, actualTotalSeconds: number) => void;
  setSessionCompleteCallback: (callback: (session: Session, sessionIndex: number, actualTotalSeconds: number) => void) => void;
  setAllSessionsCompleteCallback: (callback: () => void) => void;
  setSessionSkipCallback: (callback: (session: Session, elapsedSeconds: number, actualTotalSeconds: number) => void) => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Session recording state
  const [timerType, setTimerType] = useState<TimerType>('focus');
  const [timerMode, setTimerMode] = useState<TimerMode | null>(null);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>({ intent: '', steps: [] });
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [sessionEndTime, setSessionEndTime] = useState(0);

  // Callbacks stored in refs to avoid re-renders
  const onSessionCompleteRef = useRef<((session: Session, sessionIndex: number, actualTotalSeconds: number) => void) | undefined>(undefined);
  const onAllSessionsCompleteRef = useRef<(() => void) | undefined>(undefined);
  const onSessionSkipRef = useRef<((session: Session, elapsedSeconds: number, actualTotalSeconds: number) => void) | undefined>(undefined);

  // Track cumulative time adjustments for the current session (add/subtract time)
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const timeAdjustmentRef = useRef(0);

  const currentSession = sessions[currentSessionIndex] || null;
  const totalTime = currentSession ? currentSession.durationMinutes * 60 + timeAdjustment : 0;
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;
  const isActive = status === 'running' || status === 'paused';

  // Format time as MM:SS or HH:MM:SS
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Determine current phase
  const currentPhase = useMemo(() => {
    if (!currentSession) return null;
    if (currentSession.type === 'focus') return 'focus';
    if (currentSession.type === 'break') return 'break';
    if (currentSession.type === 'settle') return 'settle';
    if (currentSession.type === 'wrap') return 'wrap';
    return null;
  }, [currentSession]);

  // Transition zone detection (last 60 seconds before session end)
  const TRANSITION_ZONE_DURATION = 60; // seconds
  const isInTransitionZone = useMemo(() => {
    // Only show transition zone when running and time is low
    if (status !== 'running') return false;
    // Don't show for very short sessions (less than 2 minutes)
    if (totalTime < 120) return false;
    return timeRemaining > 0 && timeRemaining <= TRANSITION_ZONE_DURATION;
  }, [status, timeRemaining, totalTime]);

  const transitionSecondsRemaining = useMemo(() => {
    if (!isInTransitionZone) return 0;
    return timeRemaining;
  }, [isInTransitionZone, timeRemaining]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // UI UPDATE LOOP - 1Hz, only updates React state when displayed second changes
  // Source of truth: Date.now() compared against endTimeRef (no drift)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'running') {
      // Helper to compute remaining seconds from Date.now (drift-free)
      const computeRemaining = (): number => {
        if (!endTimeRef.current) return 0;
        return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      };

      // Track last emitted value to avoid redundant state updates
      let lastEmitted = computeRemaining();

      const tick = () => {
        const remaining = computeRemaining();

        // Only update React state when the displayed second changes
        if (remaining !== lastEmitted) {
          lastEmitted = remaining;
          setTimeRemaining(remaining);

          if (remaining === 0) {
            // Session completed - cleanup interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            endTimeRef.current = null;

            // Capture end time for session recording
            setSessionEndTime(Date.now());

            // Call session complete callback with the actual total seconds (including adjustments)
            if (onSessionCompleteRef.current && currentSession) {
              const actualTotalSeconds = currentSession.durationMinutes * 60 + timeAdjustmentRef.current;
              onSessionCompleteRef.current(currentSession, currentSessionIndex, actualTotalSeconds);
            }

            // Reset time adjustment for next session
            timeAdjustmentRef.current = 0;
            setTimeAdjustment(0);

            // Move to next session or complete
            if (currentSessionIndex < sessions.length - 1) {
              const nextIndex = currentSessionIndex + 1;
              const nextDuration = sessions[nextIndex].durationMinutes * 60;
              setCurrentSessionIndex(nextIndex);
              setTimeRemaining(nextDuration);
              // Auto-start the next session
              endTimeRef.current = Date.now() + nextDuration * 1000;
              setStatus('running');
            } else {
              setStatus('completed');
              if (onAllSessionsCompleteRef.current) {
                onAllSessionsCompleteRef.current();
              }
            }
          }
        }
      };

      // Run immediately, then every 1000ms (1Hz UI updates)
      tick();
      intervalRef.current = setInterval(tick, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [status, currentSessionIndex, sessions, currentSession]);

  // ─────────────────────────────────────────────────────────────────────────────
  // AUDIO TICK LOOP - Managed by audioService, independent of React renders
  // Uses callbacks to read current time (derived from Date.now, not React state)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'running' && currentSession) {
      audioService.startTickLoop({
        // Compute time remaining from Date.now - no dependency on React state
        getTimeRemaining: () => {
          if (!endTimeRef.current) return 0;
          return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        },
        getTotalTime: () => currentSession.durationMinutes * 60,
        getSessionType: () => currentSession.type,
        // Explicit haptic callback - not in effect dependency chain
        onHapticLight: () => {
          hapticService.light();
        },
        // Transition warning haptic callback - double-tap at 60s and 30s
        onTransitionHaptic: () => {
          hapticService.doubleTap();
        },
      });

      return () => {
        audioService.stopTickLoop();
      };
    } else {
      // Ensure tick loop is stopped when not running
      audioService.stopTickLoop();
    }
  }, [status, currentSession]);

  const startTimer = useCallback((newSessions: Session[], mode: TimerMode, type: TimerType, draft?: SessionDraft) => {
    if (newSessions.length === 0) return;

    timeAdjustmentRef.current = 0;
    setTimeAdjustment(0);
    setSessions(newSessions);
    setCurrentSessionIndex(0);
    setTimeRemaining(newSessions[0].durationMinutes * 60);
    setTimerMode(mode);
    setTimerType(type);
    if (draft) {
      setSessionDraft(draft);
    }
    setSessionStartTime(Date.now());
    endTimeRef.current = Date.now() + newSessions[0].durationMinutes * 60 * 1000;
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (timeRemaining > 0) {
      endTimeRef.current = Date.now() + timeRemaining * 1000;
      setStatus('running');
    }
  }, [timeRemaining]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    timeAdjustmentRef.current = 0;
    setTimeAdjustment(0);

    // Reset audio announcement tracking for fresh start
    audioService.resetAnnouncementTracking();

    // Capture end time for session recording
    setSessionEndTime(Date.now());

    // Reset to the first session without clearing the sessions array
    // This keeps the session data intact for display purposes
    setCurrentSessionIndex(0);
    setTimeRemaining(sessions[0]?.durationMinutes * 60 || 0);
    setStatus('idle');
  }, [sessions]);

  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;

    // Reset audio announcement tracking for fresh session
    audioService.resetAnnouncementTracking();

    // Calculate elapsed time for the skipped session
    const currentSession = sessions[currentSessionIndex];
    if (currentSession && onSessionSkipRef.current) {
      const actualTotalSeconds = currentSession.durationMinutes * 60 + timeAdjustmentRef.current;
      const elapsedSeconds = actualTotalSeconds - timeRemaining;
      onSessionSkipRef.current(currentSession, elapsedSeconds, actualTotalSeconds);
    }

    // Reset time adjustment for next session
    timeAdjustmentRef.current = 0;
    setTimeAdjustment(0);

    if (currentSessionIndex < sessions.length - 1) {
      const nextIndex = currentSessionIndex + 1;
      const nextDuration = sessions[nextIndex].durationMinutes * 60;
      setCurrentSessionIndex(nextIndex);
      setTimeRemaining(nextDuration);
      // Auto-start the next session
      endTimeRef.current = Date.now() + nextDuration * 1000;
      setStatus('running');
    } else {
      setStatus('completed');
      if (onAllSessionsCompleteRef.current) {
        onAllSessionsCompleteRef.current();
      }
    }
  }, [currentSessionIndex, sessions, timeRemaining]);

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => prev + seconds);
    timeAdjustmentRef.current += seconds;
    setTimeAdjustment((prev) => prev + seconds);

    // If timer is running, update the end time
    if (status === 'running' && endTimeRef.current) {
      endTimeRef.current += seconds * 1000;
    }
  }, [status]);

  const subtractTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => {
      const newTime = Math.max(0, prev - seconds);
      const actualSubtracted = prev - newTime;
      timeAdjustmentRef.current -= actualSubtracted;
      setTimeAdjustment((a) => a - actualSubtracted);

      // If timer is running, update the end time
      if (status === 'running' && endTimeRef.current) {
        endTimeRef.current = Date.now() + newTime * 1000;
      }

      return newTime;
    });
  }, [status]);

  const addPomodoros = useCallback((numPomodoros: number = 1) => {
    const newSessions: Session[] = [];
    for (let i = 0; i < numPomodoros; i++) {
      newSessions.push({ type: 'break', durationMinutes: 5 });
      newSessions.push({ type: 'focus', durationMinutes: 25 });
    }
    setSessions((prev) => [...prev, ...newSessions]);
  }, []);

  const removePomodoros = useCallback((numPomodoros: number = 1) => {
    setSessions((prev) => {
      // Each pomodoro cycle is 2 sessions: break + focus
      const sessionsToRemove = numPomodoros * 2;

      // Don't remove if it would affect current or past sessions
      // Keep at least currentSessionIndex + 1 sessions
      const minSessionsToKeep = currentSessionIndex + 1;
      const canRemove = prev.length - sessionsToRemove >= minSessionsToKeep;

      if (canRemove) {
        // Remove from the end
        return prev.slice(0, -sessionsToRemove);
      }

      // If we can't remove the full cycle, don't remove anything
      return prev;
    });
  }, [currentSessionIndex]);

  const setSessionCompleteCallback = useCallback((callback: (session: Session, sessionIndex: number, actualTotalSeconds: number) => void) => {
    onSessionCompleteRef.current = callback;
  }, []);

  const setAllSessionsCompleteCallback = useCallback((callback: () => void) => {
    onAllSessionsCompleteRef.current = callback;
  }, []);

  const setSessionSkipCallback = useCallback((callback: (session: Session, elapsedSeconds: number, actualTotalSeconds: number) => void) => {
    onSessionSkipRef.current = callback;
  }, []);

  const updateSessionDraft = useCallback((draft: SessionDraft) => {
    setSessionDraft(draft);
  }, []);

  const value = useMemo<TimerContextValue>(() => ({
    sessions,
    currentSessionIndex,
    currentSession,
    timerType,
    timerMode,
    sessionDraft,
    sessionStartTime,
    sessionEndTime,
    timeRemaining,
    totalTime,
    status,
    progress,
    startTimer,
    pause,
    resume,
    skip,
    reset,
    addTime,
    subtractTime,
    addPomodoros,
    removePomodoros,
    setTimerType,
    setSessionDraft,
    updateSessionDraft,
    isActive,
    formattedTime,
    currentPhase,
    isInTransitionZone,
    transitionSecondsRemaining,
    onSessionComplete: onSessionCompleteRef.current,
    onAllSessionsComplete: onAllSessionsCompleteRef.current,
    onSessionSkip: onSessionSkipRef.current,
    setSessionCompleteCallback,
    setAllSessionsCompleteCallback,
    setSessionSkipCallback,
  }), [
    sessions,
    currentSessionIndex,
    currentSession,
    timerType,
    timerMode,
    sessionDraft,
    sessionStartTime,
    sessionEndTime,
    timeRemaining,
    totalTime,
    status,
    progress,
    startTimer,
    pause,
    resume,
    skip,
    reset,
    addTime,
    subtractTime,
    addPomodoros,
    removePomodoros,
    isActive,
    formattedTime,
    currentPhase,
    isInTransitionZone,
    transitionSecondsRemaining,
    setSessionCompleteCallback,
    setAllSessionsCompleteCallback,
    setSessionSkipCallback,
    updateSessionDraft,
  ]);

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext(): TimerContextValue {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
