import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 4,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const fillColor = color || theme.colors.textSecondary;
  const bgColor = backgroundColor || theme.colors.border;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: fillColor,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 2,
  },
});
