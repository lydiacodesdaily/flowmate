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
} from 'react-native';
import { SessionDraft, PrepStep } from '@flowmate/shared/types';
import { createPrepStep } from '../services/sessionService';

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
  const [intent, setIntent] = useState('');
  const [steps, setSteps] = useState<PrepStep[]>([]);
  const [newStepText, setNewStepText] = useState('');

  useEffect(() => {
    if (initialDraft) {
      setIntent(initialDraft.intent);
      setSteps(initialDraft.steps);
    }
  }, [initialDraft]);

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
              <Text style={styles.title}>Let's focus</Text>

              {/* Intent Input */}
              <View style={styles.section}>
                <Text style={styles.label}>I'm focusing on...</Text>
                <TextInput
                  style={styles.intentInput}
                  value={intent}
                  onChangeText={setIntent}
                  placeholder="What matters most right now?"
                  placeholderTextColor="#94a3b8"
                  maxLength={MAX_INTENT_LENGTH}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {intent.length > 60 && (
                  <Text style={styles.charCount}>{intent.length}/{MAX_INTENT_LENGTH}</Text>
                )}
              </View>

              {/* Steps Section */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Steps to work through ({steps.length}/{MAX_STEPS})
                </Text>

                {/* Existing Steps */}
                {steps.map((step) => (
                  <View key={step.id} style={styles.stepItem}>
                    <TouchableOpacity
                      onPress={() => handleToggleStep(step.id)}
                      style={styles.checkbox}
                    >
                      <View
                        style={[
                          styles.checkboxInner,
                          step.done && styles.checkboxChecked,
                        ]}
                      >
                        {step.done && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                    <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                      {step.text}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                      <Text style={styles.removeButton}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add New Step */}
                {steps.length < MAX_STEPS && (
                  <View style={styles.addStepContainer}>
                    <TextInput
                      style={styles.stepInput}
                      value={newStepText}
                      onChangeText={setNewStepText}
                      placeholder="Add a step..."
                      placeholderTextColor="#94a3b8"
                      maxLength={MAX_STEP_LENGTH}
                      onSubmitEditing={handleAddStep}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={handleAddStep}
                      disabled={!newStepText.trim()}
                      style={styles.addButton}
                    >
                      <Text
                        style={[
                          styles.addButtonText,
                          !newStepText.trim() && styles.addButtonTextDisabled,
                        ]}
                      >
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start focused session</Text>
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
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  intentInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  removeButton: {
    fontSize: 24,
    color: '#94a3b8',
    paddingHorizontal: 8,
  },
  addStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1e293b',
    marginRight: 8,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
