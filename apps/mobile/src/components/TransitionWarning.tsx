import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme';
import { useAccessibility } from '../contexts';

interface TransitionWarningProps {
  /** Whether we're in the transition zone (last 60s) */
  isActive: boolean;
  /** Seconds remaining in transition zone */
  secondsRemaining: number;
  /** Session type for contextual messaging */
  sessionType: 'focus' | 'break' | 'settle' | 'wrap' | null;
}

/**
 * TransitionWarning displays a subtle "wrapping up" indicator
 * to help ADHD users prepare for session transitions.
 *
 * Features:
 * - Subtle pulsing animation (respects reduceMotion)
 * - "Wrapping up..." label
 * - Contextual next-session hint
 */
export function TransitionWarning({ isActive, secondsRemaining, sessionType }: TransitionWarningProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();

  // Pulse animation for the indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && !reduceMotion) {
      // Create a gentle pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, reduceMotion, pulseAnim]);

  if (!isActive) return null;

  // Determine what comes next for contextual hint
  const getNextSessionHint = () => {
    if (sessionType === 'focus') return 'Break coming up';
    if (sessionType === 'break') return 'Focus time ahead';
    if (sessionType === 'settle') return 'Focus time ahead';
    if (sessionType === 'wrap') return 'Session ending';
    return '';
  };

  const nextHint = getNextSessionHint();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.transitionAccent,
              opacity: pulseAnim,
            }
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.colors.transitionAccent }]}>
            Wrapping up...
          </Text>
          {nextHint && (
            <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
              {nextHint}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  textContainer: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
});
