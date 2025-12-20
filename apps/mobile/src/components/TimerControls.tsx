import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      <View style={styles.mainControls}>
        {status === 'idle' && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onStart}
          >
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
        )}

        {status === 'running' && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onPause}
          >
            <Text style={styles.primaryButtonText}>Pause</Text>
          </TouchableOpacity>
        )}

        {status === 'paused' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onResume}
            >
              <Text style={styles.primaryButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onReset}
            >
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'completed' && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onReset}
          >
            <Text style={styles.primaryButtonText}>Start Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {status !== 'idle' && status !== 'completed' && onSkip && (
        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.textButton} onPress={onSkip}>
            <Text style={styles.textButtonText}>Skip Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#E94B3C',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E94B3C',
  },
  secondaryButtonText: {
    color: '#E94B3C',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryControls: {
    marginTop: 16,
    alignItems: 'center',
  },
  textButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textButtonText: {
    color: '#6C7A89',
    fontSize: 16,
    fontWeight: '600',
  },
});
