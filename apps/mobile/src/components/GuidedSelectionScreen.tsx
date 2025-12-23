import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GuidedType } from '@flowmate/shared';
import { GUIDED_CONFIGS } from '@flowmate/shared';
import type { GuidedSelectionScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

type GuidedStyle = 'pom' | 'deep';

const GUIDED_OPTIONS: Record<GuidedStyle, Array<{ type: GuidedType; title: string; description: string }>> = {
  pom: [
    { type: 'guided-30-pom', title: '30 Minutes', description: 'Settle, focus 25, wrap' },
    { type: 'guided-60-pom', title: '60 Minutes', description: '2 pomodoros with break' },
    { type: 'guided-90-pom', title: '90 Minutes', description: '3 pomodoros with breaks' },
    { type: 'guided-120-pom', title: '2 Hours', description: '4 pomodoros with breaks & wrap' },
    { type: 'guided-180-pom', title: '3 Hours', description: '6 pomodoros with breaks & wrap' },
  ],
  deep: [
    { type: 'guided-30-deep', title: '30 Minutes', description: 'Settle, focus 25, wrap' },
    { type: 'guided-60-deep', title: '60 Minutes', description: 'Settle, focus 50, wrap' },
    { type: 'guided-90-deep', title: '90 Minutes', description: 'Settle, focus 80, wrap' },
    { type: 'guided-120-deep', title: '2 Hours', description: '2 long focus blocks with break' },
    { type: 'guided-180-deep', title: '3 Hours', description: '2 deep blocks (85+80 min)' },
  ],
};

export function GuidedSelectionScreen({ navigation }: GuidedSelectionScreenProps) {
  const { theme } = useTheme();
  const [style, setStyle] = useState<GuidedStyle>('pom');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>guided</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>structured focus sessions</Text>

        <View style={[styles.styleSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.styleButton, style === 'pom' && { backgroundColor: theme.colors.background }]}
            onPress={() => setStyle('pom')}
            activeOpacity={0.85}
          >
            <Text style={[styles.styleButtonText, { color: style === 'pom' ? theme.colors.text : theme.colors.textSecondary }]}>
              Pomodoro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.styleButton, style === 'deep' && { backgroundColor: theme.colors.background }]}
            onPress={() => setStyle('deep')}
            activeOpacity={0.85}
          >
            <Text style={[styles.styleButtonText, { color: style === 'deep' ? theme.colors.text : theme.colors.textSecondary }]}>
              Deep
            </Text>
          </TouchableOpacity>
        </View>

        {GUIDED_OPTIONS[style].map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('ActiveTimer', { sessions: GUIDED_CONFIGS[type] })}
            activeOpacity={0.85}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.optionDuration, { color: theme.colors.textSecondary }]}>
                {GUIDED_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)}m
              </Text>
            </View>
            <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
            <View style={styles.sessionsPreview}>
              {GUIDED_CONFIGS[type].map((session, idx) => {
                let dotColor = theme.colors.textTertiary;
                if (session.type === 'settle') dotColor = theme.colors.textSecondary;
                if (session.type === 'focus') dotColor = theme.colors.textTertiary;
                if (session.type === 'break') dotColor = theme.colors.border;
                if (session.type === 'wrap') dotColor = theme.colors.textSecondary;

                return (
                  <View
                    key={idx}
                    style={[styles.sessionDot, { backgroundColor: dotColor }]}
                  />
                );
              })}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 12,
    minWidth: 44,
  },
  backText: {
    fontSize: 24,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 16,
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
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  styleSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 24,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  optionDuration: {
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  sessionsPreview: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
