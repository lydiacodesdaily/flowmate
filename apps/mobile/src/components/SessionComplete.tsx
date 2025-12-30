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
} from 'react-native';
import { SessionDraft, PrepStep, SessionStatus, TimerType } from '@flowmate/shared/types';

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

export function SessionComplete({
  visible,
  timerType,
  completedSeconds,
  plannedSeconds,
  draft,
  onSave,
  onDiscard,
}: SessionCompleteProps) {
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

  // Break session UI
  if (isBreakSession) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleDiscard}
      >
        <View style={styles.container}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.emoji}>☕</Text>
              <Text style={styles.title}>Break Complete!</Text>
              <Text style={styles.subtitle}>
                You rested for {completedMinutes} {completedMinutes === 1 ? 'minute' : 'minutes'}
              </Text>

              <View style={styles.breakActions}>
                <TouchableOpacity
                  onPress={handleDiscard}
                  style={styles.breakButton}
                >
                  <Text style={styles.breakButtonText}>⚡ Ready to Focus</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDiscard}
                  style={[styles.breakButton, styles.breakButtonSecondary]}
                >
                  <Text style={styles.breakButtonSecondaryText}>Take another break</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Focus session UI
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => handleSave()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.emoji}>✨</Text>
              <Text style={styles.title}>Session Complete</Text>
              <Text style={styles.completedTime}>
                {completedMinutes} {completedMinutes === 1 ? 'minute' : 'minutes'}
              </Text>

              {/* Show original intent */}
              {draft?.intent && (
                <View style={styles.intentSection}>
                  <Text style={styles.intentLabel}>You were focusing on:</Text>
                  <Text style={styles.intentText}>{draft.intent}</Text>
                </View>
              )}

              {/* Session Status */}
              <View style={styles.section}>
                <Text style={styles.label}>How did it go?</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    onPress={() => setStatus('completed')}
                    style={[
                      styles.statusOption,
                      status === 'completed' && styles.statusOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === 'completed' && styles.statusOptionTextSelected,
                      ]}
                    >
                      ✓ Completed
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus('partial')}
                    style={[
                      styles.statusOption,
                      status === 'partial' && styles.statusOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === 'partial' && styles.statusOptionTextSelected,
                      ]}
                    >
                      ◐ Partial
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus('skipped')}
                    style={[
                      styles.statusOption,
                      status === 'skipped' && styles.statusOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === 'skipped' && styles.statusOptionTextSelected,
                      ]}
                    >
                      ⊘ Skipped
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Steps Checklist */}
              {steps.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Steps ({completedSteps}/{steps.length} completed)
                  </Text>
                  {steps.map((step) => (
                    <TouchableOpacity
                      key={step.id}
                      onPress={() => handleToggleStep(step.id)}
                      style={styles.stepItem}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          step.done && styles.checkboxChecked,
                        ]}
                      >
                        {step.done && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          step.done && styles.stepTextDone,
                        ]}
                      >
                        {step.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Reflection Note */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  What did you actually work on? (optional)
                </Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Reflection notes..."
                  placeholderTextColor="#94a3b8"
                  maxLength={MAX_NOTE_LENGTH}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {note.length > 100 && (
                  <Text style={styles.charCount}>
                    {note.length}/{MAX_NOTE_LENGTH}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleDiscard}
                  style={styles.discardButton}
                >
                  <Text style={styles.discardButtonText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSave()}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save Session</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  completedTime: {
    fontSize: 20,
    fontWeight: '600',
    color: '#06b6d4',
    textAlign: 'center',
    marginBottom: 24,
  },
  intentSection: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  intentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  intentText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  statusOptionSelected: {
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  statusOptionTextSelected: {
    color: '#06b6d4',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  stepTextDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  discardButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakActions: {
    marginTop: 24,
  },
  breakButton: {
    paddingVertical: 16,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  breakButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  breakButtonSecondaryText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});
