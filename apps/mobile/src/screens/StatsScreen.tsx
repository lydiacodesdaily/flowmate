import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { statsService } from '../services/statsService';
import { formatFocusTime } from '@flowmate/shared';
import type { UserStats, DailyStat } from '@flowmate/shared';
import { WeeklyChart } from '../components/WeeklyChart';
import type { StatsScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

export function StatsScreen({ navigation }: StatsScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
  const [weekStats, setWeekStats] = useState<DailyStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const allStats = await statsService.getStats();
    const today = await statsService.getTodayStats();
    const week = await statsService.getWeekStats();

    setStats(allStats);
    setTodayStats(today);
    setWeekStats(week);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>loading stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 20 }
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>← back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>your progress</Text>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>today</Text>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>focus time</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatFocusTime(todayStats?.focusTimeMinutes || 0)}
            </Text>
          </View>
          <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>sessions</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {todayStats?.sessionsCompleted || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>streaks</Text>
        <View style={styles.streakContainer}>
          <View style={[styles.streakCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakValue, { color: theme.colors.text }]}>{stats.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textTertiary }]}>current</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.streakEmoji}>⭐</Text>
            <Text style={[styles.streakValue, { color: theme.colors.text }]}>{stats.longestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textTertiary }]}>longest</Text>
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>last 7 days</Text>
        <WeeklyChart weekStats={weekStats} />
      </View>

      {/* All Time Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>all time</Text>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>total focus time</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatFocusTime(stats.totalFocusTime)}
            </Text>
          </View>
          <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>total sessions</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalSessions}</Text>
          </View>
          <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>days active</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.dailyStats.length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
});
