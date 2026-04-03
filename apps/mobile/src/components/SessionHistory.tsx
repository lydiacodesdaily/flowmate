import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { DailySummary, SessionRecord } from '@flowmate/shared/types';
import { RETENTION_DAYS, formatFocusTime, formatTime, isResumable, sessionToDraft, saveDraft } from '../services/sessionService';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTimerContext } from '../contexts/TimerContext';
import type { TabParamList } from '../navigation/types';
import { EditSessionModal } from './EditSessionModal';
import { LogSessionModal } from './LogSessionModal';

type RootNavigationProp = NavigationProp<TabParamList>;

interface SessionHistoryProps {
  dailySummaries: DailySummary[];
  onRefresh?: () => void;
  isPremium?: boolean;
}

export function SessionHistory({ dailySummaries, onRefresh, isPremium = false }: SessionHistoryProps) {
  const { theme } = useTheme();
  const { contentStyle } = useResponsive();
  const navigation = useNavigation<RootNavigationProp>();
  const { setSessionDraft } = useTimerContext();

  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleResume = async (session: SessionRecord) => {
    const remainingSeconds = session.plannedSeconds - session.completedSeconds;
    if (remainingSeconds <= 0) return;

    const draft = sessionToDraft(session, true); // preserve step state
    setSessionDraft(draft);
    await saveDraft(draft);

    const durationMinutes = Math.ceil(remainingSeconds / 60);
    navigation.navigate('FocusTab', {
      screen: 'ActiveTimer',
      params: {
        sessions: [{ type: 'focus', durationMinutes }],
        isQuickStart: true,
        resumedFromId: session.id,
      },
    } as any);
  };

  const handleContinueToday = async (session: SessionRecord) => {
    const draft = sessionToDraft(session, false); // reset steps
    setSessionDraft(draft);
    await saveDraft(draft);
    navigation.navigate('FocusTab');
  };

  const handleSessionSaved = () => {
    onRefresh?.();
  };

  const logButton = (
    <TouchableOpacity
      style={[styles.logButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      onPress={() => setShowLogModal(true)}
      activeOpacity={0.7}
    >
      <Text style={[styles.logButtonText, { color: theme.colors.textSecondary }]}>
        + Add a session
      </Text>
    </TouchableOpacity>
  );

  if (dailySummaries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyState}>
          <Text allowFontScaling={false} style={styles.emptyStateEmoji}>📊</Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
            Your sessions will show up here
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
            Complete a focus session to start tracking your progress.
          </Text>
        </View>
        <View style={[styles.contentContainer, contentStyle]}>
          {logButton}
        </View>
        <EditSessionModal
          visible={editingSession !== null}
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={handleSessionSaved}
        />
        <LogSessionModal
          visible={showLogModal}
          onClose={() => setShowLogModal(false)}
          onSaved={handleSessionSaved}
          isPremium={isPremium}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.contentContainer, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {logButton}

      {dailySummaries.map((summary) => (
        <DailySummaryCard
          key={summary.date}
          summary={summary}
          theme={theme}
          onResume={handleResume}
          onContinueToday={handleContinueToday}
          onEditSession={setEditingSession}
        />
      ))}

      {/* Retention notice */}
      <View style={styles.retentionNotice}>
        <Text style={[styles.retentionText, { color: theme.colors.textTertiary }]}>
          Showing last {RETENTION_DAYS} days of sessions
        </Text>
      </View>

      <EditSessionModal
        visible={editingSession !== null}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSaved={handleSessionSaved}
      />
      <LogSessionModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSaved={handleSessionSaved}
        isPremium={isPremium}
      />
    </ScrollView>
  );
}

interface DailySummaryCardProps {
  summary: DailySummary;
  theme: any;
  onResume: (session: SessionRecord) => void;
  onContinueToday: (session: SessionRecord) => void;
  onEditSession: (session: SessionRecord) => void;
}

function getSessionActionButton(
  session: SessionRecord,
  onResume: (session: SessionRecord) => void,
  onContinueToday: (session: SessionRecord) => void,
  theme: any
): React.ReactNode {
  // Only focus sessions get action buttons; break and skipped get none
  if (session.timerType !== 'focus' || session.status === 'skipped') return null;

  if (session.status === 'partial' && isResumable(session)) {
    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => onResume(session)}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>Resume</Text>
      </TouchableOpacity>
    );
  }

  if (session.status === 'partial') {
    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderWidth: 1 }]}
        onPress={() => onContinueToday(session)}
        activeOpacity={0.85}
      >
        <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Continue Today</Text>
      </TouchableOpacity>
    );
  }

  if (session.status === 'completed') {
    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, borderWidth: 1 }]}
        onPress={() => onContinueToday(session)}
        activeOpacity={0.85}
      >
        <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Repeat</Text>
      </TouchableOpacity>
    );
  }

  return null;
}

