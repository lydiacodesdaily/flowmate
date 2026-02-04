import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DailySummary } from '@flowmate/shared/types';
import { RETENTION_DAYS, formatFocusTime } from '../services/sessionService';
import { useTheme } from '../theme/ThemeContext';

interface SessionHistoryProps {
  dailySummaries: DailySummary[];
}

export function SessionHistory({ dailySummaries }: SessionHistoryProps) {
  const { theme } = useTheme();

  if (dailySummaries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>📊</Text>
        <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
          No sessions yet
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
          Complete a focus session to see it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {dailySummaries.map((summary) => (
        <DailySummaryCard key={summary.date} summary={summary} theme={theme} />
      ))}

      {/* Retention notice */}
      <View style={styles.retentionNotice}>
        <Text style={[styles.retentionText, { color: theme.colors.textTertiary }]}>
          Showing last {RETENTION_DAYS} days of sessions
        </Text>
      </View>
    </ScrollView>
  );
}

interface DailySummaryCardProps {
  summary: DailySummary;
  theme: any;
}

function DailySummaryCard({ summary, theme }: DailySummaryCardProps) {
  const sessionCount = summary.completedCount + summary.partialCount;
  const hasBreaks = summary.breakMinutes > 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Date Header */}
      <Text style={[styles.dateText, { color: theme.colors.text }]}>
        {summary.displayDate}
      </Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Focus Time */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatFocusTime(summary.totalMinutes)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
            focus
          </Text>
        </View>

        {/* Break Time (if any) */}
        {hasBreaks && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.textSecondary }]}>
              {formatFocusTime(summary.breakMinutes)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
              breaks
            </Text>
          </View>
        )}

        {/* Session Count */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {sessionCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
            {sessionCount === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 32,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  retentionNotice: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  retentionText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
