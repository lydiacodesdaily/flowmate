import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { useAccessibility } from '../../contexts';

interface OnboardingProgressDotsProps {
  currentStep: 1 | 2 | 3;
  totalSteps?: number;
}

export function OnboardingProgressDots({
  currentStep,
  totalSteps = 3,
}: OnboardingProgressDotsProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <View
            key={stepNumber}
            style={[
              styles.dot,
              {
                backgroundColor: isActive || isCompleted
                  ? theme.colors.primary
                  : theme.colors.border,
                transform: [{ scale: isActive && !reduceMotion ? 1.2 : 1 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