function SessionRow({
  session,
  theme,
  onResume,
  onContinueToday,
  onEdit,
}: {
  session: SessionRecord;
  theme: any;
  onResume: (session: SessionRecord) => void;
  onContinueToday: (session: SessionRecord) => void;
  onEdit: (session: SessionRecord) => void;
}) {
  const statusIcon =
    session.status === 'completed' ? '✓' :
    session.status === 'partial' ? '◐' : '⊘';

  const statusColor =
    session.status === 'completed' ? theme.colors.primary :
    session.status === 'partial' ? theme.colors.warning : theme.colors.textTertiary;

  const completedMin = Math.floor(session.completedSeconds / 60);
  const plannedMin = Math.floor(session.plannedSeconds / 60);

  const actionButton = getSessionActionButton(session, onResume, onContinueToday, theme);
  const isAdjusted = !!session.editedAt || !!session.isManual;

  return (
    <TouchableOpacity
      style={[styles.sessionRow, { borderTopColor: theme.colors.border }]}
      onPress={() => onEdit(session)}
      activeOpacity={0.6}
      accessibilityLabel={`Edit session: ${completedMin} minutes${session.intent ? ', ' + session.intent : ''}`}
    >
      <View style={styles.sessionRowMain}>
        <Text style={[styles.sessionStatusIcon, { color: statusColor }]}>{statusIcon}</Text>
        <View style={styles.sessionRowContent}>
          <View style={styles.sessionTimeRow}>
            <Text style={[styles.sessionTime, { color: theme.colors.textSecondary }]}>
              {session.isManual ? 'manual · ' : ''}{formatTime(session.startedAt)}
              {session.timerType === 'break' ? ' · break' : ''}
            </Text>
            {isAdjusted && (
              <View style={[styles.adjustedBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <Text style={[styles.adjustedBadgeText, { color: theme.colors.textTertiary }]}>
                  {session.isManual ? 'manual' : 'adjusted'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.sessionDuration, { color: theme.colors.text }]}>
            {completedMin}m{session.status !== 'completed' ? `/${plannedMin}m` : ''}
          </Text>
          {session.intent ? (
            <Text style={[styles.sessionIntent, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {session.intent}
            </Text>
          ) : null}
        </View>
        {actionButton ? (
          <View style={styles.sessionActionContainer}>
            {actionButton}
          </View>
        ) : (
          <Text style={[styles.editChevron, { color: theme.colors.textTertiary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function DailySummaryCard({ summary, theme, onResume, onContinueToday, onEditSession }: DailySummaryCardProps) {
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

      {/* Individual Sessions */}
      {summary.sessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          theme={theme}
          onResume={onResume}
          onContinueToday={onContinueToday}
          onEdit={onEditSession}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
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
    minHeight: 260,
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
  logButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 12,
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
  sessionRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 4,
  },
  sessionRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sessionStatusIcon: {
    fontSize: 14,
    width: 18,
    textAlign: 'center',
  },
  sessionRowContent: {
    flex: 1,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 11,
  },
  adjustedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adjustedBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionIntent: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  sessionActionContainer: {
    flexShrink: 0,
  },
  editChevron: {
    fontSize: 20,
    fontWeight: '300',
    paddingHorizontal: 4,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
