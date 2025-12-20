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
