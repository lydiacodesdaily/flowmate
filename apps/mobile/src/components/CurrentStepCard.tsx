import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { PrepStep } from '@flowmate/shared/types';

interface CurrentStepCardProps {
  steps: PrepStep[];
  onToggleCurrentStep: (id: string) => void;
  onExpand: () => void;
}

export function CurrentStepCard({ steps, onToggleCurrentStep, onExpand }: CurrentStepCardProps) {
  const { theme } = useTheme();

  if (steps.length === 0) return null;

  const completedCount = steps.filter(s => s.done).length;
  const currentStep = steps.find(s => !s.done) ?? null;
  const allDone = completedCount === steps.length;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceSecondary }]}>
      {/* Left: checkbox + current step text */}
      <TouchableOpacity
        style={styles.stepSection}
        onPress={() => currentStep && onToggleCurrentStep(currentStep.id)}
        activeOpacity={0.6}
        disabled={allDone}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: allDone ? theme.colors.primary : theme.colors.border },
            allDone && { backgroundColor: theme.colors.primary },
          ]}
        >
          {allDone && (
            <Text allowFontScaling={false} style={styles.checkmark}>✓</Text>
          )}
        </View>
        <Text
          style={[
            styles.stepText,
            { color: allDone ? theme.colors.success : theme.colors.text },
            allDone && styles.stepTextDone,
          ]}
          numberOfLines={1}
        >
          {allDone ? 'All steps done' : currentStep?.text}
        </Text>
      </TouchableOpacity>

      {/* Right: count badge + expand arrow */}
      <TouchableOpacity style={styles.expandSection} onPress={onExpand} activeOpacity={0.6}>
        <Text
          style={[
            styles.countBadge,
            { color: allDone ? theme.colors.success : theme.colors.textTertiary },
          ]}
        >
          {completedCount}/{steps.length}
        </Text>
        <Text allowFontScaling={false} style={[styles.chevron, { color: theme.colors.textTertiary }]}>
          ▾
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 6,
  },
  stepSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  stepTextDone: {
    fontStyle: 'italic',
  },
  expandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 11,
  },
});
