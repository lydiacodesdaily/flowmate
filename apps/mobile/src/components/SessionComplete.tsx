import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SessionDraft, PrepStep, SessionStatus, TimerType } from '@flowmate/shared/types';
import { useTheme } from '../theme/ThemeContext';

interface SessionCompleteProps {
  visible: boolean;
  timerType: TimerType;
  completedSeconds: number;
  plannedSeconds: number;
  draft?: SessionDraft;
  onSave: (status: SessionStatus, updatedSteps?: PrepStep[], note?: string) => void;
  onDiscard: () => void;
}

const AUTO_SAVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_NOTE_LENGTH = 140;

const STATUS_OPTIONS = [
  { value: 'completed' as SessionStatus, icon: '✓', label: 'Done', color: '#06b6d4' },
  { value: 'partial' as SessionStatus, icon: '◐', label: 'Partial', color: '#f59e0b' },
  { value: 'skipped' as SessionStatus, icon: '⊘', label: 'Skipped', color: '#94a3b8' },
];

export function SessionComplete({
  visible,
  timerType,
  completedSeconds,
  plannedSeconds,
  draft,
  onSave,
  onDiscard,
}: SessionCompleteProps) {
  const { theme } = useTheme();
  const [status, setStatus] = useState<SessionStatus>('completed');
  const [steps, setSteps] = useState<PrepStep[]>([]);
  const [note, setNote] = useState('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const completedMinutes = Math.floor(completedSeconds / 60);
  const isBreakSession = timerType === 'break';

  useEffect(() => {
    if (draft) {
      setSteps(draft.steps || []);
    }
  }, [draft]);

  // Auto-save timer (only for focus sessions)
  useEffect(() => {
    if (visible && !isBreakSession) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave('partial');
      }, AUTO_SAVE_TIMEOUT);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [visible, isBreakSession]);

  const handleToggleStep = (id: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, done: !step.done } : step))
    );
  };

  const handleSave = (saveStatus?: SessionStatus) => {
    const finalStatus = saveStatus || status;
    onSave(finalStatus, steps, note.trim() || undefined);
    resetState();
  };

  const handleDiscard = () => {
    onDiscard();
    resetState();
  };

  const resetState = () => {
    setStatus('completed');
    setSteps([]);
    setNote('');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  };

  const completedSteps = steps.filter((s) => s.done).length;

  // Break session UI - Simplified celebration screen
  if (isBreakSession) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleDiscard}
      >
        <View style={styles.centeredContainer}>
          <Pressable style={styles.backdrop} onPress={handleDiscard}>
            <View style={styles.backdropOverlay} />
          </Pressable>

          <View style={[styles.celebrationCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.celebrationEmoji}>☕</Text>
            <Text style={[styles.celebrationTitle, { color: theme.colors.text }]}>
              Break Complete!
            </Text>
            <Text style={[styles.celebrationSubtitle, { color: theme.colors.textSecondary }]}>
              You rested for {completedMinutes} {completedMinutes === 1 ? 'minute' : 'minutes'}
            </Text>

            <View style={styles.breakActions}>
              <TouchableOpacity
                onPress={handleDiscard}
                style={[styles.breakButtonPrimary, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.breakButtonPrimaryText}>⚡ Ready to Focus</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDiscard}
                style={[styles.breakButtonSecondary, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.breakButtonSecondaryText, { color: theme.colors.textSecondary }]}>
                  Take another break
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Focus session UI - Bottom sheet design
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => handleSave()}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={() => handleSave()}>
          <View style={styles.backdropOverlay} />
        </Pressable>

        <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surface }]}>
          {/* Handle Bar */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>✨</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>Session Complete</Text>
              <View style={[styles.timeBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.timeText, { color: theme.colors.primary }]}>
                  {completedMinutes} {completedMinutes === 1 ? 'minute' : 'minutes'}
                </Text>
              </View>
            </View>

            {/* Show original intent */}
            {draft?.intent && (
              <View style={[styles.intentCard, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <Text style={[styles.intentLabel, { color: theme.colors.textTertiary }]}>
                  You were focusing on
                </Text>
                <Text style={[styles.intentText, { color: theme.colors.text }]}>
                  {draft.intent}
                </Text>
              </View>
            )}

            {/* Session Status - Vertical cards for better mobile UX */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                How did it go?
              </Text>
              <View style={styles.statusOptionsVertical}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderColor: theme.colors.border,
                      },
                      status === option.value && {
                        backgroundColor: theme.isDark ? theme.colors.primaryLight : '#ecfeff',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <View style={styles.statusCardContent}>
                      <View style={[
                        styles.statusIconCircle,
                        { backgroundColor: status === option.value ? option.color : theme.colors.border }
                      ]}>
                        <Text style={styles.statusIcon}>{option.icon}</Text>
                      </View>
                      <View style={styles.statusCardText}>
                        <Text style={[
                          styles.statusLabel,
                          { color: theme.colors.text },
                          status === option.value && { fontWeight: '700' }
                        ]}>
                          {option.label}
                        </Text>
                      </View>
                      {status === option.value && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.selectedCheck}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Steps Checklist */}
            {steps.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                  Your steps ({completedSteps}/{steps.length} completed)
                </Text>
                <View style={[styles.stepsCard, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  {steps.map((step, index) => (
                    <TouchableOpacity
                      key={step.id}
                      onPress={() => handleToggleStep(step.id)}
                      style={[
                        styles.stepRow,
                        index < steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                      ]}
                    >
                      <View
                        style={[
                          styles.stepCheckbox,
                          { borderColor: theme.colors.border },
                          step.done && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                        ]}
                      >
                        {step.done && <Text style={styles.stepCheckmark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          { color: theme.colors.text },
                          step.done && {
                            textDecorationLine: 'line-through',
                            color: theme.colors.textTertiary
                          },
                        ]}
                      >
                        {step.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Reflection Note */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                  What did you work on? (optional)
                </Text>
                {note.length > 0 && (
                  <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
                    {note.length}/{MAX_NOTE_LENGTH}
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: note.length >= MAX_NOTE_LENGTH ? theme.colors.warning : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="Add reflection notes..."
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={MAX_NOTE_LENGTH}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Fixed Action Buttons */}
          <View style={[styles.footer, {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          }]}>
            <TouchableOpacity
              onPress={handleDiscard}
              style={[styles.discardButton, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.discardButtonText, { color: theme.colors.textSecondary }]}>
                Discard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSave()}
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.saveButtonText}>Save Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  timeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  intentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  intentLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  intentText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusOptionsVertical: {
    gap: 12,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 64,
    justifyContent: 'center',
  },
  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  statusCardText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepCheckmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  noteInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 100,
    borderWidth: 1.5,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    gap: 12,
    borderTopWidth: 1,
  },
  discardButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  discardButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  // Break session styles
  celebrationCard: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  celebrationEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  breakActions: {
    width: '100%',
    gap: 12,
  },
  breakButtonPrimary: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  breakButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  breakButtonSecondary: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 56,
    justifyContent: 'center',
  },
  breakButtonSecondaryText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
