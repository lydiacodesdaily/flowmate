import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { Session } from '@flowmate/shared';

interface SessionIndicatorsProps {
  sessions: Session[];
  currentSessionIndex: number;
}

export function SessionIndicators({
  sessions,
  currentSessionIndex,
}: SessionIndicatorsProps) {
  const { theme } = useTheme();

  const getSessionLabel = (type: string) => {
    switch (type) {
      case 'settle':
        return 'Settle';
      case 'focus':
        return 'Focus';
      case 'break':
        return 'Break';
      case 'wrap':
        return 'Wrap';
      default:
        return type;
    }
  };

  const currentSession = sessions[currentSessionIndex];
  const nextSession = currentSessionIndex < sessions.length - 1 ? sessions[currentSessionIndex + 1] : null;
  const currentLabel = currentSession ? getSessionLabel(currentSession.type) : '';
  const nextLabel = nextSession ? getSessionLabel(nextSession.type) : null;

  return (
    <View style={styles.container}>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionLabel, { color: theme.colors.textTertiary }]}>
          {currentLabel} {currentSession?.durationMinutes}m
          {nextLabel && (
            <Text style={styles.nextSession}>
              {' · '}Up next: {nextLabel} {nextSession?.durationMinutes}m
            </Text>
          )}
        </Text>
      </View>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {sessions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentSessionIndex
                  ? theme.colors.primary
                  : index < currentSessionIndex
                    ? theme.colors.textTertiary
                    : theme.colors.border,
                opacity: index < currentSessionIndex ? 0.4 : 1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    marginBottom: 24,
    alignItems: 'center',
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionLabel: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  nextSession: {
    fontWeight: '300',
    opacity: 0.7,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
