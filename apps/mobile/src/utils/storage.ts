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
