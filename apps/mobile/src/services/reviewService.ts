import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import {
  loadReviewPromptSettings,
  saveReviewPromptSettings,
  ReviewPromptSettings,
} from '../utils/storage';

const DAYS_SINCE_INSTALL_REQUIRED = 2;
const MIN_COMPLETED_SESSIONS = 3;
const DAYS_BETWEEN_DISMISSALS = 60;

/**
 * Get the current app version from Expo config
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/**
 * Initialize first launch timestamp if not set
 */
export async function initializeFirstLaunch(): Promise<void> {
  const settings = await loadReviewPromptSettings();
  if (settings.firstLaunchTimestamp === null) {
    await saveReviewPromptSettings({
      ...settings,
      firstLaunchTimestamp: Date.now(),
    });
  }
}

/**
 * Increment the completed focus sessions count
 */
export async function incrementCompletedSessions(): Promise<void> {
  const settings = await loadReviewPromptSettings();
  await saveReviewPromptSettings({
    ...settings,
    completedFocusSessions: settings.completedFocusSessions + 1,
  });
}

/**
 * Check if all eligibility criteria are met for showing review prompt
 */
export async function checkReviewEligibility(): Promise<boolean> {
  const settings = await loadReviewPromptSettings();
  const currentVersion = getAppVersion();

  // Condition a: At least 3 completed focus sessions
  if (settings.completedFocusSessions < MIN_COMPLETED_SESSIONS) {
    return false;
  }

  // Condition b: At least 2 full days since first install
  if (settings.firstLaunchTimestamp === null) {
    return false;
  }
  const daysSinceInstall = (Date.now() - settings.firstLaunchTimestamp) / (1000 * 60 * 60 * 24);
  if (daysSinceInstall < DAYS_SINCE_INSTALL_REQUIRED) {
    return false;
  }

  // Condition c: Have not asked in the current app version
  if (settings.lastPromptedVersion === currentVersion) {
    return false;
  }

  // Condition d: User has not dismissed in the last 60 days
  if (settings.lastDismissedTimestamp !== null) {
    const daysSinceDismissal = (Date.now() - settings.lastDismissedTimestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissal < DAYS_BETWEEN_DISMISSALS) {
      return false;
    }
  }

  return true;
}

/**
 * Check eligibility for debug mode (bypasses time constraints)
 */
export async function checkReviewEligibilityDebug(): Promise<{
  eligible: boolean;
  reasons: string[];
  settings: ReviewPromptSettings;
}> {
  const settings = await loadReviewPromptSettings();
  const currentVersion = getAppVersion();
  const reasons: string[] = [];

  if (settings.completedFocusSessions < MIN_COMPLETED_SESSIONS) {
    reasons.push(`Sessions: ${settings.completedFocusSessions}/${MIN_COMPLETED_SESSIONS}`);
  }

  if (settings.firstLaunchTimestamp === null) {
    reasons.push('First launch not recorded');
  } else {
    const daysSinceInstall = (Date.now() - settings.firstLaunchTimestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceInstall < DAYS_SINCE_INSTALL_REQUIRED) {
      reasons.push(`Days since install: ${daysSinceInstall.toFixed(1)}/${DAYS_SINCE_INSTALL_REQUIRED}`);
    }
  }

  if (settings.lastPromptedVersion === currentVersion) {
    reasons.push(`Already prompted in v${currentVersion}`);
  }

  if (settings.lastDismissedTimestamp !== null) {
    const daysSinceDismissal = (Date.now() - settings.lastDismissedTimestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissal < DAYS_BETWEEN_DISMISSALS) {
      reasons.push(`Days since dismissal: ${daysSinceDismissal.toFixed(1)}/${DAYS_BETWEEN_DISMISSALS}`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    settings,
  };
}

/**
 * Mark that the review prompt was shown for current version
 */
export async function markReviewPrompted(): Promise<void> {
  const settings = await loadReviewPromptSettings();
  await saveReviewPromptSettings({
    ...settings,
    lastPromptedVersion: getAppVersion(),
  });
}

/**
 * Mark that the user dismissed the review prompt
 */
export async function markReviewDismissed(): Promise<void> {
  const settings = await loadReviewPromptSettings();
  await saveReviewPromptSettings({
    ...settings,
    lastPromptedVersion: getAppVersion(),
    lastDismissedTimestamp: Date.now(),
  });
}

/**
 * Check if native review API is available and request review
 */
export async function requestNativeReview(): Promise<boolean> {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      if (__DEV__) console.log('Store review not available on this device');
      return false;
    }

    await StoreReview.requestReview();
    return true;
  } catch (error) {
    console.error('Failed to request store review:', error);
    return false;
  }
}

/**
 * Reset review prompt settings (for development/testing)
 */
export async function resetReviewSettings(): Promise<void> {
  await saveReviewPromptSettings({
    firstLaunchTimestamp: Date.now(),
    completedFocusSessions: 0,
    lastPromptedVersion: null,
    lastDismissedTimestamp: null,
  });
}
