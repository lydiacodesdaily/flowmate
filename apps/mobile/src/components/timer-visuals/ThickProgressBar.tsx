import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { TimerVisualProps } from './types';

export function ThickProgressBar({ progress, isBreakSession }: TimerVisualProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const fillColor = isBreakSession ? theme.colors.breakAccent : theme.colors.primary;
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
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    height: 20,
    borderRadius: 10,
  },
});
