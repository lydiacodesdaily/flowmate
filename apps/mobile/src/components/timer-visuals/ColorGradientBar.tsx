import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { TimerVisualProps } from './types';

export function ColorGradientBar({ progress, isBreakSession }: TimerVisualProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const getProgressColor = (): string => {
    if (isBreakSession) {
      return theme.colors.breakAccent;
    }
    // Green (start) -> Yellow (middle) -> Red (end)
    if (clampedProgress < 0.5) {
      return theme.colors.success;
    }
    if (clampedProgress < 0.8) {
      return theme.colors.warning;
    }
    return theme.colors.error;
  };

  const fillColor = getProgressColor();
  const bgColor = theme.colors.border;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 6,
  },
});
