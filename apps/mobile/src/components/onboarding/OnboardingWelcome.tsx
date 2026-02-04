import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { OnboardingProgressDots } from './OnboardingProgressDots';
import { hapticService } from '../../services/hapticService';

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingWelcome({ onNext, onSkip }: OnboardingWelcomeProps) {
  const { theme } = useTheme();
  const { contentStyle } = useResponsive();

  const handleNext = () => {
    hapticService.light();
    onNext();
  };

  const handleSkip = () => {
    hapticService.selection();
    onSkip();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, contentStyle]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🧠</Text>
          <Text style={styles.timerIcon}>⏱️</Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>FlowMate</Text>
        <Text style={[styles.subtitle, { color: theme.colors.primary }]}>Your focus, your way</Text>

        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Timers designed for how your brain works.{'\n'}
          Let's personalize it.
        </Text>
      </View>

      <View style={[styles.footer, contentStyle]}>
        <OnboardingProgressDots currentStep={1} />

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Let's Go</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  timerIcon: {
    fontSize: 48,
    marginLeft: -8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
