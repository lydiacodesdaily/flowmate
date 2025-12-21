import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModeCard } from './ModeCard';
import type { TimerMode } from '@flowmate/shared';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: TimerMode) => void;
}

export function ModeSelectionScreen({ onSelectMode }: ModeSelectionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 20 }
      ]}
    >
      <Text style={styles.title}>Choose Your Focus Mode</Text>
      <Text style={styles.subtitle}>Select a timer mode to begin your session</Text>

      <View style={styles.cardsContainer}>
        <ModeCard
          icon="🍅"
          title="Pomodoro"
          description="Classic 25-minute focus sessions with short breaks"
          color="#e74c3c"
          onPress={() => onSelectMode('pomodoro')}
        />

        <ModeCard
          icon="🎯"
          title="Guided Deep Work"
          description="Structured sessions with settle, focus, and wrap periods"
          color="#3498db"
          onPress={() => onSelectMode('guided')}
        />

        <ModeCard
          icon="⚙️"
          title="Custom Timer"
          description="Build your own session with custom durations"
          color="#9b59b6"
          onPress={() => onSelectMode('custom')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  cardsContainer: {
    marginTop: 8,
  },
});
