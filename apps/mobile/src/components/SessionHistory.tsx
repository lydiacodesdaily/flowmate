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

interface SessionHistoryProps {
  dailySummaries: DailySummary[];
}

export function SessionHistory({ dailySummaries }: SessionHistoryProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

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
        <Text style={styles.emptyStateText}>No sessions yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Complete a focus session to see it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {dailySummaries.map((summary) => {
        const isExpanded = expandedDates.has(summary.date);
        return (
          <View key={summary.date} style={styles.daySection}>
            <TouchableOpacity
              onPress={() => toggleExpand(summary.date)}
              style={styles.dayHeader}
            >
              <View style={styles.dayHeaderLeft}>
                <Text style={styles.dayDate}>{summary.displayDate}</Text>
                <Text style={styles.dayStats}>
                  {summary.totalMinutes > 0 && `${summary.totalMinutes}m focus`}
                  {summary.breakMinutes > 0 && ` · ${summary.breakMinutes}m break`}
                </Text>
              </View>
              <View style={styles.dayHeaderRight}>
                {summary.completedCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ {summary.completedCount}</Text>
                  </View>
                )}
                {summary.partialCount > 0 && (
                  <View style={[styles.badge, styles.badgePartial]}>
                    <Text style={styles.badgeText}>◐ {summary.partialCount}</Text>
                  </View>
                )}
                {summary.skippedCount > 0 && (
                  <View style={[styles.badge, styles.badgeSkipped]}>
                    <Text style={styles.badgeText}>⊘ {summary.skippedCount}</Text>
                  </View>
                )}
                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.sessionsContainer}>
                {summary.sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function SessionCard({ session }: { session: SessionRecord }) {
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

  return (
    <View style={[styles.sessionCard, { borderLeftColor: statusColor }]}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderLeft}>
          <Text style={[styles.statusIcon, { color: statusColor }]}>
            {getStatusIcon()}
          </Text>
          <Text style={styles.sessionTime}>{formatTime(session.startedAt)}</Text>
          <Text style={styles.sessionMode}>{getModeLabel()}</Text>
        </View>
        <Text style={styles.sessionDuration}>
          {formatDuration(session.completedSeconds)}
        </Text>
      </View>

      {session.intent && (
        <Text style={styles.sessionIntent}>{session.intent}</Text>
      )}

      {session.steps && (
        <Text style={styles.sessionSteps}>
          {session.steps.done}/{session.steps.total} steps completed
        </Text>
      )}

      {session.note && (
        <Text style={styles.sessionNote}>{session.note}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  dayStats: {
    fontSize: 13,
    color: '#64748b',
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePartial: {
    backgroundColor: '#f59e0b',
  },
  badgeSkipped: {
    backgroundColor: '#94a3b8',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  expandIcon: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
  },
  sessionsContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  sessionMode: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  sessionIntent: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  sessionSteps: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  sessionNote: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
});
