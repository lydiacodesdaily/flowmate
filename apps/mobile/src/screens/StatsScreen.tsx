import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { statsService } from '../services/statsService';
import { formatFocusTime } from '@flowmate/shared';
import type { UserStats, DailyStat } from '@flowmate/shared';
import { WeeklyChart } from '../components/WeeklyChart';
import type { StatsScreenProps } from '../navigation/types';

export function StatsScreen({ navigation }: StatsScreenProps) {
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>loading stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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
          <Text style={styles.backButtonText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>your progress</Text>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>today</Text>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>focus time</Text>
            <Text style={styles.statValue}>
              {formatFocusTime(todayStats?.focusTimeMinutes || 0)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>sessions</Text>
            <Text style={styles.statValue}>
              {todayStats?.sessionsCompleted || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>streaks</Text>
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{stats.currentStreak}</Text>
            <Text style={styles.streakLabel}>current</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>⭐</Text>
            <Text style={styles.streakValue}>{stats.longestStreak}</Text>
            <Text style={styles.streakLabel}>longest</Text>
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>last 7 days</Text>
        <WeeklyChart weekStats={weekStats} />
      </View>

      {/* All Time Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>all time</Text>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>total focus time</Text>
            <Text style={styles.statValue}>
              {formatFocusTime(stats.totalFocusTime)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>total sessions</Text>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>days active</Text>
            <Text style={styles.statValue}>{stats.dailyStats.length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#A0A0A0',
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
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#3A3A3C',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#A0A0A0',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '300',
    color: '#3A3A3C',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3A3A3C',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#3A3A3C',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '300',
    color: '#A0A0A0',
    letterSpacing: 0.5,
  },
});
