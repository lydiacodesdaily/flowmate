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
  sessionType,
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

  const getSessionColor = (type?: string) => {
    switch (type) {
      case 'settle':
        return '#4A90E2'; // Blue
      case 'focus':
        return '#E94B3C'; // Red
      case 'break':
        return '#50C878'; // Green
      case 'wrap':
        return '#9B59B6'; // Purple
      default:
        return '#6C7A89'; // Gray
    }
  };

  return (
    <View style={styles.container}>
      {sessionLabel && (
        <View style={styles.labelContainer}>
          <View
            style={[
              styles.sessionIndicator,
              { backgroundColor: getSessionColor(sessionType) },
            ]}
          />
          <Text style={styles.label}>{sessionLabel}</Text>
        </View>
      )}
      <Text style={styles.time}>{formatTime(timeRemaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 72,
    fontWeight: '700',
    color: '#2C3E50',
    fontVariant: ['tabular-nums'],
  },
});
