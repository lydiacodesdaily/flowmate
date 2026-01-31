import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { PrepStep } from '@flowmate/shared/types';

interface ActiveStepsProps {
  steps: PrepStep[];
  onToggleStep: (stepId: string) => void;
}

export function ActiveSteps({ steps, onToggleStep }: ActiveStepsProps) {
  const { theme } = useTheme();

  if (steps.length === 0) {
    return null;
  }

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
          {completedCount}/{steps.length} done
        </Text>
        {allDone && (
          <Text style={[styles.allDoneText, { color: theme.colors.success }]}>
            ✓
          </Text>
        )}
      </View>

      {/* Step list */}
      <View style={styles.stepsList}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step.id}
            style={styles.stepRow}
            onPress={() => onToggleStep(step.id)}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.colors.border },
                step.done && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              {step.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.stepText,
                { color: theme.colors.text },
                step.done && {
                  textDecorationLine: 'line-through',
                  color: theme.colors.textTertiary,
                },
              ]}
              numberOfLines={1}
            >
              {step.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  allDoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepsList: {
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
});
