import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { TimerVisualProps } from './types';

const CONTAINER_WIDTH = 80;
const CONTAINER_HEIGHT = 120;

export function FillingContainer({ progress, isBreakSession }: TimerVisualProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Progress goes from 0 (start) to 1 (end)
  // At progress=0, container is full (100% height)
  // At progress=1, container is empty (0% height)
  const fillHeight = (1 - clampedProgress) * 100;

  const fillColor = isBreakSession ? theme.colors.breakAccent : theme.colors.primary;
  const bgColor = theme.colors.border;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View
          style={[
            styles.fill,
            {
              height: `${fillHeight}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 12,
  },
});
