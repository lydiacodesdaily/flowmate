import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DailySummary, SessionRecord } from '@flowmate/shared/types';
import { formatDuration, formatTime } from '../services/sessionService';
import { useTheme } from '../theme/ThemeContext';

interface SessionHistoryProps {
  dailySummaries: DailySummary[];
}

export function SessionHistory({ dailySummaries }: SessionHistoryProps) {
  const { theme } = useTheme();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    // Auto-expand today by default
    dailySummaries.length > 0 ? new Set([dailySummaries[0].date]) : new Set()
  );

  const toggleExpand = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

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
      {dailySummaries.map((summary) => {
        const isExpanded = expandedDates.has(summary.date);
        return (
          <View key={summary.date} style={styles.daySection}>
            {/* Day Header - Expandable */}
            <TouchableOpacity
              onPress={() => toggleExpand(summary.date)}
              style={[styles.dayHeader, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
            >
              <View style={styles.dayHeaderContent}>
                <View style={styles.dayHeaderLeft}>
                  <Text style={[styles.dayDate, { color: theme.colors.text }]}>
                    {summary.displayDate}
                  </Text>
                  <Text style={[styles.dayStats, { color: theme.colors.textSecondary }]}>
                    {summary.totalMinutes > 0 && `${summary.totalMinutes}m focus`}
                    {summary.breakMinutes > 0 && ` • ${summary.breakMinutes}m break`}
                  </Text>
                </View>

                <View style={styles.dayHeaderRight}>
                  {/* Status badges */}
                  {summary.completedCount > 0 && (
                    <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                      <Text style={styles.statusBadgeText}>
                        ✓ {summary.completedCount}
                      </Text>
                    </View>
                  )}
                  {summary.partialCount > 0 && (
                    <View style={[styles.statusBadge, styles.statusBadgePartial]}>
                      <Text style={styles.statusBadgeText}>
                        ◐ {summary.partialCount}
                      </Text>
                    </View>
                  )}
                  {summary.skippedCount > 0 && (
                    <View style={[styles.statusBadge, styles.statusBadgeSkipped]}>
                      <Text style={styles.statusBadgeText}>
                        ⊘ {summary.skippedCount}
                      </Text>
                    </View>
                  )}

                  {/* Expand/collapse icon */}
                  <View style={styles.expandIconContainer}>
                    <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>
                      {isExpanded ? '▼' : '▶'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Session Cards - Expanded View */}
            {isExpanded && (
              <View style={styles.sessionsContainer}>
                {summary.sessions.map((session) => (
                  <SessionCard key={session.id} session={session} theme={theme} />
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Bottom padding for last item */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

interface SessionCardProps {
  session: SessionRecord;
  theme: any;
}

function SessionCard({ session, theme }: SessionCardProps) {
  const getStatusIcon = () => {
    if (session.timerType === 'break') return '☕';
    switch (session.status) {
      case 'completed':
        return '✓';
      case 'partial':
        return '◐';
      case 'skipped':
        return '⊘';
      default:
        return '•';
    }
  };

  const getStatusColor = () => {
    if (session.timerType === 'break') return '#10b981';
    switch (session.status) {
      case 'completed':
        return '#06b6d4';
      case 'partial':
        return '#f59e0b';
      case 'skipped':
        return '#94a3b8';
      default:
        return '#64748b';
    }
  };

  const getModeLabel = () => {
    switch (session.mode) {
      case 'pomodoro':
        return 'Pomodoro';
      case 'guided':
        return 'Guided';
      case 'custom':
        return 'Custom';
      default:
        return '';
    }
  };

  const statusColor = getStatusColor();
  const completedMinutes = Math.floor(session.completedSeconds / 60);
  const isBreakSession = session.timerType === 'break';

  return (
    <View style={[
      styles.sessionCard,
      {
        backgroundColor: theme.colors.surface,
        borderLeftColor: statusColor,
      }
    ]}>
      {/* Header Row */}
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderLeft}>
          <View style={[styles.statusIconCircle, { backgroundColor: statusColor }]}>
            <Text style={styles.statusIconText}>{getStatusIcon()}</Text>
          </View>
          <View style={styles.sessionMeta}>
            <View style={styles.sessionMetaRow}>
              <Text style={[styles.sessionTime, { color: theme.colors.text }]}>
                {formatTime(session.startedAt)}
              </Text>
              {!isBreakSession && (
                <>
                  <Text style={[styles.sessionDivider, { color: theme.colors.textTertiary }]}>
                    •
                  </Text>
                  <Text style={[styles.sessionMode, { color: theme.colors.textSecondary }]}>
                    {getModeLabel()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={[styles.sessionDuration, { color: theme.colors.text }]}>
            {formatDuration(session.completedSeconds)}
          </Text>
        </View>
      </View>

      {/* Intent */}
      {session.intent && (
        <Text style={[styles.sessionIntent, { color: theme.colors.text }]} numberOfLines={2}>
          {session.intent}
        </Text>
      )}

      {/* Steps Progress */}
      {session.steps && session.steps.total > 0 && (
        <View style={styles.stepsProgress}>
          <View style={[styles.stepsProgressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <View
              style={[
                styles.stepsProgressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(session.steps.done / session.steps.total) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.stepsText, { color: theme.colors.textSecondary }]}>
            {session.steps.done}/{session.steps.total} steps
          </Text>
        </View>
      )}

      {/* Reflection Note */}
      {session.note && (
        <View style={[styles.noteContainer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.noteIcon, { color: theme.colors.textTertiary }]}>💭</Text>
          <Text
            style={[styles.sessionNote, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {session.note}
          </Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 72,
  },
  dayHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  dayStats: {
    fontSize: 14,
    lineHeight: 18,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeCompleted: {
    backgroundColor: '#06b6d4',
  },
  statusBadgePartial: {
    backgroundColor: '#f59e0b',
  },
  statusBadgeSkipped: {
    backgroundColor: '#94a3b8',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  expandIconContainer: {
    marginLeft: 4,
    padding: 4,
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionsContainer: {
    marginTop: 12,
    gap: 12,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIconText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sessionMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  sessionDivider: {
    fontSize: 12,
  },
  sessionMode: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sessionDuration: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sessionIntent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  stepsProgress: {
    marginBottom: 12,
  },
  stepsProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  stepsProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  noteIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  sessionNote: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
