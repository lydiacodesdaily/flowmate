import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session } from '@flowmate/shared';
import type { CustomSelectionScreenProps } from '../navigation/types';

const QUICK_PRESETS = [
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
];

export function CustomTimerSelectionScreen({ navigation }: CustomSelectionScreenProps) {
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>your own pace</Text>
        <Text style={styles.subtitle}>set any duration you need</Text>

        <View style={styles.inputSection}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="minutes"
            placeholderTextColor="#C7C7CC"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleCustomSubmit}
            autoFocus={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleCustomSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>begin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>or choose a preset</Text>

        <View style={styles.presetButtons}>
          {QUICK_PRESETS.map(({ minutes, label }) => (
            <TouchableOpacity
              key={minutes}
              style={styles.presetButton}
              onPress={() => handlePresetSelect(minutes)}
              activeOpacity={0.85}
            >
              <Text style={styles.presetButtonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>
          Voice announcements begin at 25 minutes
        </Text>
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
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  inputSection: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EBEBF0',
    borderRadius: 16,
    padding: 20,
    fontSize: 52,
    fontWeight: '200',
    color: '#3A3A3C',
    textAlign: 'center',
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#D1A5A5',
  },
  errorText: {
    color: '#A08080',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '300',
  },
  startButton: {
    backgroundColor: '#6C7A89',
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
    color: '#C7C7CC',
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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#3A3A3C',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 13,
    fontWeight: '300',
    color: '#A0A0A0',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
