import React, { useState, useEffect } from 'react';
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
import { SessionDraft, PrepStep } from '@flowmate/shared/types';
import { createPrepStep } from '../services/sessionService';
import { useTheme } from '../theme/ThemeContext';

interface SessionSetupProps {
  visible: boolean;
  onStart: (draft: SessionDraft) => void;
  onSkip: () => void;
  initialDraft?: SessionDraft;
}

const MAX_INTENT_LENGTH = 80;
const MAX_STEP_LENGTH = 60;
const MAX_STEPS = 5;

export function SessionSetup({ visible, onStart, onSkip, initialDraft }: SessionSetupProps) {
  const { theme } = useTheme();
  const [intent, setIntent] = useState('');
  const [steps, setSteps] = useState<PrepStep[]>([]);
  const [newStepText, setNewStepText] = useState('');

  useEffect(() => {
    if (visible) {
      console.log('SessionSetup visible, initialDraft:', JSON.stringify(initialDraft));
      // Only populate with initialDraft if it has meaningful content
      if (initialDraft && (initialDraft.intent || initialDraft.steps.length > 0)) {
        console.log('Populating with existing draft');
        setIntent(initialDraft.intent);
        setSteps(initialDraft.steps);
      } else {
        console.log('Resetting to empty state');
        // Reset to empty state when modal opens without a draft
        setIntent('');
        setSteps([]);
      }
    }
  }, [visible, initialDraft]);

  const handleAddStep = () => {
    if (newStepText.trim() && steps.length < MAX_STEPS) {
      const newStep = createPrepStep(newStepText.trim());
      setSteps([...steps, newStep]);
      setNewStepText('');
    }
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleToggleStep = (id: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, done: !step.done } : step))
    );
  };

  const handleStart = () => {
    const draft: SessionDraft = {
      intent: intent.trim(),
      steps,
    };
    onStart(draft);
  };

  const handleSkip = () => {
    setIntent('');
    setSteps([]);
    setNewStepText('');
    onSkip();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleSkip}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Bottom Sheet Design */}
        <Pressable style={styles.backdrop} onPress={handleSkip}>
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
              <Text style={[styles.emoji, { fontSize: 48 }]}>🎯</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>Let's focus</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                What matters most right now?
              </Text>
            </View>

            {/* Intent Input */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  I'm focusing on
                </Text>
                {intent.length > 0 && (
                  <Text style={[styles.charCountInline, { color: theme.colors.textTertiary }]}>
                    {intent.length}/{MAX_INTENT_LENGTH}
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.intentInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: intent.length >= MAX_INTENT_LENGTH ? theme.colors.warning : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={intent}
                onChangeText={setIntent}
                placeholder="e.g., Finishing the project proposal"
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={MAX_INTENT_LENGTH}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoFocus={false}
              />
            </View>

            {/* Steps Section */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Break it down (optional)
                </Text>
                <Text style={[styles.stepCounter, { color: theme.colors.textTertiary }]}>
                  {steps.length}/{MAX_STEPS}
                </Text>
              </View>

              {/* Existing Steps */}
              {steps.map((step, index) => (
                <View key={step.id} style={[
                  styles.stepItem,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderBottomColor: theme.colors.border,
                  }
                ]}>
                  <TouchableOpacity
                    onPress={() => handleToggleStep(step.id)}
                    style={styles.checkboxTouchArea}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: theme.colors.border },
                        step.done && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                      ]}
                    >
                      {step.done && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <Text style={[
                    styles.stepText,
                    { color: theme.colors.text },
                    step.done && {
                      textDecorationLine: 'line-through',
                      color: theme.colors.textTertiary
                    },
                  ]}>
                    {step.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveStep(step.id)}
                    style={styles.removeButtonTouchArea}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={[styles.removeButton, { color: theme.colors.textTertiary }]}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add New Step */}
              {steps.length < MAX_STEPS && (
                <View style={styles.addStepContainer}>
                  <TextInput
                    style={[
                      styles.stepInput,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                    value={newStepText}
                    onChangeText={setNewStepText}
                    placeholder="Add a step..."
                    placeholderTextColor={theme.colors.textTertiary}
                    maxLength={MAX_STEP_LENGTH}
                    onSubmitEditing={handleAddStep}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={handleAddStep}
                    disabled={!newStepText.trim()}
                    style={[
                      styles.addButton,
                      { backgroundColor: theme.colors.primary },
                      !newStepText.trim() && styles.addButtonDisabled,
                    ]}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bottom spacing for better scrolling */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Fixed Action Buttons */}
          <View style={[styles.footer, {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          }]}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[styles.skipButton, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStart}
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.startButtonText}>Start Session</Text>
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
  backdrop: {
    flex: 1,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  charCountInline: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '500',
  },
  intentInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 100,
    borderWidth: 1.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 56,
  },
  checkboxTouchArea: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  removeButtonTouchArea: {
    padding: 4,
  },
  removeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  addStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 52,
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    gap: 12,
    borderTopWidth: 1,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
