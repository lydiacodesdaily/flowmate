import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session } from '@flowmate/shared';
import { useTimer } from '../hooks/useTimer';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { ProgressBar } from './ProgressBar';
import { SessionIndicators } from './SessionIndicators';
import { audioService } from '../services/audioService';
import { statsService } from '../services/statsService';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';

interface ActiveTimerProps {
  sessions: Session[];
  onBack: () => void;
}

export function ActiveTimer({ sessions, onBack }: ActiveTimerProps) {
  const insets = useSafeAreaInsets();
  const lastMinuteRef = useRef<number>(-1);
  const lastAnnouncementMinuteRef = useRef<number>(-1);
  const audioInitializedRef = useRef(false);

  const {
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
  } = useTimer({
    sessions,
    onSessionComplete: async (session, sessionIndex) => {
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
    },
    onAllSessionsComplete: async () => {
      await hapticService.heavy();
      await audioService.announceAllComplete();
      lastMinuteRef.current = -1;
      lastAnnouncementMinuteRef.current = -1;
    },
  });

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

      // Play tick sound every second
      if (timeRemaining % 1 === 0 && timeRemaining > 0) {
        audioService.playTick(currentSession.type);
      }

      // Time announcements
      const settings = audioService.getSettings();
      if (currentMinute !== lastAnnouncementMinuteRef.current && currentMinute > 0) {
        // For sessions <= 25 minutes: voice announcement every minute (we have m01-m24.mp3)
        // For sessions > 25 minutes: ding.mp3 every 5 minutes
        if (totalTime / 60 <= 25) {
          // 25 minutes or less: announce every minute with voice (no notifications)
          audioService.announceTimeRemaining(currentMinute);
          lastAnnouncementMinuteRef.current = currentMinute;
        } else if (currentMinute % settings.announcementInterval === 0) {
          // More than 25 minutes: ding every 5 minutes (or configured interval, no notifications)
          audioService.announceSessionComplete(); // Play ding.mp3
          lastAnnouncementMinuteRef.current = currentMinute;
        }
      }

      // Minute change haptic
      if (currentMinute !== lastMinuteRef.current) {
        hapticService.light();
        lastMinuteRef.current = currentMinute;
      }
    }
  }, [status, timeRemaining, currentSession]);

  const handleStart = async () => {
    if (currentSession) {
      await audioService.announceSessionStart(currentSession.type);
      await notificationService.scheduleSessionStartNotification(
        currentSession.type,
        currentSession.durationMinutes
      );
    }
    await hapticService.medium();
    start();
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
    reset();
  };

  const handleSkip = async () => {
    await hapticService.light();
    skip();
  };

  const handleBack = async () => {
    await hapticService.selection();
    await notificationService.cancelAllNotifications();
    onBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#E94B3C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  controlsContainer: {
    paddingBottom: 40,
  },
});
