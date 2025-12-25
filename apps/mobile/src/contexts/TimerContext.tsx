import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode, useMemo } from 'react';
import type { Session } from '@flowmate/shared';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerContextValue {
  // Session Configuration
  sessions: Session[];
  currentSessionIndex: number;
  currentSession: Session | null;

  // Timer State
  timeRemaining: number;
  totalTime: number;
  status: TimerStatus;
  progress: number;

  // Actions
  startTimer: (sessions: Session[]) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
  subtractTime: (seconds: number) => void;
  addPomodoros: (numPomodoros?: number) => void;
  removePomodoros: (numPomodoros?: number) => void;

  // Computed Properties
  isActive: boolean; // true when status is 'running' or 'paused'
  formattedTime: string; // "25:00" or "1:25:00"
  currentPhase: 'focus' | 'break' | 'settle' | 'wrap' | null;

  // Callbacks
  onSessionComplete?: (session: Session, sessionIndex: number) => void;
  onAllSessionsComplete?: () => void;
  setSessionCompleteCallback: (callback: (session: Session, sessionIndex: number) => void) => void;
  setAllSessionsCompleteCallback: (callback: () => void) => void;
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

  // Callbacks stored in refs to avoid re-renders
  const onSessionCompleteRef = useRef<((session: Session, sessionIndex: number) => void) | undefined>(undefined);
  const onAllSessionsCompleteRef = useRef<(() => void) | undefined>(undefined);

  const currentSession = sessions[currentSessionIndex] || null;
  const totalTime = currentSession ? currentSession.durationMinutes * 60 : 0;
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        if (endTimeRef.current) {
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
          setTimeRemaining(remaining);

          if (remaining === 0) {
            // Session completed
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            endTimeRef.current = null;

            // Call session complete callback
            if (onSessionCompleteRef.current && currentSession) {
              onSessionCompleteRef.current(currentSession, currentSessionIndex);
            }

            // Move to next session or complete
            if (currentSessionIndex < sessions.length - 1) {
              const nextIndex = currentSessionIndex + 1;
              setCurrentSessionIndex(nextIndex);
              setTimeRemaining(sessions[nextIndex].durationMinutes * 60);
              setStatus('paused');
            } else {
              setStatus('completed');
              if (onAllSessionsCompleteRef.current) {
                onAllSessionsCompleteRef.current();
              }
            }
          }
        }
      }, 100); // Update every 100ms for accuracy

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [status, currentSessionIndex, sessions, currentSession]);

  const startTimer = useCallback((newSessions: Session[]) => {
    if (newSessions.length === 0) return;

    setSessions(newSessions);
    setCurrentSessionIndex(0);
    setTimeRemaining(newSessions[0].durationMinutes * 60);
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

    if (currentSessionIndex < sessions.length - 1) {
      const nextIndex = currentSessionIndex + 1;
      setCurrentSessionIndex(nextIndex);
      setTimeRemaining(sessions[nextIndex].durationMinutes * 60);
      setStatus('paused');
    } else {
      setStatus('completed');
      if (onAllSessionsCompleteRef.current) {
        onAllSessionsCompleteRef.current();
      }
    }
  }, [currentSessionIndex, sessions]);

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => prev + seconds);

    // If timer is running, update the end time
    if (status === 'running' && endTimeRef.current) {
      endTimeRef.current += seconds * 1000;
    }
  }, [status]);

  const subtractTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => {
      const newTime = Math.max(0, prev - seconds);

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

  const setSessionCompleteCallback = useCallback((callback: (session: Session, sessionIndex: number) => void) => {
    onSessionCompleteRef.current = callback;
  }, []);

  const setAllSessionsCompleteCallback = useCallback((callback: () => void) => {
    onAllSessionsCompleteRef.current = callback;
  }, []);

  const value = useMemo<TimerContextValue>(() => ({
    sessions,
    currentSessionIndex,
    currentSession,
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
    onSessionComplete: onSessionCompleteRef.current,
    onAllSessionsComplete: onAllSessionsCompleteRef.current,
    setSessionCompleteCallback,
    setAllSessionsCompleteCallback,
  }), [
    sessions,
    currentSessionIndex,
    currentSession,
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
    setSessionCompleteCallback,
    setAllSessionsCompleteCallback,
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
