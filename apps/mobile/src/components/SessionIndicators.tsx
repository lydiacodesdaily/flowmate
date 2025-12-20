import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { Session } from '@flowmate/shared';

interface SessionIndicatorsProps {
  sessions: Session[];
  currentSessionIndex: number;
}

export function SessionIndicators({
  sessions,
  currentSessionIndex,
}: SessionIndicatorsProps) {
  const getSessionColor = (type: string) => {
    switch (type) {
      case 'settle':
        return '#4A90E2';
      case 'focus':
        return '#E94B3C';
      case 'break':
        return '#50C878';
      case 'wrap':
        return '#9B59B6';
      default:
        return '#6C7A89';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'settle':
        return 'S';
      case 'focus':
        return 'F';
      case 'break':
        return 'B';
      case 'wrap':
        return 'W';
      default:
        return '?';
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
                    backgroundColor: isActive || isPast ? color : '#E0E0E0',
                    borderWidth: isActive ? 3 : 0,
                    borderColor: isActive ? color : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    {
                      color: isActive || isPast ? '#fff' : '#999',
                      opacity: isPast ? 0.6 : 1,
                    },
                  ]}
                >
                  {getSessionIcon(session.type)}
                </Text>
              </View>
              <Text style={styles.duration}>{session.durationMinutes}m</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  sessionWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  indicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: '700',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
