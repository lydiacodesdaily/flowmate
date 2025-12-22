import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GuidedType, Session } from '@flowmate/shared';
import { GUIDED_CONFIGS } from '@flowmate/shared';

interface GuidedSelectionScreenProps {
  onSelectConfig: (type: GuidedType, sessions: Session[]) => void;
  onBack: () => void;
}

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

export function GuidedSelectionScreen({ onSelectConfig, onBack }: GuidedSelectionScreenProps) {
  const [style, setStyle] = useState<GuidedStyle>('pom');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>guided</Text>
        <Text style={styles.subtitle}>structured focus sessions</Text>

        <View style={styles.styleSelector}>
          <TouchableOpacity
            style={[styles.styleButton, style === 'pom' && styles.styleButtonActive]}
            onPress={() => setStyle('pom')}
            activeOpacity={0.85}
          >
            <Text style={[styles.styleButtonText, style === 'pom' && styles.styleButtonTextActive]}>
              Pomodoro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.styleButton, style === 'deep' && styles.styleButtonActive]}
            onPress={() => setStyle('deep')}
            activeOpacity={0.85}
          >
            <Text style={[styles.styleButtonText, style === 'deep' && styles.styleButtonTextActive]}>
              Deep
            </Text>
          </TouchableOpacity>
        </View>

        {GUIDED_OPTIONS[style].map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={styles.optionCard}
            onPress={() => onSelectConfig(type, GUIDED_CONFIGS[type])}
            activeOpacity={0.85}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>{title}</Text>
              <Text style={styles.optionDuration}>
                {GUIDED_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)}m
              </Text>
            </View>
            <Text style={styles.optionDescription}>{description}</Text>
            <View style={styles.sessionsPreview}>
              {GUIDED_CONFIGS[type].map((session, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.sessionDot,
                    session.type === 'settle' && styles.settleDot,
                    session.type === 'focus' && styles.focusDot,
                    session.type === 'break' && styles.breakDot,
                    session.type === 'wrap' && styles.wrapDot,
                  ]}
                />
              ))}
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
    backgroundColor: '#FAFAFA',
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
    color: '#8E8E93',
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
    color: '#3A3A3C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#A0A0A0',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  styleSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    padding: 4,
    marginBottom: 24,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: '#F2F2F7',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
  styleButtonTextActive: {
    color: '#3A3A3C',
    fontWeight: '400',
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
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
    color: '#3A3A3C',
    letterSpacing: 0.2,
  },
  optionDuration: {
    fontSize: 15,
    fontWeight: '300',
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '300',
    color: '#8E8E93',
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
  settleDot: {
    backgroundColor: '#B0B0B0',
  },
  focusDot: {
    backgroundColor: '#A0A0A0',
  },
  breakDot: {
    backgroundColor: '#C7C7CC',
  },
  wrapDot: {
    backgroundColor: '#ABABAB',
  },
});
