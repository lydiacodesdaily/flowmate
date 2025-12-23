import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModeCard } from './ModeCard';
import { useTheme } from '../theme';
import type { ModeSelectionScreenProps } from '../navigation/types';

export function ModeSelectionScreen({ navigation }: ModeSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 40 }
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>ready when you are</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>choose a focus mode</Text>

      <View style={styles.cardsContainer}>
        <ModeCard
          icon="🍅"
          title="Pomodoro"
          description="25-minute focus with short breaks"
          color="#8E8E93"
          onPress={() => navigation.navigate('PomodoroSelection')}
        />

        <ModeCard
          icon="🎯"
          title="Guided"
          description="Settle, focus, and wrap periods"
          color="#8E8E93"
          onPress={() => navigation.navigate('GuidedSelection')}
        />

        <ModeCard
          icon="⚙️"
          title="Custom"
          description="Your own duration"
          color="#8E8E93"
          onPress={() => navigation.navigate('CustomSelection')}
        />

        <ModeCard
          icon="📊"
          title="Stats"
          description="View your progress and streaks"
          color="#8E8E93"
          onPress={() => navigation.navigate('Stats')}
        />

        <ModeCard
          icon="🎨"
          title="Settings"
          description="Appearance and audio preferences"
          color="#8E8E93"
          onPress={() => navigation.navigate('Settings')}
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
    padding: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  cardsContainer: {
    gap: 16,
  },
});
