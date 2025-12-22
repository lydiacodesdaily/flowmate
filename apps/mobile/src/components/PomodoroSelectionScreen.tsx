import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PomodoroType } from '@flowmate/shared';
import { POMODORO_CONFIGS } from '@flowmate/shared';
import type { PomodoroSelectionScreenProps } from '../navigation/types';

const POMODORO_OPTIONS: Array<{ type: PomodoroType; title: string; description: string }> = [
  { type: '1pom', title: '1 Pomodoro', description: '25 minutes of focused work' },
  { type: '2pom', title: '2 Pomodoros', description: '50 min focus with 5 min break' },
  { type: '3pom', title: '3 Pomodoros', description: '75 min focus with breaks' },
  { type: '5pom', title: '5 Pomodoros', description: '125 min focus with breaks' },
];

export function PomodoroSelectionScreen({ navigation }: PomodoroSelectionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>pomodoro</Text>
        <Text style={styles.subtitle}>25-minute focus sessions</Text>

        {POMODORO_OPTIONS.map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={styles.optionCard}
            onPress={() => navigation.navigate('ActiveTimer', { sessions: POMODORO_CONFIGS[type] })}
            activeOpacity={0.85}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>{title}</Text>
              <Text style={styles.optionDuration}>
                {POMODORO_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)}m
              </Text>
            </View>
            <Text style={styles.optionDescription}>{description}</Text>
            <View style={styles.sessionsPreview}>
              {POMODORO_CONFIGS[type].map((session, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.sessionDot,
                    session.type === 'focus' ? styles.focusDot : styles.breakDot,
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
    backgroundColor: '#FAFAFA',
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
    color: '#8E8E93',
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
    color: '#3A3A3C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#A0A0A0',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
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
    color: '#3A3A3C',
    letterSpacing: 0.2,
  },
  optionDuration: {
    fontSize: 15,
    fontWeight: '300',
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '300',
    color: '#8E8E93',
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
  focusDot: {
    backgroundColor: '#A0A0A0',
  },
  breakDot: {
    backgroundColor: '#C7C7CC',
  },
});
