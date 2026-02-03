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
  skipFocusPrompt: boolean;
}

const ACCESSIBILITY_SETTINGS_KEY = '@flowmate:accessibility-settings';

export const getDefaultAccessibilitySettings = (): AccessibilitySettings => ({
  reduceMotion: false,
  hapticsEnabled: true,
  skipFocusPrompt: true, // Default to skipping - reduces friction for ADHD users
});

export const loadAccessibilitySettings = async (): Promise<AccessibilitySettings> => {
  try {
    const stored = await AsyncStorage.getItem(ACCESSIBILITY_SETTINGS_KEY);
    if (!stored) return getDefaultAccessibilitySettings();

    const settings = JSON.parse(stored) as Partial<AccessibilitySettings>;
    // Merge with defaults to handle migration of new properties
    return { ...getDefaultAccessibilitySettings(), ...settings };
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

export type SensoryPresetId = 'full' | 'gentle' | 'minimal' | 'silent' | 'highAlert' | 'custom';

export interface CustomSensoryConfig {
  tickSound: 'alternating' | 'classic' | 'beep' | 'none';
  tickVolume: number;
  announcements: boolean;
  announcementVolume: number;
  announcementInterval: 1 | 5 | 10;
  secondsCountdown: boolean;
  haptics: boolean;
  transitionWarning: boolean;
  transitionChime: boolean;
}

export interface SensoryPresetSettings {
  selectedPreset: SensoryPresetId;
  customConfig?: CustomSensoryConfig;
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

export const getDefaultCustomSensoryConfig = (): CustomSensoryConfig => ({
  tickSound: 'alternating',
  tickVolume: 0.5,
  announcements: true,
  announcementVolume: 0.7,
  announcementInterval: 5,
  secondsCountdown: false,
  haptics: true,
  transitionWarning: true,
  transitionChime: true, // Enabled since secondsCountdown is off by default
});

/**
 * Timer visual style storage
 */

export type TimerVisualStyle = 'thin' | 'circular' | 'thick' | 'gradient' | 'filling';

export interface TimerVisualSettings {
  selectedStyle: TimerVisualStyle;
}

const TIMER_VISUAL_KEY = '@flowmate:timer-visual';

export const getDefaultTimerVisualSettings = (): TimerVisualSettings => ({
  selectedStyle: 'thin',
});

export const loadTimerVisualSettings = async (): Promise<TimerVisualSettings> => {
  try {
    const stored = await AsyncStorage.getItem(TIMER_VISUAL_KEY);
    if (!stored) return getDefaultTimerVisualSettings();

    const settings = JSON.parse(stored) as TimerVisualSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load timer visual settings:', error);
    return getDefaultTimerVisualSettings();
  }
};

export const saveTimerVisualSettings = async (settings: TimerVisualSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(TIMER_VISUAL_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save timer visual settings:', error);
  }
};

/**
 * Timer display settings storage
 */

export interface TimerDisplaySettings {
  showElapsedTime: boolean;
}

const TIMER_DISPLAY_KEY = '@flowmate:timer-display';

export const getDefaultTimerDisplaySettings = (): TimerDisplaySettings => ({
  showElapsedTime: false,
});

export const loadTimerDisplaySettings = async (): Promise<TimerDisplaySettings> => {
  try {
    const stored = await AsyncStorage.getItem(TIMER_DISPLAY_KEY);
    if (!stored) return getDefaultTimerDisplaySettings();

    const settings = JSON.parse(stored) as TimerDisplaySettings;
    return settings;
  } catch (error) {
    console.error('Failed to load timer display settings:', error);
    return getDefaultTimerDisplaySettings();
  }
};

export const saveTimerDisplaySettings = async (settings: TimerDisplaySettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(TIMER_DISPLAY_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save timer display settings:', error);
  }
};

/**
 * Onboarding completion storage
 */

const ONBOARDING_COMPLETED_KEY = '@flowmate:onboarding-completed';

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    // Check if user completed new onboarding
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (completed === 'true') return true;

    // Migration: existing users who saw old welcome modal skip onboarding
    const sawOldWelcome = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    if (sawOldWelcome === 'true') {
      // Mark as completed so we don't check again
      await markOnboardingCompleted();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return true; // Default to completed if storage fails
  }
};

export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Failed to mark onboarding complete:', error);
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    await AsyncStorage.removeItem(WELCOME_SEEN_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
  }
};

/**
 * Contextual tips storage
 * Tracks which one-time tips have been shown to the user
 */

export type TipId = 'audio-menu' | 'break-purpose' | 'stats-intro' | 'quick-start';

const TIP_PREFIX = '@flowmate:tip:';

export const hasSeenTip = async (tipId: TipId): Promise<boolean> => {
  try {
    const seen = await AsyncStorage.getItem(`${TIP_PREFIX}${tipId}`);
    return seen === 'true';
  } catch (error) {
    console.error(`Failed to check tip status for ${tipId}:`, error);
    return true; // Default to seen if storage fails
  }
};

export const markTipSeen = async (tipId: TipId): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${TIP_PREFIX}${tipId}`, 'true');
  } catch (error) {
    console.error(`Failed to mark tip ${tipId} as seen:`, error);
  }
};

export const resetAllTips = async (): Promise<void> => {
  try {
    const tipIds: TipId[] = ['audio-menu', 'break-purpose', 'stats-intro', 'quick-start'];
    await Promise.all(tipIds.map(id => AsyncStorage.removeItem(`${TIP_PREFIX}${id}`)));
  } catch (error) {
    console.error('Failed to reset tips:', error);
  }
};

/**
 * Transition warning settings storage
 * Controls the "wrapping up" visual/haptic cues before session transitions
 */

export interface TransitionWarningSettings {
  /** Enable transition warning feature */
  enabled: boolean;
  /** Duration in seconds before session end to start warning (default: 60) */
  durationSeconds: number;
  /** Show visual amber tint during transition zone */
  visualWarning: boolean;
  /** Show "Wrapping up..." label */
  showLabel: boolean;
  /** Haptic feedback at 60s and 30s marks */
  hapticWarning: boolean;
  /** Play a chime at 30s (for users with seconds countdown OFF) */
  transitionChime: boolean;
}

const TRANSITION_WARNING_KEY = '@flowmate:transition-warning';

export const getDefaultTransitionWarningSettings = (): TransitionWarningSettings => ({
  enabled: true,
  durationSeconds: 60,
  visualWarning: true,
  showLabel: true,
  hapticWarning: true,
  transitionChime: false, // Off by default since seconds countdown handles this
});

export const loadTransitionWarningSettings = async (): Promise<TransitionWarningSettings> => {
  try {
    const stored = await AsyncStorage.getItem(TRANSITION_WARNING_KEY);
    if (!stored) return getDefaultTransitionWarningSettings();

    const settings = JSON.parse(stored) as Partial<TransitionWarningSettings>;
    // Merge with defaults to handle migration of new properties
    return { ...getDefaultTransitionWarningSettings(), ...settings };
  } catch (error) {
    console.error('Failed to load transition warning settings:', error);
    return getDefaultTransitionWarningSettings();
  }
};

export const saveTransitionWarningSettings = async (settings: TransitionWarningSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRANSITION_WARNING_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save transition warning settings:', error);
  }
};

/**
 * Review prompt settings storage
 * Tracks when and whether to show the in-app review prompt
 */

export interface ReviewPromptSettings {
  /** Timestamp of first app launch (for "2 days since install" check) */
  firstLaunchTimestamp: number | null;
  /** Number of completed focus sessions */
  completedFocusSessions: number;
  /** App version when we last showed the prompt */
  lastPromptedVersion: string | null;
  /** Timestamp when user last dismissed the prompt */
  lastDismissedTimestamp: number | null;
}

const REVIEW_PROMPT_KEY = '@flowmate:review-prompt';

export const getDefaultReviewPromptSettings = (): ReviewPromptSettings => ({
  firstLaunchTimestamp: null,
  completedFocusSessions: 0,
  lastPromptedVersion: null,
  lastDismissedTimestamp: null,
});

export const loadReviewPromptSettings = async (): Promise<ReviewPromptSettings> => {
  try {
    const stored = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    if (!stored) return getDefaultReviewPromptSettings();

    const settings = JSON.parse(stored) as Partial<ReviewPromptSettings>;
    return { ...getDefaultReviewPromptSettings(), ...settings };
  } catch (error) {
    console.error('Failed to load review prompt settings:', error);
    return getDefaultReviewPromptSettings();
  }
};

export const saveReviewPromptSettings = async (settings: ReviewPromptSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save review prompt settings:', error);
  }
};
