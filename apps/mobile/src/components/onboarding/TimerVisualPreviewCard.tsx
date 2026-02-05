import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import { useAccessibility } from '../../contexts';
import { TimerVisualPreset } from '../../constants/timerVisuals';
import type { TimerVisualStyle } from '../../utils/storage';
import { hapticService } from '../../services/hapticService';

interface TimerVisualPreviewCardProps {
  preset: TimerVisualPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function TimerVisualPreviewCard({ preset, isSelected, onSelect }: TimerVisualPreviewCardProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();
  const animatedProgress = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (reduceMotion) {
      animatedProgress.setValue(0.6);
      return;
    }

    // Animate progress from 0.3 to 0.7 and back
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedProgress, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedProgress, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [reduceMotion, animatedProgress]);

  const handlePress = () => {
    hapticService.selection();
    onSelect();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <View style={styles.previewContainer}>
        <MiniTimerVisual
          style={preset.id}
          progress={animatedProgress}
          primaryColor={theme.colors.primary}
          borderColor={theme.colors.border}
          successColor={theme.colors.success}
          warningColor={theme.colors.warning}
          textSecondary={theme.colors.textSecondary}
        />
      </View>
      <Text
        style={[
          styles.name,
          {
            color: isSelected ? theme.colors.primary : theme.colors.text,
            fontWeight: isSelected ? '600' : '500',
          },
        ]}
      >
        {preset.name}
      </Text>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
          <Text allowFontScaling={false} style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface MiniTimerVisualProps {
  style: TimerVisualStyle;
  progress: Animated.Value;
  primaryColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  textSecondary: string;
}

function MiniTimerVisual({
  style,
  progress,
  primaryColor,
  borderColor,
  successColor,
  warningColor,
  textSecondary,
}: MiniTimerVisualProps) {
  switch (style) {
    case 'thin':
      return (
        <MiniThinBar
          progress={progress}
          fillColor={textSecondary}
          bgColor={borderColor}
        />
      );
    case 'thick':
      return (
        <MiniThickBar
          progress={progress}
          fillColor={primaryColor}
          bgColor={borderColor}
        />
      );
    case 'circular':
      return (
        <MiniCircular
          progress={progress}
          fillColor={primaryColor}
          bgColor={borderColor}
        />
      );
    case 'gradient':
      return (
        <MiniGradientBar
          progress={progress}
          bgColor={borderColor}
          successColor={successColor}
          warningColor={warningColor}
        />
      );
    case 'filling':
      return (
        <MiniFilling
          progress={progress}
          fillColor={primaryColor}
          bgColor={borderColor}
        />
      );
    default:
      return null;
  }
}

interface MiniBarProps {
  progress: Animated.Value;
  fillColor: string;
  bgColor: string;
}

function MiniThinBar({ progress, fillColor, bgColor }: MiniBarProps) {
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[miniStyles.thinContainer, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          miniStyles.thinFill,
          { width, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

function MiniThickBar({ progress, fillColor, bgColor }: MiniBarProps) {
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[miniStyles.thickContainer, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          miniStyles.thickFill,
          { width, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

function MiniCircular({ progress, fillColor, bgColor }: MiniBarProps) {
  const SIZE = 48;
  const STROKE_WIDTH = 5;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // For the mini preview, we need to use a listener to update the circle
  const [strokeDashoffset, setStrokeDashoffset] = React.useState(CIRCUMFERENCE * 0.4);

  React.useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setStrokeDashoffset(CIRCUMFERENCE * value);
    });
    return () => progress.removeListener(listener);
  }, [progress, CIRCUMFERENCE]);

  return (
    <View style={miniStyles.circularContainer}>
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ scaleX: -1 }] }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={bgColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
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

interface MiniGradientBarProps {
  progress: Animated.Value;
  bgColor: string;
  successColor: string;
  warningColor: string;
}

function MiniGradientBar({ progress, bgColor, successColor, warningColor }: MiniGradientBarProps) {
  const [currentColor, setCurrentColor] = React.useState(successColor);

  React.useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setCurrentColor(value < 0.5 ? successColor : warningColor);
    });
    return () => progress.removeListener(listener);
  }, [progress, successColor, warningColor]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[miniStyles.gradientContainer, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          miniStyles.gradientFill,
          { width, backgroundColor: currentColor },
        ]}
      />
    </View>
  );
}

function MiniFilling({ progress, fillColor, bgColor }: MiniBarProps) {
  const height = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <View style={[miniStyles.fillingContainer, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          miniStyles.fillingFill,
          { height, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
  },
  previewContainer: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

const miniStyles = StyleSheet.create({
  thinContainer: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  thinFill: {
    height: 3,
    borderRadius: 1.5,
  },
  thickContainer: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  thickFill: {
    height: 10,
    borderRadius: 5,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradientFill: {
    height: 8,
    borderRadius: 4,
  },
  fillingContainer: {
    width: 32,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fillingFill: {
    width: '100%',
    borderRadius: 6,
  },
});
