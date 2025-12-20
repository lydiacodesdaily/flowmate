import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = '#E94B3C',
  backgroundColor = '#E0E0E0',
  height = 6,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, { backgroundColor, height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
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
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});
