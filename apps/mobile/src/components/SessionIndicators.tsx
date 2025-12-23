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

  const getSessionColor = (type: string) => {
    // Very subtle, barely distinguishable grays
    switch (type) {
      case 'settle':
        return theme.colors.textSecondary;
      case 'focus':
        return theme.colors.textTertiary;
      case 'break':
        return theme.colors.textSecondary;
      case 'wrap':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textTertiary;
    }
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
          const color = getSessionColor(session.type);

          return (
            <View key={index} style={styles.sessionWrapper}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isActive ? color : isPast ? `${color}40` : theme.colors.border,
                    opacity: isPast ? 0.5 : 1,
                  },
                ]}
              />
              {isActive && (
                <Text style={[styles.duration, { color: theme.colors.textTertiary }]}>{session.durationMinutes}m</Text>
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
    gap: 10,
    alignItems: 'center',
  },
  sessionWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  duration: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
});
