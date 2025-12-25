import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerContext } from '../contexts/TimerContext';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAdjustControls } from './TimerAdjustControls';
import { PomodoroAdjustControls } from './PomodoroAdjustControls';
import { AudioControls } from './AudioControls';
import { ProgressBar } from './ProgressBar';
import { SessionIndicators } from './SessionIndicators';
import { audioService } from '../services/audioService';
import { statsService } from '../services/statsService';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../theme';
import type { ActiveTimerScreenProps } from '../navigation/types';

export function ActiveTimer({ route, navigation }: ActiveTimerScreenProps) {
  const { sessions: routeSessions } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const lastMinuteRef = useRef<number>(-1);
  const lastAnnouncementMinuteRef = useRef<number>(-1);
  const lastAnnouncementSecondRef = useRef<number>(-1);
  const audioInitializedRef = useRef(false);
  const timerInitializedRef = useRef(false);

  // Audio settings state
  const [muteAll, setMuteAll] = useState(false);
  const [muteDuringBreaks, setMuteDuringBreaks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
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
    reset,
    skip,
    addTime,
    subtractTime,
    addPomodoros,
    removePomodoros,
    setSessionCompleteCallback,
    setAllSessionsCompleteCallback,
  } = useTimerContext();

  // Initialize timer with route sessions on mount (only if not already started)
  useEffect(() => {
    if (!timerInitializedRef.current && routeSessions && routeSessions.length > 0) {
      // Only start timer if it's not already active
      if (status === 'idle') {
        startTimer(routeSessions);
      }
      timerInitializedRef.current = true;
    }
  }, [routeSessions, startTimer, status]);

  // Set up callbacks for session completion
  useEffect(() => {
    setSessionCompleteCallback(async (session, sessionIndex) => {
      // Record session stats
      await statsService.recordSession(session);

      // Haptic feedback
      await hapticService.success();

      // Audio announcement
      await audioService.announceSessionComplete();

      // Notification
      await notificationService.scheduleSessionCompleteNotification(session.type);

      // Announce next session if not the last one
      if (sessionIndex < sessions.length - 1) {
        const nextSession = sessions[sessionIndex + 1];
        await audioService.announceSessionStart(nextSession.type);
      }
    });

    setAllSessionsCompleteCallback(async () => {
      await hapticService.heavy();
      await audioService.announceAllComplete();
      lastMinuteRef.current = -1;
      lastAnnouncementMinuteRef.current = -1;
      lastAnnouncementSecondRef.current = -1;
    });
  }, [sessions, setSessionCompleteCallback, setAllSessionsCompleteCallback]);

  // Keep screen awake when timer is running
  useKeepAwake(status === 'running');

  // Initialize audio on mount
  useEffect(() => {
    const initAudio = async () => {
      if (!audioInitializedRef.current) {
        await audioService.initialize();
        await audioService.loadTickSounds();
        await audioService.loadTransitionSounds();
        await notificationService.initialize();

        // Load saved audio settings and sync with local state
        const settings = audioService.getSettings();
        setMuteAll(settings.muteAll);
        setMuteDuringBreaks(settings.muteDuringBreaks);

        audioInitializedRef.current = true;
      }
    };

    initAudio();

    return () => {
      audioService.cleanup();
    };
  }, []);

  // Handle tick sounds and announcements
  useEffect(() => {
    if (status === 'running' && currentSession) {
      const currentMinute = Math.ceil(timeRemaining / 60);
      const currentSecond = Math.floor(timeRemaining);

      // Play tick sound every second
      if (timeRemaining % 1 === 0 && timeRemaining > 0) {
        audioService.playTick(currentSession.type);
      }

      // Time announcements
      const settings = audioService.getSettings();

      // Minute announcements (always check first)
      if (currentMinute !== lastAnnouncementMinuteRef.current && currentMinute > 0) {
        // For sessions <= 25 minutes: voice announcement at configured interval (we have m01-m24.mp3)
        // For sessions > 25 minutes: ding.mp3 every 5 minutes (no voice announcements available)
        if (totalTime / 60 <= 25) {
          // 25 minutes or less: announce at configured interval with voice
          if (currentMinute % settings.announcementInterval === 0) {
            audioService.announceTimeRemaining(currentMinute);
            lastAnnouncementMinuteRef.current = currentMinute;
          }
        } else if (currentMinute % 5 === 0) {
          // More than 25 minutes: ding every 5 minutes (fixed interval, no voice files)
          audioService.announceSessionComplete(); // Play ding.mp3
          lastAnnouncementMinuteRef.current = currentMinute;
        }
      }

      // Handle seconds countdown for last minute (<60 seconds, not at exactly 60)
      if (currentSecond < 60 && currentSecond > 0) {
        const secondsToAnnounce = [50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        if (secondsToAnnounce.includes(currentSecond) && currentSecond !== lastAnnouncementSecondRef.current) {
          audioService.announceSecondsRemaining(currentSecond);
          lastAnnouncementSecondRef.current = currentSecond;
        }
      }

      // Minute change haptic
      if (currentMinute !== lastMinuteRef.current) {
        hapticService.light();
        lastMinuteRef.current = currentMinute;
      }
    }
  }, [status, timeRemaining, currentSession, totalTime]);

  const handleStart = async () => {
    if (currentSession) {
      await audioService.announceSessionStart(currentSession.type);
      await notificationService.scheduleSessionStartNotification(
        currentSession.type,
        currentSession.durationMinutes
      );
    }
    await hapticService.medium();
    resume();
  };

  const handlePause = async () => {
    await hapticService.light();
    pause();
  };

  const handleResume = async () => {
    await hapticService.medium();
    resume();
  };

  const handleReset = async () => {
    await hapticService.medium();
    lastMinuteRef.current = -1;
    lastAnnouncementMinuteRef.current = -1;
    lastAnnouncementSecondRef.current = -1;
    reset();
  };

  const handleSkip = async () => {
    await hapticService.light();
    skip();
  };

  const handleBack = async () => {
    await hapticService.selection();
    await notificationService.cancelAllNotifications();
    navigation.navigate('ModeSelection');
  };

  const handleAddTime = async () => {
    await hapticService.light();
    addTime(300); // Add 5 minutes (300 seconds)
  };

  const handleSubtractTime = async () => {
    await hapticService.light();
    subtractTime(300); // Subtract 5 minutes (300 seconds)
  };

  const handleToggleMuteAll = async () => {
    await hapticService.selection();
    const newMuteAll = !muteAll;
    setMuteAll(newMuteAll);
    audioService.updateSettings({ muteAll: newMuteAll });
  };

  const handleToggleMuteDuringBreaks = async () => {
    await hapticService.selection();
    const newMuteDuringBreaks = !muteDuringBreaks;
    setMuteDuringBreaks(newMuteDuringBreaks);
    audioService.updateSettings({ muteDuringBreaks: newMuteDuringBreaks });
  };

  const handleToggleSettings = async () => {
    await hapticService.selection();
    setShowSettings(!showSettings);
  };

  const handleAddPomodoro = async () => {
    await hapticService.light();
    addPomodoros(1);
  };

  const handleRemovePomodoro = async () => {
    await hapticService.light();
    removePomodoros(1);
  };

  // Check if this is a pomodoro-style timer (has 25-min focus sessions with 5-min breaks)
  const isPomodoroStyle = sessions.some(
    (session) => session.type === 'focus' && session.durationMinutes === 25
  );

  // Check if we can remove pomodoros (need at least currentSessionIndex + 1 sessions)
  const canRemovePomodoro = sessions.length > currentSessionIndex + 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Minimal header with back and settings */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleSettings} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Main content - centered and spacious */}
      <View style={styles.content}>
        <SessionIndicators
          sessions={sessions}
          currentSessionIndex={currentSessionIndex}
        />

        <View style={styles.timerContainer}>
          <TimerDisplay
            timeRemaining={timeRemaining}
            sessionLabel={currentSession?.label || currentSession?.type}
            sessionType={currentSession?.type}
          />

          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
          </View>

          <TimerAdjustControls
            onAddTime={handleAddTime}
            onSubtractTime={handleSubtractTime}
            disabled={status === 'completed'}
          />

          {isPomodoroStyle && (
            <PomodoroAdjustControls
              onAddPomodoro={handleAddPomodoro}
              onRemovePomodoro={handleRemovePomodoro}
              disabled={status === 'completed'}
              canRemove={canRemovePomodoro}
            />
          )}
        </View>

        <View style={styles.controlsContainer}>
          <TimerControls
            status={status}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            onSkip={handleSkip}
          />
        </View>
      </View>

      {/* Audio settings modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={handleToggleSettings}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
          activeOpacity={1}
          onPress={handleToggleSettings}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textTertiary }]}>Audio Settings</Text>

            <AudioControls
              muteAll={muteAll}
              muteDuringBreaks={muteDuringBreaks}
              onToggleMuteAll={handleToggleMuteAll}
              onToggleMuteDuringBreaks={handleToggleMuteDuringBreaks}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleToggleSettings}
            >
              <Text style={[styles.modalCloseButtonText, { color: theme.colors.textTertiary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerButton: {
    padding: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 0,
  },
  progressContainer: {
    width: '100%',
    marginTop: 40,
  },
  controlsContainer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
});
