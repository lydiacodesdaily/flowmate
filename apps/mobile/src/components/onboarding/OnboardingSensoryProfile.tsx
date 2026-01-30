import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { OnboardingProgressDots } from './OnboardingProgressDots';
import { SensoryPresetCard } from './SensoryPresetCard';
import { SENSORY_PRESETS } from '../../constants/sensoryPresets';
import type { SensoryPresetId } from '../../utils/storage';
import { hapticService } from '../../services/hapticService';

interface OnboardingSensoryProfileProps {
  selectedPreset: SensoryPresetId;
  onPresetChange: (preset: SensoryPresetId) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function OnboardingSensoryProfile({
  selectedPreset,
  onPresetChange,
  onNext,
  onBack,
  onSkip,
}: OnboardingSensoryProfileProps) {
  const { theme } = useTheme();

  // Filter out 'custom' preset for onboarding - keep it simple
  const displayPresets = SENSORY_PRESETS.filter(preset => preset.id !== 'custom');

  const handleNext = () => {
    hapticService.light();
    onNext();
  };

  const handleBack = () => {
    hapticService.selection();
    onBack();
  };

  const handleSkip = () => {
    hapticService.selection();
    onSkip();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          How should FlowMate{'\n'}keep you on track?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Tap to preview each style
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayPresets.map(preset => (
          <SensoryPresetCard
            key={preset.id}
            preset={preset}
            isSelected={selectedPreset === preset.id}
            onSelect={() => onPresetChange(preset.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.footerNote, { color: theme.colors.textTertiary }]}>
          You can change this anytime in Settings
        </Text>

        <OnboardingProgressDots currentStep={2} />

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerNote: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
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
