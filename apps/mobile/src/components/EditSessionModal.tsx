import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { SessionRecord } from '@flowmate/shared/types';
import { useTheme } from '../theme/ThemeContext';
import { useAccessibility } from '../contexts';
import { updateHistoryRecord, deleteHistoryRecord } from '../services/sessionService';

interface EditSessionModalProps {
  visible: boolean;
  session: SessionRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 24 * 60;
const STEP_MINUTES = 5;

export function EditSessionModal({ visible, session, onClose, onSaved }: EditSessionModalProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();

  const [durationMinutes, setDurationMinutes] = useState(0);
  const [intent, setIntent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setDurationMinutes(Math.max(1, Math.round(session.completedSeconds / 60)));
      setIntent(session.intent ?? '');
    }
  }, [session]);

  if (!session) return null;

  const originalMinutes = Math.max(1, Math.round(session.completedSeconds / 60));
  const durationChanged = durationMinutes !== originalMinutes;
  const intentChanged = intent !== (session.intent ?? '');
  const hasChanges = durationChanged || intentChanged;

  const handleDecrement = () => {
    setDurationMinutes(prev => Math.max(MIN_MINUTES, prev - STEP_MINUTES));
  };

  const handleIncrement = () => {
    setDurationMinutes(prev => Math.min(MAX_MINUTES, prev + STEP_MINUTES));
  };

  const handleDurationInput = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      setDurationMinutes(Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, num)));
    } else if (text === '') {
      setDurationMinutes(MIN_MINUTES);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const updates: Parameters<typeof updateHistoryRecord>[1] = {
      editedAt: Date.now(),
    };

    if (durationChanged) {
      if (!session.originalCompletedSeconds) {
        updates.originalCompletedSeconds = session.completedSeconds;
      }
      const newSeconds = durationMinutes * 60;
      updates.completedSeconds = newSeconds;
      updates.plannedSeconds = newSeconds;
    }

    if (intentChanged) {
      updates.intent = intent.trim() || undefined;
    }

    await updateHistoryRecord(session.id, updates);
    setSaving(false);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove this session?',
      '',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteHistoryRecord(session.id);
            onSaved();
            onClose();
          },
        },
      ]
    );
  };

  const isManual = session.isManual === true;
  const wasEdited = !!session.editedAt;

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'slide'}
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={styles.backdropOverlay} />
        </Pressable>

        <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surface }]}>
          {/* Handle */}
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
              <Text style={[styles.title, { color: theme.colors.text }]}>Edit Session</Text>
              {(isManual || wasEdited) && (
                <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textTertiary }]}>
                    {isManual ? 'manual' : 'adjusted'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Adjust anything that doesn't look right. Your effort counts even when tracking is imperfect.
            </Text>

            {/* Duration stepper */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}>Duration</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperButton, { backgroundColor: theme.colors.surfaceSecondary }]}
                  onPress={handleDecrement}
                  activeOpacity={0.7}
                  accessibilityLabel="Decrease duration"
                >
                  <Text style={[styles.stepperButtonText, { color: theme.colors.text }]}>−</Text>
                </TouchableOpacity>

                <View style={[styles.stepperValue, { borderColor: theme.colors.border }]}>
                  <TextInput
                    style={[styles.stepperInput, { color: theme.colors.text }]}
                    value={String(durationMinutes)}
                    onChangeText={handleDurationInput}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    accessibilityLabel="Duration in minutes"
                  />
                  <Text style={[styles.stepperUnit, { color: theme.colors.textTertiary }]}>min</Text>
                </View>

                <TouchableOpacity
                  style={[styles.stepperButton, { backgroundColor: theme.colors.surfaceSecondary }]}
                  onPress={handleIncrement}
                  activeOpacity={0.7}
                  accessibilityLabel="Increase duration"
                >
                  <Text style={[styles.stepperButtonText, { color: theme.colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              {session.originalCompletedSeconds && (
                <Text style={[styles.originalNote, { color: theme.colors.textTertiary }]}>
                  Originally {Math.round(session.originalCompletedSeconds / 60)} min
                </Text>
              )}
            </View>

            {/* Intent field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}>
                What were you focusing on? <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.intentInput, { backgroundColor: theme.colors.surfaceSecondary, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={intent}
                onChangeText={setIntent}
                placeholder="e.g. writing, deep work, reading"
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={120}
                returnKeyType="done"
              />
            </View>

            {/* Delete */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteText, { color: theme.colors.textTertiary }]}>Remove session</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: hasChanges ? theme.colors.primary : theme.colors.surfaceSecondary }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={[styles.saveButtonText, { color: hasChanges ? '#FFFFFF' : theme.colors.textTertiary }]}>
                {saving ? 'Saving…' : 'Save changes'}
              </Text>
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionalLabel: {
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 28,
  },
  stepperValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  stepperInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 44,
  },
  stepperUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  originalNote: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  intentInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
