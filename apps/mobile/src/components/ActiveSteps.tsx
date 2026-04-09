import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../theme';
import { useAccessibility } from '../contexts';
import type { PrepStep } from '@flowmate/shared/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActiveStepsProps {
  steps: PrepStep[];
  onCollapse: () => void;
  onToggleStep: (id: string) => void;
  onEditStep: (id: string, text: string) => void;
  onDeleteStep: (id: string) => void;
  onAddStep: (text: string) => void;
  onMoveStep: (id: string, direction: 'up' | 'down') => void;
}

export function ActiveSteps({
  steps,
  onCollapse,
  onToggleStep,
  onEditStep,
  onDeleteStep,
  onAddStep,
  onMoveStep,
}: ActiveStepsProps) {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepText, setNewStepText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const completedCount = steps.filter(s => s.done).length;
  const allDone = steps.length > 0 && completedCount === steps.length;

  const handleStartEdit = (step: PrepStep) => {
    setEditingStepId(step.id);
    setEditingText(step.text);
  };

  const handleSaveEdit = () => {
    if (editingStepId) {
      const trimmed = editingText.trim();
      if (trimmed) {
        onEditStep(editingStepId, trimmed);
      }
    }
    setEditingStepId(null);
    setEditingText('');
  };

  const handleAddPress = () => {
    setIsAddingStep(true);
    setNewStepText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const handleAddConfirm = () => {
    const trimmed = newStepText.trim();
    if (trimmed) {
      onAddStep(trimmed);
    }
    setIsAddingStep(false);
    setNewStepText('');
  };

  const handleAddCancel = () => {
    setIsAddingStep(false);
    setNewStepText('');
  };

  const handleToggleEditMode = () => {
    setIsEditMode(prev => !prev);
    setEditingStepId(null);
    setEditingText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Panel header */}
      <View style={[styles.panelHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onCollapse} style={styles.collapseButton} activeOpacity={0.6}>
          <Text allowFontScaling={false} style={[styles.chevronUp, { color: theme.colors.textTertiary }]}>
            ▴
          </Text>
          <Text style={[styles.collapseLabel, { color: theme.colors.textTertiary }]}>Steps</Text>
        </TouchableOpacity>

        <Text style={[styles.countLabel, { color: allDone ? theme.colors.success : theme.colors.textSecondary }]}>
          {allDone ? '✓ All done' : `${completedCount} / ${steps.length}`}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleToggleEditMode}
            style={styles.headerActionButton}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.headerActionText,
                { color: isEditMode ? theme.colors.primary : theme.colors.textTertiary },
              ]}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddPress} style={styles.headerActionButton} activeOpacity={0.6}>
            <Text
              allowFontScaling={false}
              style={[styles.addButtonText, { color: theme.colors.textSecondary }]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step, index) => (
          <View
            key={step.id}
            style={[styles.stepRow, { borderBottomColor: theme.colors.border }]}
          >
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => onToggleStep(step.id)}
              style={styles.checkboxButton}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: step.done ? theme.colors.primary : theme.colors.border },
                  step.done && { backgroundColor: theme.colors.primary },
                ]}
              >
                {step.done && (
                  <Text allowFontScaling={false} style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Step text or edit input */}
            {editingStepId === step.id ? (
              <TextInput
                style={[
                  styles.stepInput,
                  { color: theme.colors.text, borderBottomColor: theme.colors.primary },
                ]}
                value={editingText}
                onChangeText={setEditingText}
                onBlur={handleSaveEdit}
                onSubmitEditing={handleSaveEdit}
                autoFocus
                returnKeyType="done"
                maxLength={120}
                blurOnSubmit
              />
            ) : (
              <TouchableOpacity
                style={styles.stepTextButton}
                onPress={() => handleStartEdit(step)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.stepText,
                    { color: step.done ? theme.colors.textTertiary : theme.colors.text },
                    step.done && styles.stepTextDone,
                  ]}
                >
                  {step.text}
                </Text>
              </TouchableOpacity>
            )}

            {/* Edit mode controls: reorder + delete */}
            {isEditMode && editingStepId !== step.id && (
              <View style={styles.editControls}>
                <TouchableOpacity
                  onPress={() => onMoveStep(step.id, 'up')}
                  disabled={index === 0}
                  style={styles.moveButton}
                  activeOpacity={0.6}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.moveIcon,
                      {
                        color:
                          index === 0
                            ? theme.colors.textTertiary + '30'
                            : theme.colors.textTertiary,
                      },
                    ]}
                  >
                    ▲
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onMoveStep(step.id, 'down')}
                  disabled={index === steps.length - 1}
                  style={styles.moveButton}
                  activeOpacity={0.6}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.moveIcon,
                      {
                        color:
                          index === steps.length - 1
                            ? theme.colors.textTertiary + '30'
                            : theme.colors.textTertiary,
                      },
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteStep(step.id)}
                  style={styles.deleteButton}
                  activeOpacity={0.6}
                >
                  <Text allowFontScaling={false} style={[styles.deleteIcon, { color: theme.colors.error }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Inline add step row */}
        {isAddingStep ? (
          <View style={[styles.addStepRow, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.checkbox, styles.checkboxPlaceholder, { borderColor: theme.colors.border }]} />
            <TextInput
              style={[
                styles.stepInput,
                styles.addStepInput,
                { color: theme.colors.text, borderBottomColor: theme.colors.primary },
              ]}
              placeholder="New step..."
              placeholderTextColor={theme.colors.textTertiary}
              value={newStepText}
              onChangeText={setNewStepText}
              onBlur={handleAddConfirm}
              onSubmitEditing={handleAddConfirm}
              autoFocus
              returnKeyType="done"
              maxLength={120}
              blurOnSubmit
            />
            <TouchableOpacity onPress={handleAddCancel} style={styles.cancelAddButton} activeOpacity={0.6}>
              <Text allowFontScaling={false} style={[styles.cancelAddIcon, { color: theme.colors.textTertiary }]}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addStepHint} onPress={handleAddPress} activeOpacity={0.6}>
            <Text style={[styles.addStepHintText, { color: theme.colors.textTertiary }]}>
              + Add a step
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingRight: 8,
  },
  chevronUp: {
    fontSize: 10,
  },
  collapseLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  countLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  headerActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  checkboxButton: {
    padding: 2,
    flexShrink: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxPlaceholder: {
    opacity: 0,
    flexShrink: 0,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTextButton: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepTextDone: {
    textDecorationLine: 'line-through',
  },
  stepInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  addStepInput: {
    flex: 1,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moveButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  moveIcon: {
    fontSize: 11,
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  addStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  cancelAddButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  cancelAddIcon: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  addStepHint: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  addStepHintText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
