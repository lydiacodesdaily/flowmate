import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { TimerVisualProps } from './types';

const SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularTimer({ progress, isBreakSession }: TimerVisualProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Progress goes from 0 (start) to 1 (end), but we want to show time remaining
  // So at progress=0 (start), the circle should be full
  // At progress=1 (end), the circle should be empty
  const strokeDashoffset = CIRCUMFERENCE * clampedProgress;

  const fillColor = isBreakSession ? theme.colors.breakAccent : theme.colors.primary;
  const bgColor = theme.colors.border;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={bgColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={fillColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  svg: {
    transform: [{ scaleX: -1 }], // Mirror so progress goes clockwise
  },
});
