import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Switch, ScrollView, LayoutAnimation, Platform, UIManager, Pressable } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerContext, useReviewPrompt } from '../contexts';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAdjustments } from './TimerAdjustments';
import { AudioControls } from './AudioControls';
import { TimerVisual } from './timer-visuals';
import { SessionIndicators } from './SessionIndicators';
import { SessionSetup } from './SessionSetup';
import { SessionComplete } from './SessionComplete';
import { EarlyStopModal } from './EarlyStopModal';
import { TransitionWarning } from './TransitionWarning';
import { ActiveSteps } from './ActiveSteps';
import { EarlyCompletionBanner } from './EarlyCompletionBanner';
import { ContextualTip } from './tips';
import { audioService } from '../services/audioService';
import { createSessionRecord, appendHistory, updateHistoryRecord } from '../services/sessionService';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../theme';
import { useAccessibility } from '../contexts';
import { useResponsive } from '../hooks/useResponsive';
import type { ActiveTimerScreenProps } from '../navigation/types';
import type { Session, SessionStatus, TimerMode } from '@flowmate/shared';
import { saveLastSession, loadFocusLockSettings, saveFocusLockSettings } from '../utils/storage';

// Generate a label for quick-start display
function generateSessionLabel(mode: TimerMode, sessions: Session[]): string {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  if (mode === 'pomodoro') {
    const focusCount = sessions.filter(s => s.type === 'focus').length;
    return `${focusCount} Pomodoro${focusCount > 1 ? 's' : ''}`;
  }

  if (mode === 'guided') {
    const hasDeepFocus = sessions.some(s => s.type === 'focus' && s.durationMinutes >= 50);
    const style = hasDeepFocus ? 'Deep' : 'Pomodoro';
    return `${totalMinutes}m Guided (${style})`;
  }

  return `${totalMinutes}m Custom`;
}

