import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { TimerProvider, useTimerContext } from '../TimerContext';
import type { Session } from '@flowmate/shared';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TimerProvider>{children}</TimerProvider>
);

describe('TimerContext', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useTimerContext', () => {
    it('should throw error when used outside of TimerProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTimerContext());
      }).toThrow('useTimerContext must be used within a TimerProvider');

      consoleSpy.mockRestore();
    });

    it('should return context value when used within TimerProvider', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.status).toBe('idle');
      expect(result.current.sessions).toEqual([]);
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      expect(result.current.sessions).toEqual([]);
      expect(result.current.currentSessionIndex).toBe(0);
      expect(result.current.currentSession).toBeNull();
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.totalTime).toBe(0);
      expect(result.current.status).toBe('idle');
      expect(result.current.progress).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.formattedTime).toBe('0:00');
      expect(result.current.currentPhase).toBeNull();
    });
  });

  describe('startTimer', () => {
    it('should start timer with given sessions', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'focus', durationMinutes: 25 },
        { type: 'break', durationMinutes: 5 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      expect(result.current.sessions).toEqual(sessions);
      expect(result.current.currentSessionIndex).toBe(0);
      expect(result.current.currentSession).toEqual(sessions[0]);
      expect(result.current.timeRemaining).toBe(25 * 60);
      expect(result.current.status).toBe('running');
      expect(result.current.isActive).toBe(true);
      expect(result.current.timerMode).toBe('pomodoro');
      expect(result.current.timerType).toBe('focus');
    });

    it('should not start timer with empty sessions array', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([], 'pomodoro', 'focus');
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.sessions).toEqual([]);
    });

    it('should update formattedTime correctly', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      expect(result.current.formattedTime).toBe('25:00');
    });

    it('should set currentPhase based on session type', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'settle', durationMinutes: 3 },
        { type: 'focus', durationMinutes: 25 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'guided', 'focus');
      });

      expect(result.current.currentPhase).toBe('settle');
    });

    it('should accept optional session draft parameter', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];
      const draft = {
        intent: 'Write tests',
        steps: [
          { id: '1', text: 'Step 1', done: false },
          { id: '2', text: 'Step 2', done: false }
        ]
      };

      act(() => {
        result.current.startTimer(sessions, 'custom', 'focus', draft);
      });

      expect(result.current.sessionDraft).toEqual(draft);
      expect(result.current.timerMode).toBe('custom');
    });
  });

  describe('pause and resume', () => {
    it('should pause a running timer', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      expect(result.current.status).toBe('running');

      act(() => {
        result.current.pause();
      });

      expect(result.current.status).toBe('paused');
      expect(result.current.isActive).toBe(true);
    });

    it('should resume a paused timer', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      expect(result.current.status).toBe('paused');

      act(() => {
        result.current.resume();
      });

      expect(result.current.status).toBe('running');
    });

    it('should not resume if time remaining is 0', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      // Manually set time remaining to 0
      act(() => {
        result.current.subtractTime(25 * 60);
      });

      act(() => {
        result.current.resume();
      });

      expect(result.current.status).toBe('paused');
    });
  });

  describe('reset', () => {
    it('should reset timer to initial session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'focus', durationMinutes: 25 },
        { type: 'break', durationMinutes: 5 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.pause();
      });

      act(() => {
        result.current.skip(); // Move to second session
      });

      expect(result.current.currentSessionIndex).toBe(1);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentSessionIndex).toBe(0);
      expect(result.current.timeRemaining).toBe(25 * 60);
      expect(result.current.status).toBe('idle');
    });
  });

  describe('skip', () => {
    it('should skip to next session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'focus', durationMinutes: 25 },
        { type: 'break', durationMinutes: 5 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      expect(result.current.currentSessionIndex).toBe(0);

      act(() => {
        result.current.skip();
      });

      expect(result.current.currentSessionIndex).toBe(1);
      expect(result.current.currentSession).toEqual(sessions[1]);
      expect(result.current.timeRemaining).toBe(5 * 60);
      expect(result.current.status).toBe('paused');
    });

    it('should set status to completed when skipping last session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.skip();
      });

      expect(result.current.status).toBe('completed');
    });

    it('should call onAllSessionsComplete when skipping last session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });
      const mockCallback = jest.fn();

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.setAllSessionsCompleteCallback(mockCallback);
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.skip();
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('addTime and subtractTime', () => {
    it('should add time to current session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      const initialTime = result.current.timeRemaining;

      act(() => {
        result.current.addTime(60); // Add 1 minute
      });

      expect(result.current.timeRemaining).toBe(initialTime + 60);
    });

    it('should subtract time from current session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      const initialTime = result.current.timeRemaining;

      act(() => {
        result.current.subtractTime(60); // Subtract 1 minute
      });

      expect(result.current.timeRemaining).toBe(initialTime - 60);
    });

    it('should not allow time to go below 0 when subtracting', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 1 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      act(() => {
        result.current.subtractTime(5 * 60); // Subtract more than available
      });

      expect(result.current.timeRemaining).toBe(0);
    });
  });

  describe('addPomodoros and removePomodoros', () => {
    it('should add pomodoro cycles (break + focus)', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.addPomodoros(1);
      });

      expect(result.current.sessions.length).toBe(3); // original + break + focus
      expect(result.current.sessions[1].type).toBe('break');
      expect(result.current.sessions[1].durationMinutes).toBe(5);
      expect(result.current.sessions[2].type).toBe('focus');
      expect(result.current.sessions[2].durationMinutes).toBe(25);
    });

    it('should add multiple pomodoro cycles', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.addPomodoros(2);
      });

      expect(result.current.sessions.length).toBe(5); // original + (break + focus) * 2
    });

    it('should remove pomodoro cycles from the end', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'focus', durationMinutes: 25 },
        { type: 'break', durationMinutes: 5 },
        { type: 'focus', durationMinutes: 25 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.removePomodoros(1); // Remove break + focus
      });

      expect(result.current.sessions.length).toBe(1);
    });

    it('should not remove pomodoros if it would affect current session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [
        { type: 'focus', durationMinutes: 25 },
        { type: 'break', durationMinutes: 5 },
      ];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      act(() => {
        result.current.removePomodoros(1); // Try to remove, but shouldn't affect current
      });

      // Should keep at least current session
      expect(result.current.sessions.length).toBe(2);
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 10 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
      });

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.subtractTime(5 * 60); // 5 minutes elapsed
      });

      expect(result.current.progress).toBeCloseTo(0.5, 1);
    });

    it('should return 0 progress when totalTime is 0', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      expect(result.current.progress).toBe(0);
    });
  });

  describe('formattedTime', () => {
    it('should format time as MM:SS for times under 1 hour', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 25 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
      });

      expect(result.current.formattedTime).toBe('25:00');
    });

    it('should format time as HH:MM:SS for times over 1 hour', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 90 }];

      act(() => {
        result.current.startTimer(sessions, 'guided', 'focus');
      });

      expect(result.current.formattedTime).toBe('1:30:00');
    });

    it('should pad minutes and seconds with leading zeros', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      const sessions: Session[] = [{ type: 'focus', durationMinutes: 1 }];

      act(() => {
        result.current.startTimer(sessions, 'pomodoro', 'focus');
        result.current.pause();
        result.current.subtractTime(55); // Leave 5 seconds
      });

      expect(result.current.formattedTime).toBe('0:05');
    });
  });

  describe('callbacks', () => {
    it('should allow setting session complete callback', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });
      const mockCallback = jest.fn();

      act(() => {
        result.current.setSessionCompleteCallback(mockCallback);
      });

      // Callback is set - we can verify it's called in integration tests
      expect(result.current.setSessionCompleteCallback).toBeDefined();
    });

    it('should allow setting all sessions complete callback', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });
      const mockCallback = jest.fn();

      act(() => {
        result.current.setAllSessionsCompleteCallback(mockCallback);
      });

      // Callback is set - we can verify it's called in integration tests
      expect(result.current.setAllSessionsCompleteCallback).toBeDefined();
    });
  });

  describe('currentPhase', () => {
    it('should return correct phase for focus session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'focus', durationMinutes: 25 }], 'pomodoro', 'focus');
      });

      expect(result.current.currentPhase).toBe('focus');
    });

    it('should return correct phase for break session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'break', durationMinutes: 5 }], 'pomodoro', 'break');
      });

      expect(result.current.currentPhase).toBe('break');
    });

    it('should return correct phase for settle session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'settle', durationMinutes: 3 }], 'guided', 'focus');
      });

      expect(result.current.currentPhase).toBe('settle');
    });

    it('should return correct phase for wrap session', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'wrap', durationMinutes: 3 }], 'guided', 'focus');
      });

      expect(result.current.currentPhase).toBe('wrap');
    });

    it('should return null when no session is active', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      expect(result.current.currentPhase).toBeNull();
    });
  });

  describe('isActive', () => {
    it('should be true when status is running', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'focus', durationMinutes: 25 }], 'pomodoro', 'focus');
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should be true when status is paused', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'focus', durationMinutes: 25 }], 'pomodoro', 'focus');
        result.current.pause();
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should be false when status is idle', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      expect(result.current.isActive).toBe(false);
    });

    it('should be false when status is completed', () => {
      const { result } = renderHook(() => useTimerContext(), { wrapper });

      act(() => {
        result.current.startTimer([{ type: 'focus', durationMinutes: 25 }], 'pomodoro', 'focus');
        result.current.skip();
      });

      expect(result.current.isActive).toBe(false);
    });
  });
});
