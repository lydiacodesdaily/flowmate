import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { POMODORO_CONFIGS, GUIDED_CONFIGS, formatTime } from '@flowmate/shared';
import type { TimerMode, Session } from '@flowmate/shared';

export function TimerScreen() {
  const [mode, setMode] = useState<TimerMode | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlowMate Mobile</Text>
      <Text style={styles.subtitle}>Focus Timer</Text>

      {/* Mode Selection */}
      {!mode && (
        <View style={styles.modeSelection}>
          <Text style={styles.label}>Select Timer Mode:</Text>
          <Text style={styles.info}>• Pomodoro</Text>
          <Text style={styles.info}>• Guided Deep Work</Text>
          <Text style={styles.info}>• Custom</Text>
        </View>
      )}

      {/* Timer Display Placeholder */}
      {mode && (
        <View style={styles.timerDisplay}>
          <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.sessionCount}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Debug Info */}
      <View style={styles.debug}>
        <Text style={styles.debugText}>
          Shared package loaded ✓
        </Text>
        <Text style={styles.debugText}>
          {Object.keys(POMODORO_CONFIGS).length} Pomodoro configs available
        </Text>
        <Text style={styles.debugText}>
          {Object.keys(GUIDED_CONFIGS).length} Guided configs available
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  modeSelection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
    color: '#555',
  },
  timerDisplay: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#e74c3c',
    fontVariant: ['tabular-nums'],
  },
  sessionCount: {
    fontSize: 16,
    marginTop: 12,
    color: '#666',
  },
  debug: {
    marginTop: 'auto',
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#2e7d32',
    marginVertical: 2,
  },
});
