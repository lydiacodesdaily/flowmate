import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface TimerDisplayProps {
  timeRemaining: number;
  sessionLabel?: string;
  sessionType?: string;
}

export function TimerDisplay({
  timeRemaining,
  sessionLabel,
}: TimerDisplayProps) {
  const { theme } = useTheme();

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {sessionLabel && (
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>{sessionLabel}</Text>
      )}
      <Text style={[styles.time, { color: theme.colors.text }]}>{formatTime(timeRemaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '300',
    textTransform: 'lowercase',
    letterSpacing: 1,
    marginBottom: 28,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
  },
});
