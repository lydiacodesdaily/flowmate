import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../theme';
import { useAccessibility } from '../contexts';
import type { PrepStep } from '@flowmate/shared/types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActiveStepsProps {
  steps: PrepStep[];
  onToggleStep: (stepId: string) => void;
}

export function ActiveSteps({ steps, onToggleStep }: ActiveStepsProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();
  const [isExpanded, setIsExpanded] = useState(false);

  if (steps.length === 0) {
    return null;
  }

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  const handleToggleExpand = () => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Collapsible header - always visible */}
      <TouchableOpacity
        style={[styles.headerPill, { backgroundColor: theme.colors.surfaceSecondary }]}
        onPress={handleToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          {allDone ? (
            <>
              <Text style={[styles.checkIcon, { color: theme.colors.success }]}>✓</Text>
              <Text style={[styles.headerText, { color: theme.colors.success }]}>
                All done
              </Text>
            </>
          ) : (
            <Text style={[styles.headerText, { color: theme.colors.textSecondary }]}>
              {completedCount}/{steps.length} steps
            </Text>
          )}
          <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>
            {isExpanded ? '▴' : '▾'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded step list */}
      {isExpanded && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  headerPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 10,
    marginLeft: 2,
  },
  stepsList: {
    width: '100%',
    marginTop: 8,
    gap: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
});
