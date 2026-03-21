import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ModeCard } from './ModeCard';
import { ContextualTip } from './tips';
import { useTheme } from '../theme';
import { loadLastSession, type LastSessionConfig } from '../utils/storage';
import { useTimerContext } from '../contexts/TimerContext';
import { hapticService } from '../services/hapticService';
import { useResponsive } from '../hooks/useResponsive';
import {
  getActiveSession,
  clearActiveSession,
  getResumableSession,
  isResumable,
  sessionToDraft,
} from '../services/sessionService';
import type { ActiveSession, SessionRecord } from '@flowmate/shared/types';
import type { ModeSelectionScreenProps } from '../navigation/types';

export function ModeSelectionScreen({ navigation }: ModeSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isActive, reset, setSessionDraft } = useTimerContext();
  const { contentStyle } = useResponsive();
  const [lastSession, setLastSession] = useState<LastSessionConfig | null>(null);
  const [showQuickStartTip, setShowQuickStartTip] = useState(false);
  const [resumableSession, setResumableSession] = useState<SessionRecord | null>(null);
  const [crashRecovery, setCrashRecovery] = useState<ActiveSession | null>(null);

  // Load last session for quick-start (once on mount)
  useEffect(() => {
    loadLastSession().then(session => {
      setLastSession(session);
      if (session) {
        setShowQuickStartTip(true);
      }
    });
  }, []);

  // Check for crash recovery and resumable session on every focus
  useFocusEffect(
    useCallback(() => {
      if (isActive) return;

      const checkSessions = async () => {
        // Crash recovery takes priority
        const active = await getActiveSession();
        if (active) {
          const age = Date.now() - active.startedAt;
          if (age < 24 * 60 * 60 * 1000) {
            setCrashRecovery(active);
            setResumableSession(null);
            return;
          } else {
            await clearActiveSession();
          }
        }

        // Check for a resumable session
        const resumable = await getResumableSession();
        setResumableSession(resumable);
        setCrashRecovery(null);
      };

      checkSessions();
    }, [isActive])
  );

  const handleQuickStart = async () => {
    if (!lastSession) return;

    await hapticService.medium();

    if (isActive) {
      Alert.alert(
        'Active Session in Progress',
        'You have an active timer running. Do you want to end it and start a new session?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End & Start New',
            style: 'destructive',
            onPress: () => {
              reset();
              navigation.navigate('ActiveTimer', { sessions: lastSession.sessions, isQuickStart: true });
            },
          },
        ]
      );
    } else {
      navigation.navigate('ActiveTimer', { sessions: lastSession.sessions, isQuickStart: true });
    }
  };

  const handleResumeBanner = async () => {
    if (!resumableSession) return;
    await hapticService.medium();

    const remainingSeconds = resumableSession.plannedSeconds - resumableSession.completedSeconds;
    if (remainingSeconds <= 0) return;

    const draft = sessionToDraft(resumableSession, true); // preserve step state
    setSessionDraft(draft);

    const durationMinutes = Math.ceil(remainingSeconds / 60);
    const resumeSessions = [{ type: 'focus' as const, durationMinutes }];

    setResumableSession(null);
    navigation.navigate('ActiveTimer', {
      sessions: resumeSessions,
      isQuickStart: true,
      resumedFromId: resumableSession.id,
    });
  };

  const handleContinueTodayBanner = async () => {
    if (!resumableSession) return;
    await hapticService.selection();

    const draft = sessionToDraft(resumableSession, false); // reset steps
    setSessionDraft(draft);
    setResumableSession(null);
    // User stays on ModeSelection and picks a mode; draft is pre-filled in SessionSetup
  };

  const handleResumeCrashRecovery = async () => {
    if (!crashRecovery) return;
    await hapticService.medium();

    setSessionDraft(crashRecovery.draft);
    await clearActiveSession();

    const durationMinutes = Math.ceil(crashRecovery.plannedSeconds / 60);
    const resumeSessions = [{ type: 'focus' as const, durationMinutes }];

    setCrashRecovery(null);
    navigation.navigate('ActiveTimer', {
      sessions: resumeSessions,
      isQuickStart: true,
    });
  };

  const handleDismissCrashRecovery = async () => {
    await clearActiveSession();
    setCrashRecovery(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 40 },
        contentStyle,
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>ready when you are</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>time awareness, not pressure</Text>

      {/* Crash Recovery Banner */}
      {crashRecovery && !isActive && (
        <View style={[styles.resumeBanner, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.warning }]}>
          <View style={styles.resumeBannerTop}>
            <Text allowFontScaling={false} style={[styles.resumeBannerIcon, { color: theme.colors.warning }]}>⚠</Text>
            <View style={styles.resumeBannerText}>
              <Text style={[styles.resumeBannerTitle, { color: theme.colors.text }]}>Unfinished session found</Text>
              {crashRecovery.draft.intent ? (
                <Text style={[styles.resumeBannerIntent, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {crashRecovery.draft.intent}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.resumeBannerButtons}>
            <TouchableOpacity
              style={[styles.resumeButton, { backgroundColor: theme.colors.warning }]}
              onPress={handleResumeCrashRecovery}
              activeOpacity={0.85}
            >
              <Text style={styles.resumeButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dismissButton, { borderColor: theme.colors.border }]}
              onPress={handleDismissCrashRecovery}
              activeOpacity={0.85}
            >
              <Text style={[styles.dismissButtonText, { color: theme.colors.textSecondary }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Resume Banner */}
      {resumableSession && !crashRecovery && !isActive && (
        <View style={[styles.resumeBanner, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
          <View style={styles.resumeBannerTop}>
            <Text allowFontScaling={false} style={[styles.resumeBannerIcon, { color: theme.colors.primary }]}>◐</Text>
            <View style={styles.resumeBannerText}>
              <Text style={[styles.resumeBannerTitle, { color: theme.colors.text }]}>
                {Math.ceil((resumableSession.plannedSeconds - resumableSession.completedSeconds) / 60)}m left
              </Text>
              {resumableSession.intent ? (
                <Text style={[styles.resumeBannerIntent, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {resumableSession.intent}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.resumeBannerButtons}>
            {isResumable(resumableSession) ? (
              <TouchableOpacity
                style={[styles.resumeButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleResumeBanner}
                activeOpacity={0.85}
              >
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.resumeButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleContinueTodayBanner}
                activeOpacity={0.85}
              >
                <Text style={styles.resumeButtonText}>Continue Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {lastSession && (
        <TouchableOpacity
          style={[styles.quickStartCard, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}
          onPress={handleQuickStart}
          activeOpacity={0.85}
        >
          <View style={styles.quickStartContent}>
            <Text allowFontScaling={false} style={styles.quickStartIcon}>⚡</Text>
            <View style={styles.quickStartText}>
              <Text style={[styles.quickStartTitle, { color: theme.colors.primary }]}>Quick Start</Text>
              <Text style={[styles.quickStartLabel, { color: theme.colors.textSecondary }]}>{lastSession.label}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.cardsContainer}>
        <ModeCard
          icon="🍅"
          image={require('../../assets/flowmato.png')}
          title="Pomodoro"
          description="25-minute focus with short breaks"
          color="#8E8E93"
          onPress={() => navigation.navigate('PomodoroSelection')}
        />

        <ModeCard
          icon="🎯"
          title="Guided"
          description="Settle, focus, and wrap periods"
          color="#8E8E93"
          onPress={() => navigation.navigate('GuidedSelection')}
        />

        <ModeCard
          icon="⏱️"
          title="Custom"
          description="Your own duration"
          color="#8E8E93"
          onPress={() => navigation.navigate('CustomSelection')}
        />
      </View>

      {/* Quick Start Tip */}
      {lastSession && showQuickStartTip && (
        <ContextualTip
          tipId="quick-start"
          message="Quick Start repeats your last session"
          position="top"
          onDismiss={() => setShowQuickStartTip(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  cardsContainer: {
    gap: 16,
  },
  quickStartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStartIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  quickStartText: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickStartLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  resumeBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  resumeBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resumeBannerIcon: {
    fontSize: 24,
  },
  resumeBannerText: {
    flex: 1,
  },
  resumeBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resumeBannerIntent: {
    fontSize: 13,
    marginTop: 2,
  },
  resumeBannerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  resumeButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
