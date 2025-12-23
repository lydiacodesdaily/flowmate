import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { TimerStatus } from '../hooks/useTimer';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip?: () => void;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: TimerControlsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.mainControls}>
        {status === 'idle' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.textSecondary }]}
            onPress={onStart}
          >
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
        )}

        {status === 'running' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.textSecondary }]}
            onPress={onPause}
          >
            <Text style={styles.primaryButtonText}>Pause</Text>
          </TouchableOpacity>
        )}

        {status === 'paused' && (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.textSecondary }]}
              onPress={onResume}
            >
              <Text style={styles.primaryButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={onReset}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Reset</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'completed' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.textSecondary }]}
            onPress={onReset}
          >
            <Text style={styles.primaryButtonText}>Start Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {status !== 'idle' && status !== 'completed' && onSkip && (
        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.textButton} onPress={onSkip}>
            <Text style={[styles.textButtonText, { color: theme.colors.textTertiary }]}>Skip Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 16,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  secondaryControls: {
    marginTop: 20,
    alignItems: 'center',
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
});
