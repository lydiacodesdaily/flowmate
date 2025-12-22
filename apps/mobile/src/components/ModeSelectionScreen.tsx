import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModeCard } from './ModeCard';
import type { TimerMode } from '@flowmate/shared';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: TimerMode) => void;
  onViewStats: () => void;
}

export function ModeSelectionScreen({ onSelectMode, onViewStats }: ModeSelectionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 40 }
      ]}
    >
      <Text style={styles.title}>ready when you are</Text>
      <Text style={styles.subtitle}>choose a focus mode</Text>

      <View style={styles.cardsContainer}>
        <ModeCard
          icon="🍅"
          title="Pomodoro"
          description="25-minute focus with short breaks"
          color="#8E8E93"
          onPress={() => onSelectMode('pomodoro')}
        />

        <ModeCard
          icon="🎯"
          title="Guided"
          description="Settle, focus, and wrap periods"
          color="#8E8E93"
          onPress={() => onSelectMode('guided')}
        />

        <ModeCard
          icon="⚙️"
          title="Custom"
          description="Your own duration"
          color="#8E8E93"
          onPress={() => onSelectMode('custom')}
        />

        <ModeCard
          icon="📊"
          title="Stats"
          description="View your progress and streaks"
          color="#8E8E93"
          onPress={onViewStats}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#3A3A3C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#A0A0A0',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  cardsContainer: {
    gap: 16,
  },
});
