import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DailyStat } from '@flowmate/shared';

interface WeeklyChartProps {
  weekStats: DailyStat[];
}

export function WeeklyChart({ weekStats }: WeeklyChartProps) {
  // Fill in missing days with zero stats for the last 7 days
  const getLast7Days = (): DailyStat[] => {
    const days: DailyStat[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);

      const existingStat = weekStats.find((s) => s.date === dateString);
      days.push(
        existingStat || {
          date: dateString,
          focusTimeMinutes: 0,
          sessionsCompleted: 0,
        }
      );
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const last7Days = getLast7Days();
  const maxMinutes = Math.max(...last7Days.map((d) => d.focusTimeMinutes), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {last7Days.map((stat, index) => {
          const heightPercentage = (stat.focusTimeMinutes / maxMinutes) * 100;
          const isToday = index === 6;

          return (
            <View key={stat.date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercentage, 2)}%`,
                      backgroundColor: isToday ? '#8E8E93' : '#D1D1D6',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                {getDayLabel(stat.date)}
              </Text>
              <Text style={styles.minutesLabel}>
                {stat.focusTimeMinutes > 0 ? `${stat.focusTimeMinutes}m` : ''}
              </Text>
            </View>
          );
        })}
      </View>

      {maxMinutes === 1 && (
        <Text style={styles.emptyMessage}>no focus time recorded yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 40,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '100%',
    maxWidth: 32,
    borderRadius: 8,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#A0A0A0',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  todayLabel: {
    color: '#3A3A3C',
    fontWeight: '500',
  },
  minutesLabel: {
    fontSize: 10,
    fontWeight: '300',
    color: '#C0C0C0',
    marginTop: 2,
    height: 12,
  },
  emptyMessage: {
    fontSize: 14,
    fontWeight: '300',
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.3,
  },
});
