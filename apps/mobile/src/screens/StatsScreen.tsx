import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { formatFocusTime } from '@flowmate/shared';
import type { DailyStat, DailySummary } from '@flowmate/shared';
import { WeeklyChart } from '../components/WeeklyChart';
import { SessionHistory } from '../components/SessionHistory';
import type { StatsScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import {
  groupSessionsByDay,
  getTodayStats,
  getWeekStats,
  getThisWeekSummary,
  getAllTimeStats,
} from '../services/sessionService';

type TabView = 'stats' | 'history';

export function StatsScreen({ navigation }: StatsScreenProps) {
  const { theme } = useTheme();
  const { contentStyle } = useResponsive();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabView>('stats');
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
  const [weekStats, setWeekStats] = useState<DailyStat[]>([]);
  const [thisWeekStats, setThisWeekStats] = useState({ daysActive: 0, totalMinutes: 0, totalSessions: 0 });
  const [allTimeStats, setAllTimeStats] = useState({ totalFocusTime: 0, totalSessions: 0, daysActive: 0 });
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    // Load all stats from sessionService (unified source)
    const todayData = await getTodayStats();
    const weekData = await getWeekStats();
    const thisWeekData = await getThisWeekSummary();
    const allTimeData = await getAllTimeStats();
    const summaries = await groupSessionsByDay();

    // Convert today's data to DailyStat format for display
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setTodayStats({
      date: todayStr,
      focusTimeMinutes: todayData.totalMinutes,
      sessionsCompleted: todayData.completedCount + todayData.partialCount,
    });

    setWeekStats(weekData);
    setThisWeekStats(thisWeekData);
    setAllTimeStats(allTimeData);
    setDailySummaries(summaries);
    setIsLoaded(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // Reload stats whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text allowFontScaling={false} style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>← back</Text>
        </TouchableOpacity>
        <View style={contentStyle}>
        <Text style={[styles.title, { color: theme.colors.text }]}>your progress</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'stats' && styles.tabActive,
              { backgroundColor: activeTab === 'stats' ? theme.colors.primary : 'transparent' },
              { borderColor: theme.colors.border },
            ]}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'stats' ? '#ffffff' : theme.colors.text },
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && styles.tabActive,
              { backgroundColor: activeTab === 'history' ? theme.colors.primary : 'transparent' },
              { borderColor: theme.colors.border },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? '#ffffff' : theme.colors.text },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {activeTab === 'stats' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, contentStyle]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

      {/* Today + This Week Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBlock, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.blockLabel, { color: theme.colors.textTertiary }]}>today</Text>
          <Text style={[styles.blockValue, { color: theme.colors.text }]}>
            {formatFocusTime(todayStats?.focusTimeMinutes || 0)}
          </Text>
          <Text style={[styles.blockSubtext, { color: theme.colors.textSecondary }]}>
            {todayStats?.sessionsCompleted || 0} {todayStats?.sessionsCompleted === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
        <View style={[styles.statBlock, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.blockLabel, { color: theme.colors.textTertiary }]}>this week</Text>
          <Text style={[styles.blockValue, { color: theme.colors.text }]}>
            {formatFocusTime(thisWeekStats.totalMinutes)}
          </Text>
          <Text style={[styles.blockSubtext, { color: theme.colors.textSecondary }]}>
            {thisWeekStats.totalSessions} {thisWeekStats.totalSessions === 1 ? 'session' : 'sessions'} · {thisWeekStats.daysActive} {thisWeekStats.daysActive === 1 ? 'day' : 'days'}
          </Text>
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
        <View style={styles.allTimeRow}>
          <View style={[styles.allTimeBlock, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.allTimeValue, { color: theme.colors.text }]}>
              {formatFocusTime(allTimeStats.totalFocusTime)}
            </Text>
            <Text style={[styles.allTimeLabel, { color: theme.colors.textTertiary }]}>focus time</Text>
          </View>
          <View style={[styles.allTimeBlock, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.allTimeValue, { color: theme.colors.text }]}>{allTimeStats.totalSessions}</Text>
            <Text style={[styles.allTimeLabel, { color: theme.colors.textTertiary }]}>sessions</Text>
          </View>
          <View style={[styles.allTimeBlock, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.allTimeValue, { color: theme.colors.text }]}>{allTimeStats.daysActive}</Text>
            <Text style={[styles.allTimeLabel, { color: theme.colors.textTertiary }]}>days</Text>
          </View>
        </View>
        <Text style={[styles.retentionNote, { color: theme.colors.textTertiary }]}>
          30-day history · this device only
        </Text>
      </View>
        </ScrollView>
      ) : (
        <View style={styles.scrollView}>
          <SessionHistory dailySummaries={dailySummaries} onRefresh={loadStats} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    marginBottom: 12,
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
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabActive: {
    // Active state handled via backgroundColor prop
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  // Today + This Week grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBlock: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  blockValue: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  blockSubtext: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  // All time horizontal row
  allTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  allTimeBlock: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  allTimeValue: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 2,
  },
  allTimeLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  retentionNote: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    marginTop: 10,
    textAlign: 'center',
  },
});
