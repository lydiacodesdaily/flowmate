import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session } from '@flowmate/shared';
import type { CustomSelectionScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

const QUICK_PRESETS = [
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
];

export function CustomTimerSelectionScreen({ navigation }: CustomSelectionScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const createCustomSession = (minutes: number): Session[] => {
    return [{ type: 'focus', durationMinutes: minutes }];
  };

  const handlePresetSelect = (minutes: number) => {
    const sessions = createCustomSession(minutes);
    navigation.navigate('ActiveTimer', { sessions });
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(inputValue, 10);

    if (!inputValue.trim()) {
      setError('Please enter a duration');
      return;
    }

    if (isNaN(minutes) || minutes <= 0) {
      setError('Please enter a valid number');
      return;
    }

    if (minutes > 300) {
      setError('Maximum duration is 300 minutes');
      return;
    }

    Keyboard.dismiss();
    const sessions = createCustomSession(minutes);
    navigation.navigate('ActiveTimer', { sessions });
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>your own pace</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>set any duration you need</Text>

        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: error ? '#D1A5A5' : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="minutes"
            placeholderTextColor={theme.colors.border}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleCustomSubmit}
            autoFocus={false}
          />

          {error ? <Text style={[styles.errorText, { color: '#A08080' }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCustomSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>begin</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.orText, { color: theme.colors.border }]}>or choose a preset</Text>

        <View style={styles.presetButtons}>
          {QUICK_PRESETS.map(({ minutes, label }) => (
            <TouchableOpacity
              key={minutes}
              style={[styles.presetButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => handlePresetSelect(minutes)}
              activeOpacity={0.85}
            >
              <Text style={[styles.presetButtonText, { color: theme.colors.text }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
          Voice announcements begin at 25 minutes
        </Text>
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
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  inputSection: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 52,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '300',
  },
  startButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  orText: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
