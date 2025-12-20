import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudioSettings } from '@flowmate/shared';
import { audioService } from '../services/audioService';

const SETTINGS_STORAGE_KEY = '@flowmate:settings';

const defaultSettings: AudioSettings = {
  tickVolume: 0.5,
  announcementVolume: 0.7,
  tickSound: 'single',
  muteAll: false,
  muteDuringBreaks: false,
  announcementInterval: 5,
};

export function SettingsScreen() {
  const [settings, setSettings] = useState<AudioSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        const loaded = JSON.parse(data);
        setSettings(loaded);
        audioService.updateSettings(loaded);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: AudioSettings) => {
    try {
      setSettings(newSettings);
      audioService.updateSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateSetting = <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => {
    saveSettings({ ...settings, [key]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mute All</Text>
          <Switch
            value={settings.muteAll}
            onValueChange={(value) => updateSetting('muteAll', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mute During Breaks</Text>
          <Switch
            value={settings.muteDuringBreaks}
            onValueChange={(value) => updateSetting('muteDuringBreaks', value)}
            disabled={settings.muteAll}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Tick Sound</Text>
            <Text style={styles.settingValue}>{settings.tickSound}</Text>
          </View>
          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[
                styles.segment,
                settings.tickSound === 'single' && styles.segmentActive,
              ]}
              onPress={() => updateSetting('tickSound', 'single')}
              disabled={settings.muteAll}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.tickSound === 'single' && styles.segmentTextActive,
                ]}
              >
                Single
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                settings.tickSound === 'alternating' && styles.segmentActive,
              ]}
              onPress={() => updateSetting('tickSound', 'alternating')}
              disabled={settings.muteAll}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.tickSound === 'alternating' && styles.segmentTextActive,
                ]}
              >
                Alternating
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Tick Volume</Text>
            <Text style={styles.settingValue}>{Math.round(settings.tickVolume * 100)}%</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Announcement Volume</Text>
            <Text style={styles.settingValue}>
              {Math.round(settings.announcementVolume * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Announcement Interval</Text>
            <Text style={styles.settingValue}>
              Every {settings.announcementInterval} {settings.announcementInterval === 1 ? 'minute' : 'minutes'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E94B3C',
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  segmentActive: {
    backgroundColor: '#E94B3C',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94B3C',
  },
  segmentTextActive: {
    color: '#fff',
  },
});
