import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';
import type { SettingsScreenProps } from '../navigation/types';
import { notificationService } from '../services/notificationService';
import type { NotificationSettings } from '../utils/storage';
import {
  useAccessibility,
  useTimerDisplaySettings,
  useTimerVisual,
  useCelebrationSettings,
  useReviewPrompt,
} from '../contexts';
import { TIMER_VISUAL_PRESETS } from '../constants/timerVisuals';
import { hapticService } from '../services/hapticService';
import { useResponsive } from '../hooks/useResponsive';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { contentStyle } = useResponsive();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    sessionComplete: true,
    sessionStart: true,
    timeRemaining: false,
    sound: true,
  });
  const { confettiEnabled, setConfettiEnabled } = useCelebrationSettings();
  const { reduceMotion, hapticsEnabled, skipFocusPrompt, setReduceMotion, setHapticsEnabled, setSkipFocusPrompt } = useAccessibility();
  const { showElapsedTime, setShowElapsedTime } = useTimerDisplaySettings();
  const { selectedStyle: selectedVisual, selectStyle: selectVisual, isLoading: visualLoading } = useTimerVisual();
  const { forceShowPrompt, getDebugInfo, resetSettings: resetReviewSettings } = useReviewPrompt();
  // Review prompt debug state (development only)
  const [reviewDebugInfo, setReviewDebugInfo] = useState<{
    eligible: boolean;
    reasons: string[];
    settings: {
      firstLaunchTimestamp: number | null;
      completedFocusSessions: number;
      lastPromptedVersion: string | null;
      lastDismissedTimestamp: number | null;
    };
  } | null>(null);

  const refreshReviewDebugInfo = async () => {
    const info = await getDebugInfo();
    setReviewDebugInfo(info);
  };

  const handleVisualSelect = async (visualId: typeof selectedVisual) => {
    await hapticService.selection();
    await selectVisual(visualId);
  };

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = () => {
    const settings = notificationService.getSettings();
    setNotificationSettings(settings);
  };

  const updateNotificationSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    await notificationService.updateSettings({ [key]: value });
  };

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
          <Text allowFontScaling={false} style={[styles.headerButtonText, { color: theme.colors.textTertiary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
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
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Timer Visual</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textTertiary }]}>
          Choose how the timer progress is displayed
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScroll}
        >
          {TIMER_VISUAL_PRESETS.map((preset) => {
            const isSelected = selectedVisual === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => handleVisualSelect(preset.id)}
                activeOpacity={0.7}
                disabled={visualLoading}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <Text
                  style={[
                    styles.presetName,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.presetDescription, { color: theme.colors.textSecondary }]}>
          {TIMER_VISUAL_PRESETS.find(p => p.id === selectedVisual)?.description}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Enable Notifications</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Allow FlowMate to send notifications
            </Text>
          </View>
          <Switch
            value={notificationSettings.enabled}
            onValueChange={(value) => updateNotificationSetting('enabled', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.settingRow, { opacity: notificationSettings.enabled ? 1 : 0.4 }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Session Complete</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Notify when a session ends
            </Text>
          </View>
          <Switch
            value={notificationSettings.sessionComplete}
            onValueChange={(value) => updateNotificationSetting('sessionComplete', value)}
            disabled={!notificationSettings.enabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.settingRow, { opacity: notificationSettings.enabled ? 1 : 0.4 }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Session Start</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Notify when a session begins
            </Text>
          </View>
          <Switch
            value={notificationSettings.sessionStart}
            onValueChange={(value) => updateNotificationSetting('sessionStart', value)}
            disabled={!notificationSettings.enabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.settingRow, { opacity: notificationSettings.enabled ? 1 : 0.4 }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Time Remaining</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Periodic time check notifications
            </Text>
          </View>
          <Switch
            value={notificationSettings.timeRemaining}
            onValueChange={(value) => updateNotificationSetting('timeRemaining', value)}
            disabled={!notificationSettings.enabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.settingRow, { opacity: notificationSettings.enabled ? 1 : 0.4 }]}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notification Sound</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Play sound with notifications
            </Text>
          </View>
          <Switch
            value={notificationSettings.sound}
            onValueChange={(value) => updateNotificationSetting('sound', value)}
            disabled={!notificationSettings.enabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Celebration</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Confetti</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Show confetti when you complete a focus session
            </Text>
          </View>
          <Switch
            value={confettiEnabled}
            onValueChange={setConfettiEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Focus</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Focus Prompt</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Set an intention and break it into steps before each session
            </Text>
          </View>
          <Switch
            value={!skipFocusPrompt}
            onValueChange={(value) => setSkipFocusPrompt(!value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Accessibility</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Reduce Motion</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Disable confetti and modal animations
            </Text>
          </View>
          <Switch
            value={reduceMotion}
            onValueChange={setReduceMotion}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Haptic Feedback</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Vibration feedback on interactions
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Show Elapsed Time</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
              Show time worked instead of time remaining
            </Text>
          </View>
          <Switch
            value={showElapsedTime}
            onValueChange={setShowElapsedTime}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Version</Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>1.0.0</Text>
        </View>
      </View>

      {/* Feedback Card */}
      <View style={[styles.feedbackCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>
          Got thoughts?
        </Text>
        <Text style={[styles.feedbackDescription, { color: theme.colors.textSecondary }]}>
          Ideas, bugs, or anything on your mind — we'd love to hear it.
        </Text>
        <TouchableOpacity
          style={[styles.feedbackButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => Linking.openURL('https://tally.so/r/Y50Qb5')}
          activeOpacity={0.85}
        >
          <Text style={styles.feedbackButtonText}>Share Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Development Debug Section - Only visible in dev builds */}
      {__DEV__ && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface, marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>Developer Tools</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textTertiary }]}>
            These options are only visible in development builds.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Review Prompt Debug</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
                Test the in app review flow
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={refreshReviewDebugInfo}
            >
              <Text style={[styles.debugButtonText, { color: theme.colors.primary }]}>Check</Text>
            </TouchableOpacity>
          </View>

          {reviewDebugInfo && (
            <View style={[styles.debugInfoCard, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Text style={[styles.debugInfoTitle, { color: theme.colors.text }]}>
                Eligible: {reviewDebugInfo.eligible ? '✓ Yes' : '✗ No'}
              </Text>
              <Text style={[styles.debugInfoText, { color: theme.colors.textSecondary }]}>
                Sessions: {reviewDebugInfo.settings.completedFocusSessions}
              </Text>
              <Text style={[styles.debugInfoText, { color: theme.colors.textSecondary }]}>
                First launch: {reviewDebugInfo.settings.firstLaunchTimestamp
                  ? new Date(reviewDebugInfo.settings.firstLaunchTimestamp).toLocaleDateString()
                  : 'Not set'}
              </Text>
              <Text style={[styles.debugInfoText, { color: theme.colors.textSecondary }]}>
                Last prompted: {reviewDebugInfo.settings.lastPromptedVersion || 'Never'}
              </Text>
              {reviewDebugInfo.reasons.length > 0 && (
                <View style={styles.debugReasons}>
                  <Text style={[styles.debugInfoText, { color: theme.colors.warning }]}>
                    Blocking reasons:
                  </Text>
                  {reviewDebugInfo.reasons.map((reason, i) => (
                    <Text key={i} style={[styles.debugInfoText, { color: theme.colors.textTertiary }]}>
                      • {reason}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.debugButtonRow}>
            <TouchableOpacity
              style={[styles.debugActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={forceShowPrompt}
            >
              <Text style={styles.debugActionButtonText}>Show Prompt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.debugActionButton, { backgroundColor: theme.colors.error }]}
              onPress={async () => {
                await resetReviewSettings();
                await refreshReviewDebugInfo();
              }}
            >
              <Text style={styles.debugActionButtonText}>Reset Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
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
  sectionDescription: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 18,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  horizontalScrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  presetCard: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  presetDescription: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  feedbackCard: {
    marginTop: 32,
    marginBottom: 40,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  debugButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugInfoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
  },
  debugInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugInfoText: {
    fontSize: 13,
    marginBottom: 4,
  },
  debugReasons: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  debugButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  debugActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  debugActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
