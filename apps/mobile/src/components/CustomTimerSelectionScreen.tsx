import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session } from '@flowmate/shared';

interface CustomTimerSelectionScreenProps {
  onSelectConfig: (sessions: Session[]) => void;
  onBack: () => void;
}

const QUICK_PRESETS = [
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
];

export function CustomTimerSelectionScreen({ onSelectConfig, onBack }: CustomTimerSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const createCustomSession = (minutes: number): Session[] => {
    return [{ type: 'focus', durationMinutes: minutes }];
  };

  const handlePresetSelect = (minutes: number) => {
    const sessions = createCustomSession(minutes);
    onSelectConfig(sessions);
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
    onSelectConfig(sessions);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Custom Timer</Text>
        <Text style={styles.subtitle}>Set your own duration</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter minutes</Text>
          <Text style={styles.inputHint}>e.g., 15, 45, 120</Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Enter duration"
            placeholderTextColor="#999"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleCustomSubmit}
            autoFocus={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.announcementInfo}>
            Voice announcements begin at 25 minutes
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleCustomSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>Quick presets:</Text>
          <View style={styles.presetButtons}>
            {QUICK_PRESETS.map(({ minutes, label }) => (
              <TouchableOpacity
                key={minutes}
                style={styles.presetButton}
                onPress={() => handlePresetSelect(minutes)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#e74c3c',
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  announcementInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  presetsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  presetButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
