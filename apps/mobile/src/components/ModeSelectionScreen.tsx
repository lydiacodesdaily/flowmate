import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModeCard } from './ModeCard';
import { WelcomeModal } from './WelcomeModal';
import { useTheme } from '../theme';
import { hasSeenWelcome, markWelcomeSeen, loadLastSession, type LastSessionConfig } from '../utils/storage';
import { useTimerContext } from '../contexts/TimerContext';
import { hapticService } from '../services/hapticService';
import type { ModeSelectionScreenProps } from '../navigation/types';

export function ModeSelectionScreen({ navigation }: ModeSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isActive, reset } = useTimerContext();
  const [showWelcome, setShowWelcome] = useState(false);
  const [lastSession, setLastSession] = useState<LastSessionConfig | null>(null);

  useEffect(() => {
    const checkWelcome = async () => {
      const seen = await hasSeenWelcome();
      if (!seen) {
        setShowWelcome(true);
      }
    };
    checkWelcome();
  }, []);

  // Load last session for quick-start
  useEffect(() => {
    loadLastSession().then(setLastSession);
  }, []);

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

  const handleDismissWelcome = async () => {
    setShowWelcome(false);
    await markWelcomeSeen();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 40 }
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>ready when you are</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>choose a focus mode</Text>

      {lastSession && (
        <TouchableOpacity
          style={[styles.quickStartCard, { backgroundColor: theme.colors.primaryLight }]}
          onPress={handleQuickStart}
          activeOpacity={0.85}
        >
          <View style={styles.quickStartContent}>
            <Text style={styles.quickStartIcon}>⚡</Text>
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

      <WelcomeModal visible={showWelcome} onDismiss={handleDismissWelcome} />
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
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  cardsContainer: {
    gap: 16,
  },
  quickStartCard: {
    borderRadius: 16,
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
});
