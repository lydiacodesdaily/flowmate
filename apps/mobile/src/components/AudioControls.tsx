import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import type { AudioSettings } from '@flowmate/shared';
import { audioService } from '../services/audioService';
import { useTheme } from '../theme';

interface AudioControlsProps {
  muteAll: boolean;
  muteDuringBreaks: boolean;
  onToggleMuteAll: () => void;
  onToggleMuteDuringBreaks: () => void;
}

type PresetProfile = 'silent' | 'minimal' | 'balanced' | 'detailed' | 'custom';

interface AudioPreset {
  id: PresetProfile;
  label: string;
  icon: string;
  description: string;
  settings: Partial<AudioSettings>;
}

const PRESETS: AudioPreset[] = [
  {
    id: 'silent',
    label: 'Silent',
    icon: '🔇',
    description: 'No sounds',
    settings: {
      muteAll: true,
      tickSound: 'none',
      tickVolume: 0,
      announcementVolume: 0,
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    icon: '🔉',
    description: 'Announcements only',
    settings: {
      muteAll: false,
      tickSound: 'none',
      tickVolume: 0,
      announcementVolume: 0.7,
      announcementInterval: 5,
      muteDuringBreaks: true,
    },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: '🔊',
    description: 'Gentle ticks + announcements',
    settings: {
      muteAll: false,
      tickSound: 'single',
      tickVolume: 0.3,
      announcementVolume: 0.7,
      announcementInterval: 5,
      muteDuringBreaks: false,
    },
  },
  {
    id: 'detailed',
    label: 'Detailed',
    icon: '📢',
    description: 'Full audio experience',
    settings: {
      muteAll: false,
      tickSound: 'alternating',
      tickVolume: 0.5,
      announcementVolume: 0.8,
      announcementInterval: 1,
      muteDuringBreaks: false,
    },
  },
];

export function AudioControls({
  muteAll,
  muteDuringBreaks,
  onToggleMuteAll,
  onToggleMuteDuringBreaks,
}: AudioControlsProps) {
  const { theme } = useTheme();
  const [showCustom, setShowCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetProfile>('balanced');

  // Get current settings from audio service
  const currentSettings = audioService.getSettings();

  const handlePresetSelect = (preset: AudioPreset) => {
    setSelectedPreset(preset.id);
    setShowCustom(false);
    audioService.updateSettings(preset.settings as AudioSettings);

    // Update parent state
    if (preset.settings.muteAll !== undefined) {
      if (preset.settings.muteAll !== muteAll) {
        onToggleMuteAll();
      }
    }
    if (preset.settings.muteDuringBreaks !== undefined) {
      if (preset.settings.muteDuringBreaks !== muteDuringBreaks) {
        onToggleMuteDuringBreaks();
      }
    }
  };

  const handleCustomize = () => {
    setSelectedPreset('custom');
    setShowCustom(true);
  };

  const updateCustomSetting = <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => {
    audioService.updateSettings({ [key]: value });

    // Update parent state if needed
    if (key === 'muteAll' && value !== muteAll) {
      onToggleMuteAll();
    }
    if (key === 'muteDuringBreaks' && value !== muteDuringBreaks) {
      onToggleMuteDuringBreaks();
    }
  };

  if (showCustom) {
    return (
      <ScrollView style={styles.customContainer}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => setShowCustom(false)}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Presets</Text>
          </TouchableOpacity>
          <Text style={[styles.customTitle, { color: theme.colors.textSecondary }]}>Customize Audio</Text>
        </View>

        {/* Tick Sound */}
        <View style={styles.customSection}>
          <Text style={[styles.customLabel, { color: theme.colors.text }]}>Tick Sound</Text>
          <View style={styles.segmentRow}>
            {(['none', 'single', 'alternating'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.segmentButton,
                  { borderColor: theme.colors.border },
                  currentSettings.tickSound === option && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => updateCustomSetting('tickSound', option)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: theme.colors.text },
                    currentSettings.tickSound === option && styles.segmentTextActive,
                  ]}
                >
                  {option === 'none' ? 'None' : option === 'single' ? 'Single' : 'Alt'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tick Volume */}
        <View style={styles.customSection}>
          <Text style={[styles.customLabel, { color: theme.colors.text }]}>
            Tick Volume
          </Text>
          <View style={styles.volumeControl}>
            <TouchableOpacity
              style={[styles.volumeAdjustButton, { borderColor: theme.colors.border }]}
              onPress={() => updateCustomSetting('tickVolume', Math.max(0, currentSettings.tickVolume - 0.01))}
              disabled={currentSettings.tickVolume <= 0}
            >
              <Text style={[styles.volumeAdjustText, { color: theme.colors.text }]}>−</Text>
            </TouchableOpacity>

            <View style={[styles.volumeDisplay, { borderColor: theme.colors.border }]}>
              <Text style={[styles.volumeDisplayText, { color: theme.colors.text }]}>
                {Math.round(currentSettings.tickVolume * 100)}%
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.volumeAdjustButton, { borderColor: theme.colors.border }]}
              onPress={() => updateCustomSetting('tickVolume', Math.min(1, currentSettings.tickVolume + 0.01))}
              disabled={currentSettings.tickVolume >= 1}
            >
              <Text style={[styles.volumeAdjustText, { color: theme.colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Quick presets */}
          <View style={styles.volumePresets}>
            {[0, 0.25, 0.5, 0.75, 1].map((vol) => (
              <TouchableOpacity
                key={vol}
                style={[
                  styles.presetPill,
                  { borderColor: theme.colors.border },
                  Math.abs(currentSettings.tickVolume - vol) < 0.01 && {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => updateCustomSetting('tickVolume', vol)}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    { color: theme.colors.textSecondary },
                    Math.abs(currentSettings.tickVolume - vol) < 0.01 && { color: theme.colors.primary },
                  ]}
                >
                  {Math.round(vol * 100)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Announcement Volume */}
        <View style={styles.customSection}>
          <Text style={[styles.customLabel, { color: theme.colors.text }]}>
            Announcement Volume
          </Text>
          <View style={styles.volumeControl}>
            <TouchableOpacity
              style={[styles.volumeAdjustButton, { borderColor: theme.colors.border }]}
              onPress={() => updateCustomSetting('announcementVolume', Math.max(0, currentSettings.announcementVolume - 0.01))}
              disabled={currentSettings.announcementVolume <= 0}
            >
              <Text style={[styles.volumeAdjustText, { color: theme.colors.text }]}>−</Text>
            </TouchableOpacity>

            <View style={[styles.volumeDisplay, { borderColor: theme.colors.border }]}>
              <Text style={[styles.volumeDisplayText, { color: theme.colors.text }]}>
                {Math.round(currentSettings.announcementVolume * 100)}%
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.volumeAdjustButton, { borderColor: theme.colors.border }]}
              onPress={() => updateCustomSetting('announcementVolume', Math.min(1, currentSettings.announcementVolume + 0.01))}
              disabled={currentSettings.announcementVolume >= 1}
            >
              <Text style={[styles.volumeAdjustText, { color: theme.colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Quick presets */}
          <View style={styles.volumePresets}>
            {[0, 0.25, 0.5, 0.75, 1].map((vol) => (
              <TouchableOpacity
                key={vol}
                style={[
                  styles.presetPill,
                  { borderColor: theme.colors.border },
                  Math.abs(currentSettings.announcementVolume - vol) < 0.01 && {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => updateCustomSetting('announcementVolume', vol)}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    { color: theme.colors.textSecondary },
                    Math.abs(currentSettings.announcementVolume - vol) < 0.01 && { color: theme.colors.primary },
                  ]}
                >
                  {Math.round(vol * 100)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Announcement Interval */}
        <View style={styles.customSection}>
          <Text style={[styles.customLabel, { color: theme.colors.text }]}>
            Interval: Every {currentSettings.announcementInterval} min
          </Text>
          <View style={styles.segmentRow}>
            {[1, 2, 3, 5, 10].map((interval) => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.segmentButton,
                  { borderColor: theme.colors.border },
                  currentSettings.announcementInterval === interval && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => updateCustomSetting('announcementInterval', interval as 1 | 2 | 3 | 5 | 10)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: theme.colors.text },
                    currentSettings.announcementInterval === interval && styles.segmentTextActive,
                  ]}
                >
                  {interval}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mute During Breaks */}
        <View style={styles.customSection}>
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
            <Text style={styles.toggleIcon}>{muteDuringBreaks ? '☕' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Audio Profile</Text>

      <View style={styles.presetsGrid}>
        {PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
              selectedPreset === preset.id && {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
            onPress={() => handlePresetSelect(preset)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetIcon}>{preset.icon}</Text>
            <Text
              style={[
                styles.presetLabel,
                { color: theme.colors.text },
                selectedPreset === preset.id && { color: theme.colors.primary, fontWeight: '600' },
              ]}
            >
              {preset.label}
            </Text>
            <Text
              style={[
                styles.presetDescription,
                { color: theme.colors.textTertiary },
              ]}
            >
              {preset.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.customizeButton,
          { borderColor: theme.colors.border },
          selectedPreset === 'custom' && {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryLight,
          },
        ]}
        onPress={handleCustomize}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.customizeButtonText,
            { color: theme.colors.textSecondary },
            selectedPreset === 'custom' && { color: theme.colors.primary, fontWeight: '600' },
          ]}
        >
          ⚙️ Customize
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  presetCard: {
    width: '47%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  presetIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  presetDescription: {
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  customizeButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  customizeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  customContainer: {
    maxHeight: 480,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    gap: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  customSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  volumeAdjustButton: {
    borderWidth: 2,
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeAdjustText: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  volumeDisplay: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  volumePresets: {
    flexDirection: 'row',
    gap: 6,
  },
  presetPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleIcon: {
    fontSize: 20,
  },
});
