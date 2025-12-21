import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PomodoroType, Session } from '@flowmate/shared';
import { POMODORO_CONFIGS } from '@flowmate/shared';

interface PomodoroSelectionScreenProps {
  onSelectConfig: (type: PomodoroType, sessions: Session[]) => void;
  onBack: () => void;
}

const POMODORO_OPTIONS: Array<{ type: PomodoroType; title: string; description: string }> = [
  { type: '1pom', title: '1 Pomodoro', description: '25 minutes of focused work' },
  { type: '2pom', title: '2 Pomodoros', description: '50 min focus with 5 min break' },
  { type: '3pom', title: '3 Pomodoros', description: '75 min focus with breaks' },
  { type: '5pom', title: '5 Pomodoros', description: '125 min focus with breaks' },
];

export function PomodoroSelectionScreen({ onSelectConfig, onBack }: PomodoroSelectionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pomodoro Timer</Text>
        <Text style={styles.subtitle}>Classic 25-minute focus sessions</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {POMODORO_OPTIONS.map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={styles.optionCard}
            onPress={() => onSelectConfig(type, POMODORO_CONFIGS[type])}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>{title}</Text>
              <Text style={styles.optionDuration}>
                {POMODORO_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)} min
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  optionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sessionsPreview: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sessionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  focusDot: {
    backgroundColor: '#e74c3c',
  },
  breakDot: {
    backgroundColor: '#27ae60',
  },
});