export function ActiveTimer({ route, navigation }: ActiveTimerScreenProps) {
  const { sessions: routeSessions, isQuickStart } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { reduceMotion, skipFocusPrompt } = useAccessibility();
  const { contentStyle, sheetStyle } = useResponsive();
  const audioInitializedRef = useRef(false);
  const timerInitializedRef = useRef(false);

  // Audio settings state
  const [muteDuringBreaks, setMuteDuringBreaks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Session management state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEarlyStopModal, setShowEarlyStopModal] = useState(false);
  const [setupInitialized, setSetupInitialized] = useState(false);

  // Focus lock state
  const [focusLockEnabled, setFocusLockEnabled] = useState(false);

  // Early completion banner dismissed state
  const [earlyCompletionDismissed, setEarlyCompletionDismissed] = useState(false);

  // Expandable intent state
  const [intentExpanded, setIntentExpanded] = useState(false);

  // Auto-saved record tracking (for enhancement modal flow)
  const [autoSavedRecordId, setAutoSavedRecordId] = useState<string | null>(null);

  // Load focus lock setting on mount
  useEffect(() => {
    loadFocusLockSettings().then(settings => setFocusLockEnabled(settings.enabled));
  }, []);


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
    setSessionSkipCallback,
    setSessionDraft,
    updateSessionDraft,
    isInTransitionZone,
    transitionSecondsRemaining,
  } = useTimerContext();

  const { onFocusSessionComplete } = useReviewPrompt();

  // Refs for callback access (to avoid stale closures)
  const sessionDraftRef = useRef(sessionDraft);
  const timerModeRef = useRef(timerMode);
  const timerTypeRef = useRef(timerType);
  const sessionStartTimeRef = useRef(sessionStartTime);
  const sessionEndTimeRef = useRef(sessionEndTime);
  const totalTimeRef = useRef(totalTime);
  const onFocusSessionCompleteRef = useRef(onFocusSessionComplete);

  // Keep refs in sync with current values
  useEffect(() => {
    sessionDraftRef.current = sessionDraft;
    timerModeRef.current = timerMode;
    timerTypeRef.current = timerType;
    sessionStartTimeRef.current = sessionStartTime;
    sessionEndTimeRef.current = sessionEndTime;
    totalTimeRef.current = totalTime;
    onFocusSessionCompleteRef.current = onFocusSessionComplete;
  }, [sessionDraft, timerMode, timerType, sessionStartTime, sessionEndTime, totalTime, onFocusSessionComplete]);

  // Check if controls should be locked
  const isLocked = focusLockEnabled && (status === 'running' || status === 'paused');

  const handleToggleFocusLock = async () => {
    const newValue = !focusLockEnabled;
    setFocusLockEnabled(newValue);
    await saveFocusLockSettings({ enabled: newValue });
    await hapticService.selection();
  };

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
      // Skip setup for Quick Start or if user has disabled focus prompt in settings
      const isFocusSession = (inferredMode === 'custom' || inferredMode === 'pomodoro' || inferredMode === 'guided') && timerType === 'focus';
      const shouldShowSetup = isFocusSession && !isQuickStart && !skipFocusPrompt;

      console.log('shouldShowSetup:', shouldShowSetup, 'isQuickStart:', isQuickStart, 'skipFocusPrompt:', skipFocusPrompt);

      if (shouldShowSetup && status === 'idle') {
        // Show setup modal for focus sessions (unless quick start or setting disabled)
        console.log('Setting showSetupModal to true');
        setShowSetupModal(true);
      } else if (status === 'idle') {
        // For break sessions, start immediately
        console.log('Starting timer immediately with sessionDraft:', sessionDraft);
        startTimer(routeSessions, inferredMode, timerType, sessionDraft);
      }
      setSetupInitialized(true);
    }
  }, [routeSessions, timerType, status, setupInitialized, startTimer, sessionDraft, isQuickStart, skipFocusPrompt]);

  // Set up callbacks for session completion
  useEffect(() => {
    setSessionCompleteCallback(async (session, sessionIndex) => {
      // Calculate timing for THIS individual session
      const sessionEndTime = Date.now();
      const sessionDurationSeconds = session.durationMinutes * 60;
      // Approximate start time based on duration (session ran to completion)
      const sessionStartTime = sessionEndTime - (sessionDurationSeconds * 1000);

      // Determine timerType based on session.type (breaks vs focus/settle/wrap)
      const sessionTimerType = session.type === 'break' ? 'break' : 'focus';

      // Get current values from refs
      const currentMode = timerModeRef.current;
      const currentDraft = sessionDraftRef.current;

      // Create SessionRecord for this individual session
      if (currentMode) {
        const record = createSessionRecord(
          sessionStartTime,
          sessionEndTime,
          sessionDurationSeconds,       // plannedSeconds
          sessionDurationSeconds,       // completedSeconds (ran to completion)
          currentMode,
          sessionTimerType,             // 'focus' or 'break'
          session.type,                 // 'settle', 'focus', 'break', 'wrap'
          'completed',
          sessionTimerType === 'focus' ? currentDraft : undefined  // Only attach draft to focus sessions
        );

        await appendHistory(record);
        setAutoSavedRecordId(record.id);
      }

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
      audioService.resetAnnouncementTracking();

      // The last session was already recorded in setSessionCompleteCallback
      // Just handle the enhancement modal flow and navigation

      const currentDraft = sessionDraftRef.current;
      const currentType = timerTypeRef.current;

      // Show enhancement modal for focus sessions with intent or steps
      const hasIntent = currentDraft?.intent && currentDraft.intent.trim().length > 0;
      const hasSteps = currentDraft?.steps && currentDraft.steps.length > 0;
      if (currentType === 'focus' && (hasIntent || hasSteps)) {
        setShowCompleteModal(true);
      } else {
        // Track focus session completion for review prompt eligibility
        if (currentType === 'focus') {
          await onFocusSessionCompleteRef.current();
        }
        // No intent/steps - just navigate back after a brief moment
        setTimeout(() => {
          setSessionDraft({ intent: '', steps: [] });
          reset();
          navigation.navigate('ModeSelection');
        }, 500);
      }
    });

    // Handle skipped sessions - record them with 'skipped' status
    setSessionSkipCallback(async (session, elapsedSeconds) => {
      const currentMode = timerModeRef.current;
      if (!currentMode) return;

      // Calculate timing for the skipped session
      const sessionEndTime = Date.now();
      const sessionDurationSeconds = session.durationMinutes * 60;
      const sessionStartTime = sessionEndTime - (elapsedSeconds * 1000);

      // Determine timerType based on session.type
      const sessionTimerType = session.type === 'break' ? 'break' : 'focus';

      // Determine status: skipped if < 60s, partial if >= 60s
      const sessionStatus = elapsedSeconds < 60 ? 'skipped' : 'partial';

      const record = createSessionRecord(
        sessionStartTime,
        sessionEndTime,
        sessionDurationSeconds,       // plannedSeconds
        elapsedSeconds,               // completedSeconds (actual elapsed)
        currentMode,
        sessionTimerType,
        session.type,
        sessionStatus,
        sessionTimerType === 'focus' ? sessionDraftRef.current : undefined
      );

      await appendHistory(record);
    });
  }, [sessions, currentSession, setSessionCompleteCallback, setAllSessionsCompleteCallback, setSessionSkipCallback, setSessionDraft, reset, navigation]);

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
        setMuteDuringBreaks(settings.muteDuringBreaks);

        audioInitializedRef.current = true;
      }
    };

    initAudio();

    // NOTE: We intentionally do NOT call audioService.cleanup() on unmount.
    // The timer continues running in TimerContext when this screen is minimized,
    // so audio should keep playing. Cleanup happens when the timer is reset/stopped.
  }, []);

  // NOTE: Tick sounds, announcements, and minute haptics are now handled by
  // audioService.startTickLoop() which is managed by TimerContext.
  // This decouples audio timing from React render cycles.

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
    // Show confirmation modal instead of immediately resetting
    await hapticService.light();
    setShowEarlyStopModal(true);
  };

  const handleSkip = async () => {
    await hapticService.light();
    skip();
  };

  const handleBack = async () => {
    // If timer is running or paused, show confirmation modal
    if (status === 'running' || status === 'paused') {
      await hapticService.light();
      setShowEarlyStopModal(true);
      return;
    }
    await hapticService.selection();
    await notificationService.cancelAllNotifications();
    navigation.navigate('ModeSelection');
  };

  const handleEarlyStopContinue = async () => {
    await hapticService.selection();
    setShowEarlyStopModal(false);
  };

  // Minimum seconds required to count as "partial" (otherwise it's "skipped")
  const MIN_PARTIAL_THRESHOLD_SECONDS = 60;

  const handleEarlyStopConfirm = async () => {
    await hapticService.medium();
    audioService.resetAnnouncementTracking();
    setShowEarlyStopModal(false);
    await notificationService.cancelAllNotifications();

    // Auto-save session - use "skipped" for < 60s, "partial" for meaningful work
    if (sessionStartTime && timerMode && timerType) {
      const endTime = Date.now();
      const completedSeconds = totalTime - timeRemaining;
      const sessionType = currentSession?.type || 'focus';

      // Sessions under 60 seconds are considered "skipped" (false starts)
      const sessionStatus = completedSeconds < MIN_PARTIAL_THRESHOLD_SECONDS ? 'skipped' : 'partial';

      const record = createSessionRecord(
        sessionStartTime,
        endTime,
        totalTime,
        completedSeconds,
        timerMode,
        timerType,
        sessionType,
        sessionStatus,
        sessionDraft
      );

      await appendHistory(record);
      setAutoSavedRecordId(record.id);

      // Show enhancement modal for partial focus sessions with intent or steps
      // Skip the modal for "skipped" sessions (< 60s) - no meaningful work to reflect on
      const hasIntent = sessionDraft?.intent && sessionDraft.intent.trim().length > 0;
      const hasSteps = sessionDraft?.steps && sessionDraft.steps.length > 0;
      if (sessionStatus === 'partial' && timerType === 'focus' && (hasIntent || hasSteps)) {
        setShowCompleteModal(true);
        return; // Don't navigate yet - modal will handle it
      }
    }

    // No intent/steps or skipped session - just navigate back
    reset();
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

  // Step toggling during active session
  const handleToggleStep = async (stepId: string) => {
    if (!sessionDraft?.steps) return;

    await hapticService.selection();
    const updatedSteps = sessionDraft.steps.map((step) =>
      step.id === stepId ? { ...step, done: !step.done } : step
    );
    updateSessionDraft({ ...sessionDraft, steps: updatedSteps });

    // Reset early completion dismissed state when toggling steps
    setEarlyCompletionDismissed(false);
  };

  // Early completion handlers
  const handleEarlyComplete = async () => {
    await hapticService.medium();

    // Auto-save session with "completed" status (user finished early but completed the task)
    if (sessionStartTime && timerMode && timerType) {
      const endTime = Date.now();
      const completedSeconds = totalTime - timeRemaining;
      const sessionType = currentSession?.type || 'focus';

      const record = createSessionRecord(
        sessionStartTime,
        endTime,
        totalTime,
        completedSeconds,
        timerMode,
        timerType,
        sessionType,
        'completed',
        sessionDraft
      );

      await appendHistory(record);
      setAutoSavedRecordId(record.id);

      // Show the completion modal for focus sessions with intent/steps
      const hasIntent = sessionDraft?.intent && sessionDraft.intent.trim().length > 0;
      const hasSteps = sessionDraft?.steps && sessionDraft.steps.length > 0;
      if (timerType === 'focus' && (hasIntent || hasSteps)) {
        setShowCompleteModal(true);
        return;
      }
    }

    // No intent/steps - just skip to next session or complete
    skip();
  };

  const handleDismissEarlyCompletion = async () => {
    await hapticService.light();
    setEarlyCompletionDismissed(true);
  };

  // Check if all steps are complete (for early completion prompt)
  const allStepsComplete = sessionDraft?.steps?.length > 0 &&
    sessionDraft.steps.every(step => step.done);
  const showEarlyCompletionBanner = allStepsComplete &&
    !earlyCompletionDismissed &&
    status === 'running';

  // Session Setup handlers
  const handleSetupStart = (draft: any) => {
    setSessionDraft(draft);
    setShowSetupModal(false);

    // Start the timer with the draft
    const mode = timerMode || 'custom';
    const type = timerType || 'focus';
    startTimer(routeSessions, mode, type, draft);

    // Save for quick-start
    saveLastSession({
      mode,
      sessions: routeSessions,
      timerType: type,
      label: generateSessionLabel(mode, routeSessions),
      timestamp: Date.now(),
    });
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);

    // Start without a draft
    const mode = timerMode || 'custom';
    const type = timerType || 'focus';
    startTimer(routeSessions, mode, type, { intent: '', steps: [] });

    // Save for quick-start
    saveLastSession({
      mode,
      sessions: routeSessions,
      timerType: type,
      label: generateSessionLabel(mode, routeSessions),
      timestamp: Date.now(),
    });
  };

  // Session Complete handlers
  const handleSessionSave = async (sessionStatus: SessionStatus, updatedSteps?: any, notes?: string) => {
    // If we have an auto-saved record, update it with user's changes
    if (autoSavedRecordId) {
      const stepsSummary = updatedSteps && updatedSteps.length > 0
        ? { total: updatedSteps.length, done: updatedSteps.filter((s: any) => s.done).length }
        : undefined;

      await updateHistoryRecord(autoSavedRecordId, {
        status: sessionStatus,
        note: notes,
        steps: stepsSummary,
      });
      setAutoSavedRecordId(null);
    } else {
      // Fallback: create new record if somehow we don't have an auto-saved one
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

        await appendHistory(record);
      }
    }

    // Track focus session completion for review prompt eligibility
    if (timerType === 'focus' && sessionStatus === 'completed') {
      await onFocusSessionComplete();
    }

    // Clear session draft for next session
    console.log('handleSessionSave: Clearing sessionDraft and resetting timer');
    setSessionDraft({ intent: '', steps: [] });
    reset(); // Reset timer status to idle
    setShowCompleteModal(false);
    navigation.navigate('ModeSelection');
  };

  const handleSessionDismiss = async () => {
    // Session is already auto-saved - just close the modal and navigate
    console.log('handleSessionDismiss: Session already saved, closing modal');

    // Track focus session completion for review prompt eligibility
    // (session was auto-saved as "completed" before showing the modal)
    if (timerType === 'focus') {
      await onFocusSessionComplete();
    }

    setAutoSavedRecordId(null);
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

  // Determine if current session is a break for visual distinction
  const isBreakSession = currentSession?.type === 'break';

  // Determine background color based on session type and transition state
  const getContainerBackground = () => {
    // Transition zone takes precedence (subtle amber tint)
    if (isInTransitionZone) {
      return theme.colors.transitionBackground;
    }
    // Break sessions have warm background
    if (isBreakSession) {
      return theme.colors.breakBackground;
    }
    // Default background
    return theme.colors.background;
  };
  const containerBackground = getContainerBackground();

  return (
    <View style={[styles.container, { backgroundColor: containerBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={{ flex: 1 }}>
      {/* Minimal header with back, skip, and settings */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {isLocked ? (
          <View style={styles.headerButton}>
            <Text allowFontScaling={false} style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>🔒</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text allowFontScaling={false} style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>←</Text>
          </TouchableOpacity>
        )}

        {/* Right side: Skip (when available) + Settings */}
        <View style={styles.headerRight}>
          {!isLocked && status !== 'idle' && status !== 'completed' && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipHeaderButton}>
              <Text allowFontScaling={false} style={[styles.skipHeaderText, { color: theme.colors.textTertiary }]}>
                Skip →
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleToggleSettings} style={styles.headerButton}>
            <Text allowFontScaling={false} style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content - no scroll, everything fits on screen */}
      <View style={[styles.content, contentStyle]}>
        <View style={styles.mainArea}>
          <SessionIndicators
            sessions={sessions}
            currentSessionIndex={currentSessionIndex}
          />

          <View style={styles.timerContainer}>
          <TimerDisplay
            timeRemaining={timeRemaining}
            totalTime={totalTime}
          />

          {/* Display session intent if present - truncated, tap to expand */}
          {sessionDraft?.intent && (
            <TouchableOpacity
              style={styles.intentContainer}
              onPress={() => {
                if (!reduceMotion) {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }
                setIntentExpanded(!intentExpanded);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.intentText, { color: theme.colors.textSecondary }]}
                numberOfLines={intentExpanded ? undefined : 2}
              >
                {sessionDraft.intent}
              </Text>
            </TouchableOpacity>
          )}

          {/* Display task breakdown steps - collapsible */}
          {sessionDraft?.steps?.length > 0 && (
            <ActiveSteps
              steps={sessionDraft.steps}
              onToggleStep={handleToggleStep}
            />
          )}

          {/* Early completion banner when all steps are done */}
          {showEarlyCompletionBanner && (
            <EarlyCompletionBanner
              onEndEarly={handleEarlyComplete}
              onDismiss={handleDismissEarlyCompletion}
            />
          )}

          {/* Transition warning - "wrapping up" indicator */}
          <TransitionWarning
            isActive={isInTransitionZone}
            secondsRemaining={transitionSecondsRemaining}
            sessionType={currentSession?.type || null}
          />

          <View style={styles.progressContainer}>
            <TimerVisual
              progress={progress}
              isBreakSession={isBreakSession}
            />
          </View>

          {!isLocked && (
            <TimerAdjustments
              onAddTime={handleAddTime}
              onSubtractTime={handleSubtractTime}
              onAddPomodoro={handleAddPomodoro}
              onRemovePomodoro={handleRemovePomodoro}
              disabled={status === 'completed'}
              canRemovePomodoro={canRemovePomodoro}
              showPomodoroControls={isPomodoroStyle}
            />
          )}
        </View>
        </View>

        <View style={styles.controlsContainer}>
          <TimerControls
            status={status}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={isLocked ? undefined : handleReset}
          />
        </View>
      </View>
      </View>

      {/* Audio settings modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType={reduceMotion ? 'none' : 'fade'}
        onRequestClose={handleToggleSettings}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          {/* Backdrop tap to dismiss - flex fills space above sheet */}
          <Pressable style={styles.modalBackdrop} onPress={handleToggleSettings} />
          {/* Content container */}
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.background }, sheetStyle]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.textTertiary }]}>Audio Settings</Text>

              <AudioControls
                muteDuringBreaks={muteDuringBreaks}
                onToggleMuteDuringBreaks={handleToggleMuteDuringBreaks}
              />

              <View style={styles.focusLockSection}>
                <View style={styles.focusLockRow}>
                  <View style={styles.focusLockText}>
                    <Text style={[styles.focusLockLabel, { color: theme.colors.text }]}>Focus Lock</Text>
                    <Text style={[styles.focusLockDescription, { color: theme.colors.textTertiary }]}>
                      Hide controls during sessions
                    </Text>
                  </View>
                  <Switch
                    value={focusLockEnabled}
                    onValueChange={handleToggleFocusLock}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleToggleSettings}
              >
                <Text style={[styles.modalCloseButtonText, { color: theme.colors.textTertiary }]}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
        isAutoSaved={autoSavedRecordId !== null}
        onSave={handleSessionSave}
        onDiscard={handleSessionDismiss}
      />

      {/* Early Stop Confirmation Modal */}
      <EarlyStopModal
        visible={showEarlyStopModal}
        onContinue={handleEarlyStopContinue}
        onStop={handleEarlyStopConfirm}
      />

      {/* Contextual Tips */}
      <ContextualTip
        tipId="audio-menu"
        message="Tap ⋯ to adjust audio anytime"
        position="top"
      />

      {isBreakSession && status === 'running' && (
        <ContextualTip
          tipId="break-purpose"
          message="Breaks help reset focus. Step away if you can!"
          position="bottom"
        />
      )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipHeaderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipHeaderText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  mainArea: {
    flex: 1,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  intentContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  intentText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  controlsContainer: {
    paddingBottom: 32,
    paddingTop: 12,
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    maxHeight: '85%',
  },
  modalScrollContent: {
    paddingTop: 32,
    paddingBottom: 48,
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
  focusLockSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  focusLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusLockText: {
    flex: 1,
    marginRight: 16,
  },
  focusLockLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  focusLockDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
