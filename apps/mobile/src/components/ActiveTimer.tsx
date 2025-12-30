import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerContext } from '../contexts/TimerContext';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAdjustments } from './TimerAdjustments';
import { AudioControls } from './AudioControls';
import { ProgressBar } from './ProgressBar';
import { SessionIndicators } from './SessionIndicators';
import { SessionSetup } from './SessionSetup';
import { SessionComplete } from './SessionComplete';
import { audioService } from '../services/audioService';
import { statsService } from '../services/statsService';
import { createSessionRecord, appendHistory } from '../services/sessionService';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../theme';
import type { ActiveTimerScreenProps } from '../navigation/types';
import type { SessionStatus, TimerMode } from '@flowmate/shared';

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

  // Session management state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [setupInitialized, setSetupInitialized] = useState(false);

  const {
    sessions,
    currentSessionIndex,
    currentSession,
    timeRemaining,
    totalTime,
    status,
    progress,
    timerMode,
    timerType,
    sessionDraft,
    sessionStartTime,
    sessionEndTime,
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
    setSessionDraft,
    updateSessionDraft,
  } = useTimerContext();

  // Initialize timer with route sessions on mount (only if not already started)
  useEffect(() => {
    if (!setupInitialized && routeSessions && routeSessions.length > 0) {
      // Infer mode from session structure
      const hasSettleWrap = routeSessions.some(s => s.type === 'settle' || s.type === 'wrap');

      let inferredMode: TimerMode = 'custom';
      if (hasSettleWrap) {
        inferredMode = 'guided';
      } else if (routeSessions.length > 1 && routeSessions.some(s => s.durationMinutes === 25)) {
        inferredMode = 'pomodoro';
      }

      // Check if this is a custom focus session that needs setup
      const shouldShowSetup = inferredMode === 'custom' && timerType === 'focus';

      if (shouldShowSetup && status === 'idle') {
        // Show setup modal for custom focus sessions
        setShowSetupModal(true);
      } else if (status === 'idle') {
        // For break sessions, guided sessions, or pomodoro, start immediately
        startTimer(routeSessions, inferredMode, timerType, sessionDraft);
      }
      setSetupInitialized(true);
    }
  }, [routeSessions, timerType, status, setupInitialized, startTimer, sessionDraft]);

  // Set up callbacks for session completion
  useEffect(() => {
    setSessionCompleteCallback(async (session, sessionIndex) => {
      // Record session stats (legacy)
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
        // Notify about auto-starting next session (user may not be looking at screen)
        await notificationService.scheduleSessionStartNotification(
          nextSession.type,
          nextSession.durationMinutes
        );
      }
    });

    setAllSessionsCompleteCallback(async () => {
      await hapticService.heavy();
      await audioService.announceAllComplete();
      lastMinuteRef.current = -1;
      lastAnnouncementMinuteRef.current = -1;
      lastAnnouncementSecondRef.current = -1;

      // Show complete modal for custom focus sessions
      if (timerMode === 'custom' && timerType === 'focus') {
        setShowCompleteModal(true);
      }
    });
  }, [sessions, timerMode, timerType, setSessionCompleteCallback, setAllSessionsCompleteCallback]);

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
      // No notification on manual start - user is already engaged
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

  // Session Setup handlers
  const handleSetupStart = (draft: any) => {
    setSessionDraft(draft);
    setShowSetupModal(false);

    // Start the timer with the draft
    const mode = timerMode || 'custom';
    const type = timerType || 'focus';
    startTimer(routeSessions, mode, type, draft);
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);

    // Start without a draft
    const mode = timerMode || 'custom';
    const type = timerType || 'focus';
    startTimer(routeSessions, mode, type, { intent: '', steps: [] });
  };

  // Session Complete handlers
  const handleSessionSave = (sessionStatus: SessionStatus, updatedSteps?: any, notes?: string) => {
    // Create session record
    if (sessionStartTime && sessionEndTime && timerMode && timerType) {
      const plannedSeconds = totalTime;
      const completedSeconds = totalTime - timeRemaining;
      const sessionType = currentSession?.type || 'focus';

      const record = createSessionRecord(
        sessionStartTime,
        sessionEndTime,
        plannedSeconds,
        completedSeconds,
        timerMode,
        timerType,
        sessionType,
        sessionStatus,
        sessionDraft,
        notes
      );

      // Save to history
      appendHistory(record);
    }

    setShowCompleteModal(false);
    navigation.navigate('ModeSelection');
  };

  const handleSessionDiscard = () => {
    setShowCompleteModal(false);
    navigation.navigate('ModeSelection');
  };

  // Check if this is a standard pomodoro-style timer (has 25-min focus sessions with 5-min breaks)
  // Excludes guided pomodoro which has settle/wrap phases
  const isPomodoroStyle = sessions.some(
    (session) => session.type === 'focus' && session.durationMinutes === 25
  ) && !sessions.some(
    (session) => session.type === 'settle' || session.type === 'wrap'
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

          {/* Display session intent if present */}
          {sessionDraft?.intent && (
            <View style={styles.intentContainer}>
              <Text style={[styles.intentText, { color: theme.colors.textSecondary }]}>
                {sessionDraft.intent}
              </Text>
            </View>
          )}

          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
          </View>

          <TimerAdjustments
            onAddTime={handleAddTime}
            onSubtractTime={handleSubtractTime}
            onAddPomodoro={handleAddPomodoro}
            onRemovePomodoro={handleRemovePomodoro}
            disabled={status === 'completed'}
            canRemovePomodoro={canRemovePomodoro}
            showPomodoroControls={isPomodoroStyle}
          />
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

      {/* Session Setup Modal */}
      <SessionSetup
        visible={showSetupModal}
        onStart={handleSetupStart}
        onSkip={handleSetupSkip}
        initialDraft={sessionDraft}
      />

      {/* Session Complete Modal */}
      <SessionComplete
        visible={showCompleteModal}
        timerType={timerType || 'focus'}
        completedSeconds={totalTime - timeRemaining}
        plannedSeconds={totalTime}
        draft={sessionDraft}
        onSave={handleSessionSave}
        onDiscard={handleSessionDiscard}
      />
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
  intentContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  intentText: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
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
