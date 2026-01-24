import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStats, getEmptyStats, STATS_STORAGE_KEY } from '@flowmate/shared';

/**
 * Platform adapter for stats storage using AsyncStorage (React Native)
 * Mirrors the localStorage API used in the web app
 */

export const loadStats = async (): Promise<UserStats> => {
  try {
    const stored = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) return getEmptyStats();

    const stats = JSON.parse(stored) as UserStats;
    return stats;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return getEmptyStats();
  }
};

export const saveStats = async (stats: UserStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
};

/**
 * Notification preferences storage
 */

export interface NotificationSettings {
  enabled: boolean;
  sessionComplete: boolean;
  sessionStart: boolean;
  timeRemaining: boolean;
  sound: boolean;
}

const NOTIFICATION_SETTINGS_KEY = '@flowmate:notification-settings';

export const getDefaultNotificationSettings = (): NotificationSettings => ({
  enabled: true,
  sessionComplete: true,
  sessionStart: true,
  timeRemaining: false,
  sound: true,
});

export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!stored) return getDefaultNotificationSettings();

    const settings = JSON.parse(stored) as NotificationSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load notification settings:', error);
    return getDefaultNotificationSettings();
  }
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
};

/**
 * Audio settings storage
 */

export interface AudioSettingsStorage {
  tickVolume: number;
  announcementVolume: number;
  tickSound: 'alternating' | 'classic' | 'beep';
  muteAll: boolean;
  muteDuringBreaks: boolean;
  announcementInterval: 1 | 5 | 10;
  secondsCountdown: boolean;
  /** @deprecated Presets have been removed - this field is kept for backwards compatibility */
  selectedProfile?: 'silent' | 'minimal' | 'balanced' | 'detailed' | 'custom';
}

const AUDIO_SETTINGS_KEY = '@flowmate:audio-settings';

export const getDefaultAudioSettings = (): AudioSettingsStorage => ({
  tickVolume: 0.5,
  announcementVolume: 0.7,
  tickSound: 'alternating',
  muteAll: false,
  muteDuringBreaks: false,
  announcementInterval: 1,
  secondsCountdown: true,
});

export const loadAudioSettings = async (): Promise<AudioSettingsStorage> => {
  try {
    const stored = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!stored) return getDefaultAudioSettings();

    const settings = JSON.parse(stored) as AudioSettingsStorage;
    return settings;
  } catch (error) {
    console.error('Failed to load audio settings:', error);
    return getDefaultAudioSettings();
  }
};

export const saveAudioSettings = async (settings: AudioSettingsStorage): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save audio settings:', error);
  }
};

/**
 * Welcome modal storage (first-time user onboarding)
 */

const WELCOME_SEEN_KEY = '@flowmate:welcome-seen';

export const hasSeenWelcome = async (): Promise<boolean> => {
  try {
    const seen = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return seen === 'true';
  } catch (error) {
    console.error('Failed to check welcome status:', error);
    return true; // Default to true (don't show) if storage fails
  }
};

export const markWelcomeSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
  } catch (error) {
    console.error('Failed to mark welcome as seen:', error);
  }
};

/**
 * Celebration settings storage
 */

export interface CelebrationSettings {
  confettiEnabled: boolean;
}

const CELEBRATION_SETTINGS_KEY = '@flowmate:celebration-settings';

export const getDefaultCelebrationSettings = (): CelebrationSettings => ({
  confettiEnabled: true,
});

export const loadCelebrationSettings = async (): Promise<CelebrationSettings> => {
  try {
    const stored = await AsyncStorage.getItem(CELEBRATION_SETTINGS_KEY);
    if (!stored) return getDefaultCelebrationSettings();

    const settings = JSON.parse(stored) as CelebrationSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load celebration settings:', error);
    return getDefaultCelebrationSettings();
  }
};

export const saveCelebrationSettings = async (settings: CelebrationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(CELEBRATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save celebration settings:', error);
  }
};

/**
 * Accessibility settings storage
 */

export interface AccessibilitySettings {
  reduceMotion: boolean;
  hapticsEnabled: boolean;
}

const ACCESSIBILITY_SETTINGS_KEY = '@flowmate:accessibility-settings';

export const getDefaultAccessibilitySettings = (): AccessibilitySettings => ({
  reduceMotion: false,
  hapticsEnabled: true,
});

export const loadAccessibilitySettings = async (): Promise<AccessibilitySettings> => {
  try {
    const stored = await AsyncStorage.getItem(ACCESSIBILITY_SETTINGS_KEY);
    if (!stored) return getDefaultAccessibilitySettings();

    const settings = JSON.parse(stored) as AccessibilitySettings;
    return settings;
  } catch (error) {
    console.error('Failed to load accessibility settings:', error);
    return getDefaultAccessibilitySettings();
  }
};

export const saveAccessibilitySettings = async (settings: AccessibilitySettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
  }
};

/**
 * Last session storage (for Quick-Start feature)
 */

import type { Session, TimerMode, TimerType } from '@flowmate/shared';

export interface LastSessionConfig {
  mode: TimerMode;
  sessions: Session[];
  timerType: TimerType;
  label: string;
  timestamp: number;
}

const LAST_SESSION_KEY = '@flowmate:last-session';

export const loadLastSession = async (): Promise<LastSessionConfig | null> => {
  try {
    const stored = await AsyncStorage.getItem(LAST_SESSION_KEY);
    if (!stored) return null;

    const config = JSON.parse(stored) as LastSessionConfig;
    return config;
  } catch (error) {
    console.error('Failed to load last session:', error);
    return null;
  }
};

export const saveLastSession = async (config: LastSessionConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_SESSION_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save last session:', error);
  }
};

/**
 * Focus lock settings storage
 */

export interface FocusLockSettings {
  enabled: boolean;
}

const FOCUS_LOCK_SETTINGS_KEY = '@flowmate:focus-lock-settings';

export const getDefaultFocusLockSettings = (): FocusLockSettings => ({
  enabled: false,
});

export const loadFocusLockSettings = async (): Promise<FocusLockSettings> => {
  try {
    const stored = await AsyncStorage.getItem(FOCUS_LOCK_SETTINGS_KEY);
    if (!stored) return getDefaultFocusLockSettings();

    const settings = JSON.parse(stored) as FocusLockSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load focus lock settings:', error);
    return getDefaultFocusLockSettings();
  }
};

export const saveFocusLockSettings = async (settings: FocusLockSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(FOCUS_LOCK_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save focus lock settings:', error);
  }
};

/**
 * Sensory preset storage
 */

export type SensoryPresetId = 'full' | 'gentle' | 'minimal' | 'silent';

export interface SensoryPresetSettings {
  selectedPreset: SensoryPresetId;
}

const SENSORY_PRESET_KEY = '@flowmate:sensory-preset';

export const getDefaultSensoryPresetSettings = (): SensoryPresetSettings => ({
  selectedPreset: 'full',
});

export const loadSensoryPresetSettings = async (): Promise<SensoryPresetSettings> => {
  try {
    const stored = await AsyncStorage.getItem(SENSORY_PRESET_KEY);
    if (!stored) return getDefaultSensoryPresetSettings();

    const settings = JSON.parse(stored) as SensoryPresetSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load sensory preset settings:', error);
    return getDefaultSensoryPresetSettings();
  }
};

export const saveSensoryPresetSettings = async (settings: SensoryPresetSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SENSORY_PRESET_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save sensory preset settings:', error);
  }
};
