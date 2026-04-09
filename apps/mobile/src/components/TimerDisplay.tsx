import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useTimerDisplaySettings } from '../contexts';

interface TimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
  sessionLabel?: string;
  sessionType?: string;
  compact?: boolean;
}

export function TimerDisplay({
  timeRemaining,
  totalTime,
  compact = false,
}: TimerDisplayProps) {
  const { theme } = useTheme();
  const { showElapsedTime } = useTimerDisplaySettings();

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = showElapsedTime ? totalTime - timeRemaining : timeRemaining;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.time, { color: theme.colors.text }, compact && styles.timeCompact]}>
        {formatTime(displayTime)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  containerCompact: {
    paddingVertical: 8,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
  },
  timeCompact: {
    fontSize: 40,
    letterSpacing: -1,
  },
});
