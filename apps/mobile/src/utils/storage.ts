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
  tickSound: 'single' | 'alternating' | 'alternating2' | 'classic' | 'beep';
  muteAll: boolean;
  muteDuringBreaks: boolean;
  announcementInterval: 1 | 2 | 3 | 5 | 10;
  secondsCountdown: boolean;
  selectedProfile: 'silent' | 'minimal' | 'balanced' | 'detailed' | 'custom';
}

const AUDIO_SETTINGS_KEY = '@flowmate:audio-settings';

export const getDefaultAudioSettings = (): AudioSettingsStorage => ({
  tickVolume: 0.5,
  announcementVolume: 0.7,
  tickSound: 'classic',
  muteAll: false,
  muteDuringBreaks: false,
  announcementInterval: 1,
  secondsCountdown: true,
  selectedProfile: 'balanced',
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
