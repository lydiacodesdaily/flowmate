import { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@flowmate/shared';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerProps {
  sessions: Session[];
  onSessionComplete?: (session: Session, sessionIndex: number) => void;
  onAllSessionsComplete?: () => void;
}

interface UseTimerReturn {
  currentSessionIndex: number;
  currentSession: Session | null;
  timeRemaining: number;
  totalTime: number;
  status: TimerStatus;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

export function useTimer({
  sessions,
  onSessionComplete,
  onAllSessionsComplete,
}: UseTimerProps): UseTimerReturn {
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    sessions[0]?.durationMinutes * 60 || 0
  );
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const currentSession = sessions[currentSessionIndex] || null;
  const totalTime = currentSession ? currentSession.durationMinutes * 60 : 0;
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

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
            if (onSessionComplete && currentSession) {
              onSessionComplete(currentSession, currentSessionIndex);
            }

            // Move to next session or complete
            if (currentSessionIndex < sessions.length - 1) {
              const nextIndex = currentSessionIndex + 1;
              setCurrentSessionIndex(nextIndex);
              setTimeRemaining(sessions[nextIndex].durationMinutes * 60);
              setStatus('paused');
            } else {
              setStatus('completed');
              if (onAllSessionsComplete) {
                onAllSessionsComplete();
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
  }, [status, currentSessionIndex, sessions, onSessionComplete, onAllSessionsComplete, currentSession]);

  const start = useCallback(() => {
    if (sessions.length === 0) return;

    endTimeRef.current = Date.now() + timeRemaining * 1000;
    setStatus('running');
  }, [sessions, timeRemaining]);

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
      if (onAllSessionsComplete) {
        onAllSessionsComplete();
      }
    }
  }, [currentSessionIndex, sessions, onAllSessionsComplete]);

  return {
    currentSessionIndex,
    currentSession,
    timeRemaining,
    totalTime,
    status,
    progress,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
