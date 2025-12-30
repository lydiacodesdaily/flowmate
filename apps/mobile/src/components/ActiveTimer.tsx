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

  // Reset setup state when route params change (new session started)
  useEffect(() => {
    setSetupInitialized(false);
  }, [routeSessions]);

  // Initialize timer with route sessions on mount (only if not already started)
  useEffect(() => {
    console.log('Init effect - setupInitialized:', setupInitialized, 'status:', status, 'timerType:', timerType);
    if (!setupInitialized && routeSessions && routeSessions.length > 0) {
      // Infer mode from session structure
      const hasSettleWrap = routeSessions.some(s => s.type === 'settle' || s.type === 'wrap');

      let inferredMode: TimerMode = 'custom';
      if (hasSettleWrap) {
        inferredMode = 'guided';
      } else if (routeSessions.length > 1 && routeSessions.some(s => s.durationMinutes === 25)) {
        inferredMode = 'pomodoro';
      }

      console.log('Inferred mode:', inferredMode, 'timerType:', timerType, 'status:', status);

      // Check if this is a focus session that needs setup (custom, pomodoro, or guided)
      const shouldShowSetup = (inferredMode === 'custom' || inferredMode === 'pomodoro' || inferredMode === 'guided') && timerType === 'focus';

      console.log('shouldShowSetup:', shouldShowSetup);

      if (shouldShowSetup && status === 'idle') {
        // Show setup modal for custom and pomodoro focus sessions
        console.log('Setting showSetupModal to true');
        setShowSetupModal(true);
      } else if (status === 'idle') {
        // For break sessions, start immediately
        console.log('Starting timer immediately with sessionDraft:', sessionDraft);
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

      // Time announcements with audio mode logic
      const settings = audioService.getSettings();
      const sessionDurationMinutes = totalTime / 60;

      // Determine audio mode based on session duration
      // Awareness mode (≤25 min): supports time awareness with full announcements
      // Deep Focus mode (>25 min): minimal interruptions, no voice escalation
      const isAwarenessMode = sessionDurationMinutes <= 25;

      // Minute announcements
      if (currentMinute !== lastAnnouncementMinuteRef.current && currentMinute > 0) {
        if (isAwarenessMode) {
          // AWARENESS MODE (≤25 minutes)
          // Voice announcements at configured interval
          if (currentMinute % settings.announcementInterval === 0) {
            audioService.announceTimeRemaining(currentMinute);
            lastAnnouncementMinuteRef.current = currentMinute;
          }
        } else {
          // DEEP FOCUS MODE (>25 minutes)
          // No minute-by-minute voice announcements
          // No ding sounds at intervals
          // Silent by design to preserve immersion
          lastAnnouncementMinuteRef.current = currentMinute;
        }
      }

      // Seconds countdown for final minute
      if (currentSecond < 60 && currentSecond > 0) {
        const secondsToAnnounce = [50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

        if (secondsToAnnounce.includes(currentSecond) && currentSecond !== lastAnnouncementSecondRef.current) {
          if (isAwarenessMode && settings.secondsCountdown) {
            // AWARENESS MODE: Allow seconds countdown if enabled
            audioService.announceSecondsRemaining(currentSecond);
            lastAnnouncementSecondRef.current = currentSecond;
          } else {
            // DEEP FOCUS MODE: No verbal countdown
            // OR user has disabled seconds countdown
            lastAnnouncementSecondRef.current = currentSecond;
          }
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

    // Clear session draft for next session
    console.log('handleSessionSave: Clearing sessionDraft and resetting timer');
    setSessionDraft({ intent: '', steps: [] });
    reset(); // Reset timer status to idle
    setShowCompleteModal(false);
    navigation.navigate('ModeSelection');
  };

  const handleSessionDiscard = () => {
    // Clear session draft for next session
    console.log('handleSessionDiscard: Clearing sessionDraft and resetting timer');
    setSessionDraft({ intent: '', steps: [] });
    reset(); // Reset timer status to idle
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
    marginTop: 32,
    paddingHorizontal: 24,
    maxWidth: '100%',
  },
  intentText: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
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
