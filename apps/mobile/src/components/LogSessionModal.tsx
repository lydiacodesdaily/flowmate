import React, { useState } from 'react';
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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAccessibility } from '../contexts';
import { addManualSession } from '../services/sessionService';

interface LogSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  isPremium?: boolean;
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 24 * 60;
const STEP_MINUTES = 5;
const QUICK_DURATIONS = [15, 25, 45, 60];

export function LogSessionModal({ visible, onClose, onSaved, isPremium = false }: LogSessionModalProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [intent, setIntent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setDurationMinutes(25);
    setIntent('');
    onClose();
  };

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
    }
  };

  const handleSave = async () => {
    if (saving || durationMinutes < MIN_MINUTES) return;
    setSaving(true);
    await addManualSession(durationMinutes, intent.trim() || undefined);
    setSaving(false);
    setDurationMinutes(25);
    setIntent('');
    onSaved();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'slide'}
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Log a session</Text>
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Did some focused work but forgot to start the timer? Add it here — it counts.
            </Text>

            {/* Quick duration presets */}
            <View style={styles.presets}>
              {QUICK_DURATIONS.map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: durationMinutes === mins ? theme.colors.primary : theme.colors.surfaceSecondary,
                      borderColor: durationMinutes === mins ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setDurationMinutes(mins)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.presetText,
                    { color: durationMinutes === mins ? '#FFFFFF' : theme.colors.text },
                  ]}>
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
            </View>

            {/* Intent */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}>
                What were you focusing on? <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.intentInput, { backgroundColor: theme.colors.surfaceSecondary, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={intent}
                onChangeText={setIntent}
                placeholder="e.g. writing, reading, deep work"
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={120}
                returnKeyType="done"
              />
            </View>

            {/* Past-date lock (premium upsell) */}
            <TouchableOpacity
              style={[styles.premiumRow, { backgroundColor: theme.colors.surfaceSecondary }]}
              activeOpacity={isPremium ? 0.7 : 0.5}
              disabled={!isPremium}
            >
              <View style={styles.premiumRowLeft}>
                <Text style={[styles.premiumRowLabel, { color: isPremium ? theme.colors.text : theme.colors.textTertiary }]}>
                  Date
                </Text>
                <Text style={[styles.premiumRowValue, { color: isPremium ? theme.colors.text : theme.colors.textTertiary }]}>
                  Today
                </Text>
              </View>
              {!isPremium && (
                <View style={[styles.lockBadge, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.lockText, { color: theme.colors.primary }]}>Premium</Text>
                </View>
              )}
            </TouchableOpacity>
            {!isPremium && (
              <Text style={[styles.premiumNote, { color: theme.colors.textTertiary }]}>
                Logging sessions from earlier days is a premium feature.
              </Text>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving…' : 'Log session'}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
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
  intentInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  premiumRowLeft: {
    gap: 2,
  },
  premiumRowLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumRowValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  lockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  premiumNote: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
    paddingHorizontal: 2,
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});