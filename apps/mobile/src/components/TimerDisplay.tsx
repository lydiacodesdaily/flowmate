import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerDisplayProps {
  timeRemaining: number;
  sessionLabel?: string;
  sessionType?: string;
}

export function TimerDisplay({
  timeRemaining,
  sessionLabel,
}: TimerDisplayProps) {
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
        <Text style={styles.label}>{sessionLabel}</Text>
      )}
      <Text style={styles.time}>{formatTime(timeRemaining)}</Text>
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
    color: '#A0A0A0',
    textTransform: 'lowercase',
    letterSpacing: 1,
    marginBottom: 28,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    color: '#3A3A3C',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
  },
});
