import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';
import type { SettingsScreenProps } from '../navigation/types';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setThemeMode } = useTheme();

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.surfaceSecondary }]}>
      {/* Header with back button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Theme</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              {getThemeLabel(themeMode)}
            </Text>
          </View>
          <View style={[styles.segmentControl, { borderColor: theme.colors.primary }]}>
            <TouchableOpacity
              style={[
                styles.segment,
                { backgroundColor: theme.colors.surface },
                themeMode === 'light' && [styles.segmentActive, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: theme.colors.primary },
                  themeMode === 'light' && styles.segmentTextActive,
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                { backgroundColor: theme.colors.surface },
                themeMode === 'dark' && [styles.segmentActive, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: theme.colors.primary },
                  themeMode === 'dark' && styles.segmentTextActive,
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                { backgroundColor: theme.colors.surface },
                themeMode === 'system' && [styles.segmentActive, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setThemeMode('system')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: theme.colors.primary },
                  themeMode === 'system' && styles.segmentTextActive,
                ]}
              >
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Audio</Text>

        <View style={styles.infoCard}>
          <Text style={[styles.infoIcon]}>🎵</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Audio settings have moved to the timer screen.{'\n'}
            Tap the ⋯ menu while running a timer to adjust.
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Version</Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>1.0.0</Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerButton: {
    padding: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginTop: 4,
  },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentActive: {},
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
