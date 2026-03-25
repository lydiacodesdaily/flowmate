import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import type { AudioSettings } from '@flowmate/shared';
import { audioService } from '../services/audioService';
import { useTheme } from '../theme';
import { useSensoryPresets } from '../hooks/useSensoryPresets';
import { SENSORY_PRESETS } from '../constants/sensoryPresets';
import { hapticService } from '../services/hapticService';
interface AudioControlsProps {
  muteDuringBreaks: boolean;
  onToggleMuteDuringBreaks: () => void;
}

// Volume presets with intuitive labels
const VOLUME_PRESETS = [
  { label: 'Off', value: 0 },
  { label: 'Low', value: 0.25 },
  { label: 'Med', value: 0.5 },
  { label: 'High', value: 0.75 },
  { label: 'Full', value: 1 },
] as const;

// Find the closest preset for a given volume value
const getClosestPreset = (volume: number): number => {
  let closest: number = VOLUME_PRESETS[0].value;
  let minDiff = Math.abs(volume - closest);

  for (const preset of VOLUME_PRESETS) {
    const diff = Math.abs(volume - preset.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = preset.value;
    }
  }
  return closest;
};

export function AudioControls({
  muteDuringBreaks,
  onToggleMuteDuringBreaks,
}: AudioControlsProps) {
  const { theme } = useTheme();
  const [currentSettings, setCurrentSettings] = useState<AudioSettings>(audioService.getSettings());
  const { selectedPreset, selectPreset, customConfig, updateCustomConfig, isLoading: presetLoading } = useSensoryPresets();

  useEffect(() => {
    setCurrentSettings(audioService.getSettings());
  }, []);

  const handlePresetSelect = async (presetId: typeof selectedPreset) => {
    await hapticService.selection();
    await selectPreset(presetId);
    // Refresh local settings state after preset applies
    setCurrentSettings(audioService.getSettings());
  };

  const updateSetting = async <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => {
    audioService.updateSettings({ [key]: value });
    setCurrentSettings(audioService.getSettings());
    // Switch to Custom when user edits any setting manually
    if (selectedPreset !== 'custom') {
      const newCustomConfig = { ...customConfig, [key]: value };
      await updateCustomConfig(newCustomConfig);
      await selectPreset('custom', newCustomConfig);
    }
  };

  const tickVolume = getClosestPreset(currentSettings.tickVolume);
  const announcementVolume = getClosestPreset(currentSettings.announcementVolume);

  // Filter out 'custom' preset for cleaner UI - users customize via controls below
  const displayPresets = SENSORY_PRESETS.filter(p => p.id !== 'custom');

  return (
    <View style={styles.container}>
      {/* Sensory Presets */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Preset
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScrollContent}
          style={styles.presetScroll}
        >
          {displayPresets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  { borderColor: theme.colors.border },
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handlePresetSelect(preset.id)}
                activeOpacity={0.7}
                disabled={presetLoading}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <Text
                  style={[
                    styles.presetName,
                    { color: theme.colors.text },
                    isSelected && { color: '#FFFFFF' },
                  ]}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={[styles.presetDescription, { color: theme.colors.textTertiary }]}>
          {SENSORY_PRESETS.find(p => p.id === selectedPreset)?.description}
        </Text>
      </View>

      {/* Tick Sound Type */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Tick Sound
        </Text>
        <View style={styles.buttonRow}>
          {(['alternating', 'classic', 'beep'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.button,
                { borderColor: theme.colors.border },
                currentSettings.tickSound === option && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => updateSetting('tickSound', option)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.text },
                  currentSettings.tickSound === option && styles.buttonTextActive,
                ]}
              >
                {option === 'alternating' ? 'Alt' : option === 'classic' ? 'Classic' : 'Beep'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tick Volume */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Tick Volume
        </Text>
        <View style={styles.buttonRow}>
          {VOLUME_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.volumeButton,
                { borderColor: theme.colors.border },
                tickVolume === preset.value && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => updateSetting('tickVolume', preset.value)}
            >
              <Text
                style={[
                  styles.volumeButtonText,
                  { color: theme.colors.text },
                  tickVolume === preset.value && styles.buttonTextActive,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Voice Volume */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Voice Volume
        </Text>
        <View style={styles.buttonRow}>
          {VOLUME_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.volumeButton,
                { borderColor: theme.colors.border },
                announcementVolume === preset.value && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => updateSetting('announcementVolume', preset.value)}
            >
              <Text
                style={[
                  styles.volumeButtonText,
                  { color: theme.colors.text },
                  announcementVolume === preset.value && styles.buttonTextActive,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Voice Interval */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Voice Every
        </Text>
        <View style={styles.buttonRow}>
          {([1, 5, 10] as const).map((interval) => (
            <TouchableOpacity
              key={interval}
              style={[
                styles.button,
                { borderColor: theme.colors.border },
                currentSettings.announcementInterval === interval && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => updateSetting('announcementInterval', interval)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.text },
                  currentSettings.announcementInterval === interval && styles.buttonTextActive,
                ]}
              >
                {interval}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Toggles */}
      <View style={styles.toggleSection}>
        <TouchableOpacity
          style={[
            styles.toggleRow,
            { borderColor: theme.colors.border },
            currentSettings.secondsCountdown && {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => updateSetting('secondsCountdown', !currentSettings.secondsCountdown)}
        >
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Countdown (last 60s)
          </Text>
          <Text style={styles.toggleIcon}>{currentSettings.secondsCountdown ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleRow,
            { borderColor: theme.colors.border },
            muteDuringBreaks && {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={onToggleMuteDuringBreaks}
        >
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Mute During Breaks
          </Text>
          <Text style={styles.toggleIcon}>{muteDuringBreaks ? '✓' : ''}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  toggleSection: {
    gap: 10,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  volumeButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  presetScroll: {
    flexGrow: 0,
    marginHorizontal: -4,
  },
  presetScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  presetCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 70,
  },
  presetIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  presetName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
