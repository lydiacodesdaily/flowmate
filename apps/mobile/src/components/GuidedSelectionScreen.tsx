import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Guided Deep Work</Text>
        <Text style={styles.subtitle}>Structured sessions for focused work</Text>

        <View style={styles.styleSelector}>
          <TouchableOpacity
            style={[styles.styleButton, style === 'pom' && styles.styleButtonActive]}
            onPress={() => setStyle('pom')}
          >
            <Text style={[styles.styleButtonText, style === 'pom' && styles.styleButtonTextActive]}>
              Pomodoro Style
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.styleButton, style === 'deep' && styles.styleButtonActive]}
            onPress={() => setStyle('deep')}
          >
            <Text style={[styles.styleButtonText, style === 'deep' && styles.styleButtonTextActive]}>
              Deep Focus
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {GUIDED_OPTIONS[style].map(({ type, title, description }) => (
          <TouchableOpacity
            key={type}
            style={styles.optionCard}
            onPress={() => onSelectConfig(type, GUIDED_CONFIGS[type])}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>{title}</Text>
              <Text style={styles.optionDuration}>
                {GUIDED_CONFIGS[type].reduce((sum, s) => sum + s.durationMinutes, 0)} min
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  styleSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: '#3498db',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  styleButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  optionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sessionsPreview: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sessionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  settleDot: {
    backgroundColor: '#95a5a6',
  },
  focusDot: {
    backgroundColor: '#3498db',
  },
  breakDot: {
    backgroundColor: '#27ae60',
  },
  wrapDot: {
    backgroundColor: '#f39c12',
  },
});
