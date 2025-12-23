import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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

  const getSessionColor = (isActive: boolean, isPast: boolean) => {
    if (isPast) {
      return theme.colors.textTertiary;
    }
    if (isActive) {
      return theme.colors.primary;
    }
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sessions.map((session, index) => {
          const isActive = index === currentSessionIndex;
          const isPast = index < currentSessionIndex;
          const color = getSessionColor(isActive, isPast);
          const label = getSessionLabel(session.type);

          return (
            <View key={index} style={styles.sessionWrapper}>
              <View
                style={[
                  styles.sessionCard,
                  {
                    opacity: isPast ? 0.4 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sessionLabel,
                    { color, fontWeight: isActive ? '500' : '300' },
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    styles.sessionDuration,
                    { color, fontWeight: isActive ? '500' : '300' },
                  ]}
                >
                  {session.durationMinutes}m
                </Text>
              </View>
              {index < sessions.length - 1 && (
                <Text style={[styles.arrow, { color: theme.colors.border }]}>→</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 40,
  },
  scrollContent: {
    paddingHorizontal: 32,
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionCard: {
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sessionDuration: {
    fontSize: 13,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    fontWeight: '300',
  },
});
