import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PomodoroType } from '@flowmate/shared';
import { POMODORO_CONFIGS } from '@flowmate/shared';
import type { PomodoroSelectionScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

const POMODORO_OPTIONS: Array<{ type: PomodoroType; title: string; description: string }> = [
  { type: '1pom', title: '1 Pomodoro', description: '25 minutes of focused work' },
  { type: '2pom', title: '2 Pomodoros', description: '50 min focus with 5 min break' },
  { type: '3pom', title: '3 Pomodoros', description: '75 min focus with breaks' },
  { type: '5pom', title: '5 Pomodoros', description: '125 min focus with breaks' },
];

export function PomodoroSelectionScreen({ navigation }: PomodoroSelectionScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>pomodoro</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>25-minute focus sessions</Text>

        {POMODORO_OPTIONS.map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('ActiveTimer', { sessions: POMODORO_CONFIGS[type] })}
            activeOpacity={0.85}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.optionDuration, { color: theme.colors.textSecondary }]}>
                {POMODORO_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)}m
              </Text>
            </View>
            <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
            <View style={styles.sessionsPreview}>
              {POMODORO_CONFIGS[type].map((session, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.sessionDot,
                    { backgroundColor: session.type === 'focus' ? theme.colors.textTertiary : theme.colors.border },
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 12,
    minWidth: 44,
  },
  backText: {
    fontSize: 24,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 16,
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
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  optionDuration: {
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  sessionsPreview: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
